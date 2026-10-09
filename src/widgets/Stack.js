/**
 * @file Stack.js
 * @description Positioning container for overlaying children (relative by default,
 * use `position: "stack"` for absolute centering).
 */
import { WidgetFactory } from "../widget-factory/index.js";

export const Stack = (props = {}) => {
  const {
    // Default layout
    position = "relative",
    display = "block",
    boxSizing = "border-box",

    // Everything else
    ...rest
  } = props;

  return WidgetFactory({
    tag: "div",
    widgetName: "Stack",
    position: position,
    display: display,
    boxSizing: boxSizing,
    ...rest,
  });
};

export default Stack;
