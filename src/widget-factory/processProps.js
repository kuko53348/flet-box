// core/processProps.js
import { getPropDefinition, ATTRIBUTE_DOM_SET } from "./translateProps.js";
import { toREM } from "./remTool.js"; // ✅ Importar herramienta centralizada

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
 * @returns {{ style, events, attributes, textContent, special }}
 */
export const processProps = (props, tag = "div") => {
  const style = {};
  const events = {};
  const attributes = {};
  const special = {};
  let textContent = null;

  // Derive widget name from tag (e.g., 'div' → 'Div', 'span' → 'Span')
  const widgetName = tag.charAt(0).toUpperCase() + tag.slice(1);

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    // Pass widget name context for better warnings
    const def = getPropDefinition(key, { widgetName });

    if (def) {
      switch (def.type) {
        case "style":
          style[def.domProp] = applyUnit(def, value);
          break;
        case "attribute":
          attributes[def.domProp] = value;
          break;
        case "event":
          events[def.domProp] = value;
          break;
        case "text":
          // Special: 'value' in input-like elements must be handled as special
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
          // Guardar props especiales para que assignProps las maneje
          special[def.domProp] = value;
          break;
        default:
          console.warn(`⚠️ Unknown type "${def.type}" for prop "${key}"`);
      }
    } else {
      // Unknown prop → intelligent fallback
      if (key.startsWith("data-") || key.startsWith("aria-")) {
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
 * Applies the correct CSS unit to a numeric value.
 *
 * @param {Object} def - Prop definition from the database
 * @param {*} value - The value to convert
 * @returns {string|number} Value with correct CSS unit
 */
function applyUnit(def, value) {
  if (value === true) return 1;
  if (value === false) return 0;
  if (typeof value !== "number") return value;
  const unit = def.unit || "px";
  if (unit === "none") return value;
  
  // ✅ Utiliza el conversor dinámico en lugar de la división rígida
  if (unit === "rem") return toREM(value); 
  
  return `${value}px`;
}