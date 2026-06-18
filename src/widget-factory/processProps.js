// core/processProps.js
import { translateProps } from "./translateProps.js";
import { cleanStyles, cleanProps } from "./unitTool.js";

/**
 * Processes custom props: translates, separates, and cleans
 * @param {Object} props - Custom props (with shorthands)
 * @returns {Object} Processed props { style, textContent, events, attributes }
 */
export const processProps = (props) => {
  if (!props || typeof props !== "object") {
    return { style: {}, textContent: null, events: {}, attributes: {} };
  }

  // ✅ Handle expand GLOBALLY
  const processedProps = { ...props };

  if (processedProps.expand === true) {
    // expand: true → flex: 1, width: 100%, height: 100%
    processedProps.flex = 1;
    processedProps.width = "100%";
    processedProps.height = "100%";
    delete processedProps.expand;
  }

  const domProps = translateProps(processedProps);
  const { style, textContent, events, attributes } = cleanProps(domProps);

  // ✅ Ensure flex: 1 doesn't get converted to px
  const cleanStyle = cleanStyles(style);

  return { style: cleanStyle, textContent, events, attributes };
};

export default processProps;
