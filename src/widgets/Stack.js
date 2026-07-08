// widgets/Stack.js - Clean version
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
    position: position,
    display: display,
    boxSizing: boxSizing,
    ...rest,
  });
};

export default Stack;
