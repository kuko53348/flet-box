// widgets/Column.js
import { WidgetFactory } from "../widget-factory/index.js";

export const Column = (props) => {
  const { style = {}, ...rest } = props;

  return WidgetFactory({
    // tag: "div",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    width: "100%",
    height: "auto",
    // boxSizing: "border-box",
    ...style,
    ...rest,
  });
};

export default Column;
