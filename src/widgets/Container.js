// widgets/Container.js - Clean version
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Container = (props = {}) => {
  const {
    display = "flex",
    flexDirection = "column",
    overflow = "auto",
    boxSizing = "border-box",
    bgColor = colors.surface,
    ...rest
  } = props;

  return WidgetFactory({
    tag: "div",
    display: display,
    flexDirection: flexDirection,
    overflow: overflow,
    boxSizing: boxSizing,
    backgroundColor: bgColor,
    ...rest,
  });
};

export default Container;
