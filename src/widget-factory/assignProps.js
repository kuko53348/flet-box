// core/assignProps.js
import { setStyles } from "./tools.js";

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
const getValue = (val) => {
  if (typeof val === "function" && val._isReactive) {
    return val();
  }
  if (val && typeof val === "object" && val._isReactive === true) {
    return val._value !== undefined ? val._value : val.valueOf();
  }
  return val;
};

/**
 * Applies a single "special" shorthand prop directly to the widget's style or
 * dataset. Handles cases that are not pure CSS assignments, such as `value` for
 * form elements, `variant` as a dataset attribute, and axis-aligned margin /
 * padding shorthands.
 *
 * @param {HTMLElement} widget - The target DOM element.
 * @param {string} key - The special prop name (e.g. `'marginVertical'`).
 * @param {*} value - The raw value (resolved via `getValue` internally).
 * @returns {void}
 */
const applySpecial = (widget, key, value) => {
  const val = getValue(value);
  const px = typeof val === "number" ? val + "px" : val;

  switch (key) {
    case "value":
      if (widget.tagName === "INPUT" || widget.tagName === "TEXTAREA") {
        if (widget.value !== val) widget.value = val;
      }
      break;
    case "variant":
      widget.dataset.variant = val;
      break;
    case "style":
      if (val && typeof val === "object" && !Array.isArray(val)) {
        setStyles(widget, val);
      }
      break;
    case "marginVertical":
      widget.style.marginTop = px;
      widget.style.marginBottom = px;
      break;
    case "marginHorizontal":
      widget.style.marginLeft = px;
      widget.style.marginRight = px;
      break;
    case "paddingVertical":
      widget.style.paddingTop = px;
      widget.style.paddingBottom = px;
      break;
    case "paddingHorizontal":
      widget.style.paddingLeft = px;
      widget.style.paddingRight = px;
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
 *    `className`, `disabled`, `checked`, and `selected`.
 * 5. **special** – delegated to `applySpecial` for non-trivial shorthands.
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
    if (props.textContent !== undefined) {
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
          } else if (
            key === "disabled" ||
            key === "checked" ||
            key === "selected"
          ) {
            widget[key] = Boolean(finalValue);
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
