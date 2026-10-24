// core/stackPosition.js
import { toREM } from "./remTool.js";

/**
 * Applies positioning for Stack layout
 * @param {HTMLElement} widget - The widget to position
 * @param {Object} props - Widget props
 * @returns {HTMLElement} The widget with position applied
 *
 * @example
 * stackPosition(element, { position: 'stack', top: 10, left: 20 })
 * // → element.style.position = 'absolute'
 * // → element.style.top = '0.625rem'
 * // → element.style.left = '1.25rem'
 */
export const stackPosition = (widget, props) => {
  // Numeric offsets follow the framework-wide rule: numbers are pixels on a
  // 16px base, emitted as rem so they scale with the root font size.
  const offset = (value) => (typeof value === "number" ? toREM(value) : value);

  // Only apply if position is 'stack'
  if (props.position !== "stack") {
    return widget;
  }

  // Absolute positioning
  widget.style.position = "absolute";

  // `centerX` + `centerY` must compose: writing each transform as it is found
  // would let the second one erase the first.
  const transforms = [];

  // Process each position prop
  for (const [key, value] of Object.entries(props)) {
    if (key === "position") continue;
    // The placement shorthands are booleans: a present `false` means "do not
    // apply", not "the key exists".
    if (value === false) continue;

    switch (key) {
      case "top":
        widget.style.top = offset(value);
        break;
      case "right":
        widget.style.right = offset(value);
        break;
      case "bottom":
        widget.style.bottom = offset(value);
        break;
      case "left":
        widget.style.left = offset(value);
        break;
      case "start":
        widget.style.left = offset(value);
        break;
      case "end":
        widget.style.right = offset(value);
        break;
      case "centerX":
        widget.style.left = "50%";
        transforms.push("translateX(-50%)");
        break;
      case "centerY":
        widget.style.top = "50%";
        transforms.push("translateY(-50%)");
        break;
      case "center":
        widget.style.top = "50%";
        widget.style.left = "50%";
        transforms.push("translate(-50%, -50%)");
        break;
      case "fullWidth":
        widget.style.width = "100%";
        widget.style.left = "0";
        widget.style.right = "0";
        break;
      case "fullHeight":
        widget.style.height = "100%";
        widget.style.top = "0";
        widget.style.bottom = "0";
        break;
      case "full":
        widget.style.width = "100%";
        widget.style.height = "100%";
        widget.style.top = "0";
        widget.style.left = "0";
        break;
    }
  }

  if (transforms.length) {
    // `center` already covers both axes; mixing it with a single-axis shorthand
    // must not shift the widget twice.
    widget.style.transform = transforms.includes("translate(-50%, -50%)")
      ? "translate(-50%, -50%)"
      : transforms.join(" ");
  }

  return widget;
};

export default stackPosition;
