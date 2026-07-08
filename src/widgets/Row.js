// widgets/Row.js - Clean version
import { WidgetFactory } from "../widget-factory/index.js";

export const Row = (props = {}) => {
  const {
    display = "flex",
    flexDirection = "row",
    width = "100%",
    height = "auto",
    boxSizing = "border-box",
    ...rest
  } = props;

  return WidgetFactory({
    tag: "div",
    display: display,
    flexDirection: flexDirection,
    width: width,
    height: height,
    boxSizing: boxSizing,
    ...rest,
  });
};

export default Row;
