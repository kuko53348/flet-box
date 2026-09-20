// core/reactivity.js
import { REACTIVE_PROPS } from "./translateProps.js";

/**
 * Tags where `width` and `height` are native IDL attributes with their own
 * semantics (intrinsic size, aspect-ratio, etc.). Overriding them with a custom
 * `defineProperty` accessor would break that native behaviour, so these props
 * are NOT shadowed on these tags.
 *
 * @type {Set<string>}
 */
const REPLACED_ELEMENT_TAGS = new Set([
  "img",
  "canvas",
  "video",
  "iframe",
  "embed",
  "object",
  "source",
]);

/**
 * Props that must NEVER be shadowed with a custom accessor because the browser
 * maintains live, user-controlled state for them. For example, shadowing `value`
 * on an `<input>` would disconnect `widget.value` from what the user is actually
 * typing.
 *
 * @type {Set<string>}
 */
const NEVER_SHADOW = new Set(["value"]);

/**
 * Installs reactive property accessors on a widget for every prop in
 * `REACTIVE_PROPS`, excluding those guarded by `NEVER_SHADOW` and those that
 * conflict with native IDL attributes on replaced elements.
 *
 * Each accessor follows this contract:
 * - **getter** – returns the prop's current value from `_originalProps`.
 * - **setter** – writes the new value to `_originalProps` and calls `updateFn`
 *   with a partial change object `{ [prop]: newValue }` only when the value
 *   actually changed (strict equality check prevents redundant updates).
 *
 * Additionally, for `<input>`, `<textarea>`, and `<select>` elements, syncs the
 * DOM's own `value` back into `_originalProps` on every `input` and `change`
 * event so that the stored props always reflect the live field content.
 *
 * @param {HTMLElement} widget - The widget to make reactive.
 * @param {function(Object): void} updateFn - Callback invoked with the changed
 *   partial props whenever a reactive prop is set. Typically calls
 *   `widget.update(changedProps)`.
 * @returns {HTMLElement} The same widget (for chaining).
 */
export const makeReactive = (widget, updateFn) => {
  const tag = widget.tagName ? widget.tagName.toLowerCase() : "";

  REACTIVE_PROPS.forEach((prop) => {
    if (NEVER_SHADOW.has(prop)) return;

    if (
      (prop === "width" || prop === "height") &&
      REPLACED_ELEMENT_TAGS.has(tag)
    ) {
      return;
    }

    Object.defineProperty(widget, prop, {
      get() {
        return widget._originalProps ? widget._originalProps[prop] : undefined;
      },
      set(newValue) {
        if (!widget._originalProps) return;
        const current = widget._originalProps[prop];
        if (current === newValue) return;

        widget._originalProps[prop] = newValue;
        updateFn({ [prop]: newValue });
      },
      enumerable: true,
      configurable: true,
    });
  });

  // For form elements, keep _originalProps in sync with the live DOM value so
  // that getProps() always returns what the user has typed.
  if (tag === "input" || tag === "textarea" || tag === "select") {
    const syncValueFromDOM = () => {
      if (widget._originalProps) {
        widget._originalProps.value = widget.value;
      }
    };
    widget.addEventListener("input", syncValueFromDOM);
    widget.addEventListener("change", syncValueFromDOM);
  }

  return widget;
};

export default { makeReactive, REACTIVE_PROPS };
