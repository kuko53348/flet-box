/**
 * @file Stack.js
 * @description Positioning container for overlaying children (relative by default,
 * use `position: "stack"` for absolute centering). Supports a nine-point
 * `alignment` that anchors its children inside the box.
 */
import { WidgetFactory } from "../widget-factory/index.js";

/**
 * Nine-point grid → [vertical anchor, horizontal anchor].
 * `alignment` turns the stack into a column flex container, so `justifyContent`
 * carries the top/center/bottom anchor and `alignItems` the left/center/right one.
 */
const ALIGNMENTS = {
  "top-left": ["flex-start", "flex-start"],
  "top-center": ["flex-start", "center"],
  "top-right": ["flex-start", "flex-end"],
  "center-left": ["center", "flex-start"],
  center: ["center", "center"],
  "center-right": ["center", "flex-end"],
  "bottom-left": ["flex-end", "flex-start"],
  "bottom-center": ["flex-end", "center"],
  "bottom-right": ["flex-end", "flex-end"],
};

export const Stack = (props = {}) => {
  const {
    // Default layout
    position = "relative",
    display,
    boxSizing = "border-box",

    // Nine-point anchor for the children
    alignment,

    // Everything else
    ...rest
  } = props;

  const preset = alignment ? ALIGNMENTS[alignment] : undefined;

  // The preset sits before `...rest`, so an explicit `flexDirection`,
  // `justifyContent` or `alignItems` from the caller always overrides it;
  // `alignment` only fills the axes nobody claimed.
  return WidgetFactory({
    tag: "div",
    widgetName: "Stack",
    position: position,
    display: display ?? (preset ? "flex" : "block"),
    boxSizing: boxSizing,
    ...(preset
      ? {
          flexDirection: "column",
          justifyContent: preset[0],
          alignItems: preset[1],
        }
      : null),
    ...rest,
  });
};

export default Stack;
