// utils/stackPosition.js

/**
 * Reads `top`, `right`, `bottom`, and `left` from `props` and stores them as
 * `dataset` attributes on the widget element so that a parent `Stack` widget
 * can position this child absolutely at render time.
 *
 * @param {HTMLElement} widget - The widget element to annotate.
 * @param {Object} props - Props object that may contain `top`, `right`, `bottom`, and/or `left`.
 * @param {number|string} [props.top]    - Distance from the top edge (px or CSS string).
 * @param {number|string} [props.right]  - Distance from the right edge (px or CSS string).
 * @param {number|string} [props.bottom] - Distance from the bottom edge (px or CSS string).
 * @param {number|string} [props.left]   - Distance from the left edge (px or CSS string).
 * @returns {HTMLElement} The same `widget` reference, with dataset attributes set.
 */
export const stackPosition = (widget, props) => {
  const top = props.top;
  const right = props.right;
  const bottom = props.bottom;
  const left = props.left;

  // Store position in dataset so the parent Stack can read it later
  if (top !== undefined) widget.dataset.top = top;
  if (right !== undefined) widget.dataset.right = right;
  if (bottom !== undefined) widget.dataset.bottom = bottom;
  if (left !== undefined) widget.dataset.left = left;

  return widget;
};

export default stackPosition;
