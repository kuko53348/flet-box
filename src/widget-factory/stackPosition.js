// core/stackPosition.js

/**
 * Applies positioning for Stack layout
 * @param {HTMLElement} widget - The widget to position
 * @param {Object} props - Widget props
 * @returns {HTMLElement} The widget with position applied
 *
 * @example
 * stackPosition(element, { position: 'stack', top: 10, left: 20 })
 * // → element.style.position = 'absolute'
 * // → element.style.top = '10px'
 * // → element.style.left = '20px'
 */
export const stackPosition = (widget, props) => {
  // Only apply if position is 'stack'
  if (props.position !== "stack") {
    return widget;
  }

  // Absolute positioning
  widget.style.position = "absolute";

  // Process each position prop
  for (const [key, value] of Object.entries(props)) {
    if (key === "position") continue;

    switch (key) {
      case "top":
        widget.style.top = typeof value === "number" ? `${value}px` : value;
        break;
      case "right":
        widget.style.right = typeof value === "number" ? `${value}px` : value;
        break;
      case "bottom":
        widget.style.bottom = typeof value === "number" ? `${value}px` : value;
        break;
      case "left":
        widget.style.left = typeof value === "number" ? `${value}px` : value;
        break;
      case "start":
        widget.style.left = typeof value === "number" ? `${value}px` : value;
        break;
      case "end":
        widget.style.right = typeof value === "number" ? `${value}px` : value;
        break;
      case "centerX":
        widget.style.left = "50%";
        widget.style.transform = "translateX(-50%)";
        break;
      case "centerY":
        widget.style.top = "50%";
        widget.style.transform = "translateY(-50%)";
        break;
      case "center":
        widget.style.top = "50%";
        widget.style.left = "50%";
        widget.style.transform = "translate(-50%, -50%)";
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

  return widget;
};

export default stackPosition;
