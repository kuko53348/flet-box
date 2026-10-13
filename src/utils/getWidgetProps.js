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
  // The factory stores props in `_originalProps`. `_props` was never written by
  // anything, so this always returned `{}` — Inspector printed no props at all.
  return { ...(widget._originalProps || {}) };
};

/**
 * Gets a specific prop from a widget
 * @param {HTMLElement} widget - The widget to inspect
 * @param {string} propName - Name of the prop
 * @returns {any} Prop value or undefined
 */
export const getWidgetProp = (widget, propName) => {
  return widget._originalProps ? widget._originalProps[propName] : undefined;
};

/**
 * Gets all props as a formatted string
 * @param {HTMLElement} widget - The widget to inspect
 * @returns {string} Formatted props string
 */
export const stringifyWidgetProps = (widget) => {
  return JSON.stringify(widget._originalProps || {}, null, 2);
};

export default { getWidgetProps, getWidgetProp, stringifyWidgetProps };
