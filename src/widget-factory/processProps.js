// core/processProps.js
import { getPropDefinition, ATTRIBUTE_DOM_SET, PASSTHROUGH_PREFIXES } from "./translateProps.js";
import { toREM } from "./remTool.js"; // Centralized REM conversion utility
import { resolveReactive } from "./reactiveValue.js";

/**
 * Processes raw props and classifies them into:
 * - style       : CSS properties
 * - events      : DOM event listeners
 * - attributes  : HTML attributes
 * - textContent : text content
 * - special     : special props (like value for inputs) that need custom handling
 *
 * @param {Object} props - Raw props object
 * @param {string} tag - HTML tag of the widget (e.g., 'div', 'span', 'input')
 * @param {string} [widgetName] - Real FletBox widget name (e.g., 'QRCode'),
 *   used only to produce readable warnings. Falls back to the capitalized tag.
 * @returns {{ style: Object, events: Object, attributes: Object, textContent: *, special: Object }}
 */
export const processProps = (props, tag = "div", widgetName = null) => {
  const style = {};
  const events = {};
  const attributes = {};
  const special = {};
  let textContent = null;

  // Derive widget name from tag (e.g., 'div' → 'Div', 'span' → 'Span')
  const name = widgetName || tag.charAt(0).toUpperCase() + tag.slice(1);

  for (const [key, rawValue] of Object.entries(props)) {
    if (rawValue === undefined || rawValue === null) continue;
    // Resolve the reactive-prop protocol once, here. A live value must be READ
    // now so `width: count` yields a number (and gets its px/rem unit), and a
    // function must never reach a CSS assignment.
    const value = resolveReactive(rawValue);

    // `style` is deliberately NOT part of the API: FletBox uses flat, aliased
    // CSS props. Fail loudly instead of silently ignoring the object.
    if (key === "style") {
      console.warn(
        `⚠️ [${name}] The \`style\` prop is not supported. Pass CSS props flat ` +
          `(e.g. backgroundColor, padding, flexDirection).`,
      );
      continue;
    }

    // Pass widget name context for better warnings
    const def = getPropDefinition(key, { widgetName: name });

    if (def) {
      switch (def.type) {
        case "style": {
          // Shorthands may fan out to several CSS props (e.g. `px` →
          // paddingLeft + paddingRight). Everything else writes to its domProp.
          const cssValue = applyUnit(def, value);
          if (cssValue === undefined) break;
          const targets = def.targets || [def.domProp];
          for (const target of targets) style[target] = cssValue;
          break;
        }
        case "attribute":
          attributes[def.domProp] = value;
          break;
        case "event":
          events[def.domProp] = value;
          break;
        case "text":
          // 'value' on input-like elements must be handled as a special prop,
          // not as text content, to avoid conflicting with the DOM's own value.
          if (
            key === "value" &&
            ["input", "textarea", "select"].includes(tag)
          ) {
            special[def.domProp] = value;
          } else {
            textContent = value;
          }
          break;
        case "special":
          // Store special props so assignProps can handle them with custom logic.
          special[def.domProp] = value;
          break;
        default:
          console.warn(`⚠️ Unknown type "${def.type}" for prop "${key}"`);
      }
    } else {
      // Unknown prop → intelligent fallback
      if (PASSTHROUGH_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        attributes[key] = value;
      } else if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.slice(2).toLowerCase();
        events[eventName] = value;
      } else if (ATTRIBUTE_DOM_SET.has(key)) {
        attributes[key] = value;
      } else {
        style[key] = value;
      }
    }
  }

  return { style, events, attributes, textContent, special };
};

/**
 * Applies the correct CSS unit to a numeric value based on the prop definition.
 *
 * - A prop with `boolValues` maps `true`/`false` to the CSS the property
 *   actually accepts (e.g. `wrap: true` → `flex-wrap: wrap`); an `undefined`
 *   mapping skips the assignment.
 * - `true` / `false` are coerced to `1` / `0` (unitless).
 * - Non-numeric values pass through unchanged.
 * - `unit: "none"` returns the raw number without a suffix.
 * - `unit: "rem"` delegates to the centralized `toREM` converter.
 * - All other units default to `"px"`.
 *
 * @param {Object} def - Prop definition from the prop database (see `translateProps.js`).
 * @param {*} value - The value to convert.
 * @returns {string|number|undefined} Value with the correct CSS unit applied.
 */
function applyUnit(def, value) {
  if (def.boolValues && typeof value === "boolean") {
    return def.boolValues[String(value)];
  }
  if (value === true) return 1;
  if (value === false) return 0;
  if (typeof value !== "number") return value;
  const unit = def.unit || "px";
  if (unit === "none") return value;
  
  // Use the dynamic REM converter instead of a hard-coded division.
  if (unit === "rem") return toREM(value); 
  
  return `${value}px`;
}
