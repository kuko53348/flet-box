/**
 * @file Stack.js
 * @description Positioning container that paints its children in the same box.
 * The first child stays in the flow and gives the stack its size; every child
 * after it floats over that box, anchored by `alignment` or by its own edges.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { ensureStackLayout } from "../utils/stackLayout.js";

/**
 * Nine-point grid → [vertical anchor, horizontal anchor].
 * `alignment` turns the stack into a column flex container, so `justifyContent`
 * carries the top/center/bottom anchor and `alignItems` the left/center/right one.
 * Those same two rules are what places a floating child: an absolutely
 * positioned child of a flex container takes its static position from them, so
 * one map anchors both the in-flow child and every layer above it.
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

  // The corner a child with no edges of its own lands on. Flet's stack puts the
  // first control in the top-left, and a stack that anchored nothing would place
  // its floating children wherever the flow would have put them — which is the
  // bug this widget is meant to fix, not a default.
  const preset = ALIGNMENTS[alignment] ?? ALIGNMENTS["top-left"];

  // The preset sits before `...rest`, so an explicit `flexDirection`,
  // `justifyContent` or `alignItems` from the caller always overrides it;
  // `alignment` only fills the axes nobody claimed.
  const stack = WidgetFactory({
    tag: "div",
    widgetName: "Stack",
    position: position,
    display: display ?? "flex",
    boxSizing: boxSizing,
    flexDirection: "column",
    justifyContent: preset[0],
    alignItems: preset[1],
    ...rest,
  });

  // The marker is what `stackLayout.js` floats every child but the first against.
  // It goes on the root, not on the children, because `update({ children })`
  // replaces the nodes and would take any per-node flag with it.
  ensureStackLayout();
  stack.setAttribute("data-fb-stack", "");

  return stack;
};

export default Stack;
