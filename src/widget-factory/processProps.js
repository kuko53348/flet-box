// // core/processProps.js
// import { translateProps } from "./translateProps.js";
// import { cleanStyles, cleanProps } from "./unitTool.js";
//
// /**
//  * Processes custom props: translates, separates, and cleans
//  * @param {Object} props - Custom props (with shorthands)
//  * @returns {Object} Processed props { style, textContent, events, attributes }
//  */
// export const processProps = (props) => {
//   const domProps = translateProps(props);
//   const { style, textContent, events, attributes } = cleanProps(domProps);
//   return { style: cleanStyles(style), textContent, events, attributes };
// };
//
// export default processProps;
// core/processProps.js
// core/processProps.js
import { propMap } from "./translateProps.js";
import {
  REM_PROPS,
  NO_UNIT_PROPS,
  PX_PROPS,
  SPECIAL_ATTRIBUTES,
} from "./unitTool.js"; // ✅ import unified set

const isNumeric = (value) => typeof value === "number" && !isNaN(value);

/**
 * Applies the correct CSS unit to a numeric value
 */
const applyUnit = (key, value) => {
  if (!isNumeric(value)) return value;
  if (REM_PROPS.has(key)) return `${value / 16}rem`;
  if (NO_UNIT_PROPS.has(key)) return value;
  return `${value}px`; // default: px
};

/**
 * Expands spacing shorthands into individual CSS properties
 * @param {string} domKey - The translated DOM property key
 * @param {*} value - The value to apply
 * @param {Object} style - The style object to mutate
 * @returns {boolean} true if the key was handled
 */
const expandSpacing = (domKey, value, style) => {
  const apply = (prop, val) => {
    style[prop] = applyUnit(prop, val);
  };

  switch (domKey) {
    case "paddingHorizontal":
      apply("paddingLeft", value);
      apply("paddingRight", value);
      return true;
    case "paddingVertical":
      apply("paddingTop", value);
      apply("paddingBottom", value);
      return true;
    case "marginHorizontal":
      apply("marginLeft", value);
      apply("marginRight", value);
      return true;
    case "marginVertical":
      apply("marginTop", value);
      apply("marginBottom", value);
      return true;
    default:
      return false;
  }
};

/**
 * Processes custom props: translates, separates, and cleans
 * @param {Object} props - Custom props (with shorthands)
 * @returns {Object} Processed props { style, textContent, events, attributes }
 */
export const processProps = (props) => {
  const style = {};
  const events = {};
  const attributes = {};
  let textContent = null;

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    const domKey = propMap[key] || key;

    // 1. Text content
    if (domKey === "textContent" && typeof value === "string") {
      textContent = value;
      continue;
    }

    // 2. Events (onClick, onPress, etc.)
    if (domKey.startsWith("on") && typeof value === "function") {
      const eventName = domKey.slice(2).toLowerCase();
      events[eventName] = value;
      continue;
    }

    // 3. Special attributes (using the unified set from unitTool)
    if (SPECIAL_ATTRIBUTES.has(domKey)) {
      attributes[domKey] = value;
      continue;
    }

    // 4. Expand spacing shorthands (paddingHorizontal, etc.)
    if (expandSpacing(domKey, value, style)) {
      continue; // already added to style
    }

    // 5. Everything else → style
    if (Array.isArray(value)) {
      style[domKey] = value.map((v) => (isNumeric(v) ? `${v}px` : v)).join(" ");
      continue;
    }

    if (isNumeric(value)) {
      style[domKey] = applyUnit(domKey, value);
      continue;
    }

    style[domKey] = value;
  }

  return { style, textContent, events, attributes };
};

export default processProps;
