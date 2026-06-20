// core/processProps.js
import { getPropDefinition, ATTRIBUTE_DOM_SET } from "./translateProps.js";

export const processProps = (props, tag = "div") => {
  const style = {};
  const events = {};
  const attributes = {};
  let textContent = null;

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    const def = getPropDefinition(key);

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
          // Si es 'value' y el tag es input/textarea/select → va a atributos
          if (
            key === "value" &&
            ["input", "textarea", "select"].includes(tag)
          ) {
            attributes["value"] = value;
          } else {
            textContent = value;
          }
          break;
        case "special":
          // handled elsewhere
          break;
        default:
          console.warn(`⚠️ Unknown type "${def.type}" for prop "${key}"`);
      }
    } else {
      // Unknown prop → fallback
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

  return { style, events, attributes, textContent };
};

// core/processProps.js
function applyUnit(def, value) {
  if (value === true) return 1;
  if (value === false) return 0;
  if (typeof value !== "number") return value;
  const unit = def.unit || "px";
  if (unit === "none") return value;
  if (unit === "rem") return `${value / 16}rem`;
  return `${value}px`;
}
