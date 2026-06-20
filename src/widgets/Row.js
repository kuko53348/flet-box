// widgets/Row.js
import { WidgetFactory } from "../widget-factory/index.js";

export const Row = (props) => {
  const { style = {}, ...rest } = props;

  return WidgetFactory({
    tag: "div",
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "auto",
    boxSizing: "border-box",
    ...style,
    ...rest,
  });
};

export default Row;
