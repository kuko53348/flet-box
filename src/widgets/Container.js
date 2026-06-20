import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Container = (props) => {
  const { style = {}, ...rest } = props;

  return WidgetFactory({
    tag: "div",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    boxSizing: "border-box",
    backgroundColor: colors.surface,
    ...style,
    ...rest,
  });
};

export default Container;
