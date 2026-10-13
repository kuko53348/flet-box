// core/assignProps.js
import { setStyles } from "./tools.js";
import { resolveReactive } from "./reactiveValue.js";

/**
 * Extracts the real value from a prop that may be a reactive accessor or a
 * plain reactive object.
 *
 * - If the value is a function flagged with `_isReactive`, calls it to get the
 *   current value.
 * - If the value is a reactive object (has `_isReactive === true`), returns
 *   `_value` when available, otherwise falls back to `valueOf()`.
 * - Otherwise returns the value unchanged.
 *
 * @param {*} val - The raw prop value (may be reactive or plain).
 * @returns {*} The resolved runtime value.
 */
const getValue = resolveReactive;

/**
 * HTML attributes whose mere presence means "true". Writing them through
 * `setAttribute` with a falsy value is wrong — `setAttribute("readonly", false)`
 * leaves the attribute present (`readonly="false"`) and the field stays
 * read-only. These are written as DOM properties instead, so passing `false`
 * removes the attribute.
 *
 * @type {Set<string>}
 */
const BOOLEAN_ATTRIBUTES = new Set([
  "disabled",
  "checked",
  "selected",
  "readOnly",
  "required",
  "autofocus",
  "hidden",
  "draggable",
]);

/**
 * Applies a single "special" prop directly to the widget. Handles cases that
 * are not pure CSS assignments, such as `value` for form elements and `variant`
 * as a dataset attribute.
 *
 * @param {HTMLElement} widget - The target DOM element.
 * @param {string} key - The special prop name (e.g. `'variant'`).
 * @param {*} value - The raw value (resolved via `getValue` internally).
 * @returns {void}
 */
const applySpecial = (widget, key, value) => {
  const val = getValue(value);

  switch (key) {
    case "value":
      if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
        if (widget.value !== val) widget.value = val;
      }
      break;
    case "variant":
      widget.dataset.variant = val;
      break;
  }
};

/**
 * Applies a processed props object to a widget element.
 *
 * Handles five prop categories in order:
 * 1. **style** – merged into the element's inline style via `setStyles`.
 * 2. **textContent** – set as `value` on form elements, `textContent` elsewhere.
 * 3. **events** – previous listeners are removed and the new set is attached.
 *    `click` is assigned via `onclick` for reliable override behaviour.
 * 4. **attributes** – applied with `setAttribute`, with special handling for
 *    `className` and boolean attributes (`disabled`, `readOnly`, `hidden`, …).
 * 5. **special** – delegated to `applySpecial` (e.g. `value`, `variant`).
 *
 * Any keys not in the known set are handled as a flat-prop fallback: `on*`
 * functions become event listeners, common HTML attributes are set directly, and
 * everything else is tried as an inline style.
 *
 * The `_updating` guard prevents re-entrant calls from triggering reactive
 * side-effects during the assignment.
 *
 * @param {HTMLElement} widget - The target DOM element.
 * @param {Object|null} props - Processed props object from `processProps`, or
 *   `null` / `undefined` to no-op.
 * @returns {HTMLElement} The same widget (for chaining).
 */
export const assignProps = (widget, props) => {
  if (!props) return widget;

  const wasUpdating = widget._updating;
  widget._updating = true;

  try {
    // ============================================================
    // 1. STYLES
    // ============================================================
    if (props.style && Object.keys(props.style).length > 0) {
      setStyles(widget, props.style);
    }

    // ============================================================
    // 2. TEXT
    // ============================================================
    // `null` is `processProps`' sentinel for "this prop set carries no text".
    // Only an explicitly present value (including "") may touch textContent:
    // assigning null stringifies to "" and therefore REMOVES every child, which
    // silently wiped widgets on any `update()` that did not re-pass `child`.
    if (props.textContent !== undefined && props.textContent !== null) {
      const textValue = getValue(props.textContent);
      if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
        if (widget.value !== textValue) widget.value = textValue;
      } else {
        if (widget.textContent !== textValue) widget.textContent = textValue;
      }
    }

    // ============================================================
    // 3. EVENTS
    // ============================================================
    // Remove all previously registered listeners before adding the new ones.
    if (widget._events && widget._events.length > 0) {
      widget._events.forEach(({ event, handler }) => {
        widget.removeEventListener(event, handler);
      });
      widget._events = [];
    }
    
    widget.onclick = null;

    if (props.events && Object.keys(props.events).length > 0) {
      Object.entries(props.events).forEach(([event, handler]) => {
        if (typeof handler !== "function") return;
        if (event === "click") {
          widget.onclick = handler;
        } else {
          widget.addEventListener(event, handler);
          widget._events.push({ event, handler });
        }
      });
    }

    // ============================================================
    // 4. ATTRIBUTES
    // ============================================================
    if (props.attributes && Object.keys(props.attributes).length > 0) {
      Object.entries(props.attributes).forEach(([key, value]) => {
        const finalValue = getValue(value);
        try {
          if (key === "className" || key === "class") {
            widget.className = finalValue;
          } else if (BOOLEAN_ATTRIBUTES.has(key)) {
            widget[key] =
              typeof finalValue === "boolean"
                ? finalValue
                : Boolean(finalValue);
          } else {
            widget.setAttribute(key, finalValue);
          }
        } catch (e) {
          // Invalid attribute – silently skip
        }
      });
    }

    // ============================================================
    // 5. SPECIALS
    // ============================================================
    if (props.special) {
      for (const [key, value] of Object.entries(props.special)) {
        applySpecial(widget, key, value);
      }
    }

    // ============================================================
    // 6. FALLBACK FOR FLAT PROPS
    // ============================================================
    // Props not belonging to any known category are handled here as a best-
    // effort: event handlers, common HTML attributes, and inline CSS.
    const knownKeys = new Set([
      "style",
      "events",
      "attributes",
      "textContent",
      "special",
      "child",
      "children",
      "ref",
    ]);

    const extraKeys = Object.keys(props).filter((key) => !knownKeys.has(key));
    if (extraKeys.length > 0) {
      for (const key of extraKeys) {
        const value = props[key];
        if (value === undefined || value === null) continue;

        if (key.startsWith("on") && typeof value === "function") {
          const eventName = key.slice(2).toLowerCase();
          if (eventName === "click") {
            widget.onclick = value;
          } else {
            widget.addEventListener(eventName, value);
            widget._events.push({ event: eventName, handler: value });
          }
        } else if (
          [
            "className",
            "class",
            "id",
            "type",
            "href",
            "src",
            "alt",
            "title",
            "role",
          ].includes(key)
        ) {
          const finalValue = getValue(value);
          if (key === "className" || key === "class") {
            widget.className = finalValue;
          } else {
            try {
              widget.setAttribute(key, finalValue);
            } catch (e) {}
          }
        } else if (key === "text" || key === "label" || key === "caption") {
          const textValue = getValue(value);
          if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
            if (widget.value !== textValue) widget.value = textValue;
          } else {
            if (widget.textContent !== textValue) widget.textContent = textValue;
          }
        } else {
          const finalValue = getValue(value);
          const cssValue =
            typeof finalValue === "number" ? finalValue + "px" : finalValue;
          try {
            widget.style[key] = cssValue;
          } catch (e) {}
        }
      }
    }
  } catch (error) {
    console.error("❌ [assignProps] Error:", error);
  } finally {
    widget._updating = wasUpdating;
  }

  return widget;
};

export default assignProps;
