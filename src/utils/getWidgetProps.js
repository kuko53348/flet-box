// utils/getWidgetProps.js

/**
 * Gets the current props of a widget
 * @param {HTMLElement} widget - The widget to inspect
 * @returns {Object} Dictionary with the widget's props
 *
 * @example
 * const props = getWidgetProps(myButton);
 * // { text: 'Click', variant: 'filled', color: '#007aff' }
 */
export const getWidgetProps = (widget) => {
  return { ...(widget._props || {}) };
};

/**
 * Gets a specific prop from a widget
 * @param {HTMLElement} widget - The widget to inspect
 * @param {string} propName - Name of the prop
 * @returns {any} Prop value or undefined
 */
export const getWidgetProp = (widget, propName) => {
  return widget._props ? widget._props[propName] : undefined;
};

/**
 * Gets all props as a formatted string
 * @param {HTMLElement} widget - The widget to inspect
 * @returns {string} Formatted props string
 */
export const stringifyWidgetProps = (widget) => {
  return JSON.stringify(widget._props || {}, null, 2);
};

export default { getWidgetProps, getWidgetProp, stringifyWidgetProps };
