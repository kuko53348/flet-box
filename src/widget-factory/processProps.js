// core/processProps.js
import { getPropDefinition, ATTRIBUTE_DOM_SET } from "./translateProps.js";

/**
 * Processes raw props and classifies them into:
 * - style       : CSS properties
 * - events      : DOM event listeners
 * - attributes  : HTML attributes
 * - textContent : text content
 *
 * @param {Object} props - Raw props object
 * @param {string} tag - HTML tag of the widget (e.g., 'div', 'span', 'input')
 * @returns {{ style, events, attributes, textContent }}
 */
export const processProps = (props, tag = "div") => {
  const style = {};
  const events = {};
  const attributes = {};
  let textContent = null;

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    const def = getPropDefinition(key);

    if (def) {
      // Known prop → classify by its type
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
          textContent = value;
          break;
        case "special":
          // handled elsewhere (child, children, ref, style)
          break;
        default:
          console.warn(`⚠️ Unknown type "${def.type}" for prop "${key}"`);
      }
    } else {
      // Unknown prop → intelligent fallback based on tag
      // SPECIAL CASES:
      // - "value" in non-input elements → treat as textContent
      // - "name" in spans (like icons) → treat as textContent
      if (key === "value" && !isInputTag(tag)) {
        textContent = value;
      } else if (key === "name" && tag === "span") {
        textContent = value;
      } else if (key.startsWith("data-") || key.startsWith("aria-")) {
        // Custom data/aria attributes
        attributes[key] = value;
      } else if (key.startsWith("on") && typeof value === "function") {
        // Inline event handlers (fallback)
        const eventName = key.slice(2).toLowerCase();
        events[eventName] = value;
      } else if (ATTRIBUTE_DOM_SET.has(key)) {
        // Known HTML attributes (even if not in the database)
        attributes[key] = value;
      } else {
        // Everything else → CSS style
        style[key] = value;
      }
    }
  }

  return { style, events, attributes, textContent };
};

/**
 * Checks if the tag is an input-like element where "value" should be an attribute.
 */
function isInputTag(tag) {
  const inputTags = ["input", "textarea", "select"];
  return inputTags.includes(tag);
}

/**
 * Applies the correct CSS unit to a numeric value.
 */
function applyUnit(def, value) {
  if (typeof value !== "number") return value;
  const unit = def.unit || "px";
  if (unit === "none") return value;
  if (unit === "rem") return `${value / 16}rem`;
  return `${value}px`; // default
}
