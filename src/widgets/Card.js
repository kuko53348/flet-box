// widgets/Card.js - Clean version
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { border } from "../tools/index.js";

export const Card = (props = {}) => {
  const {
    elevation = 2,
    padding = 16,
    borderRadius = 12,
    bgColor = colors.surface,
    borderColor = colors.border,
    borderWidth = 1,
    borderStyle = "solid",
    showBorder = true,
    ...rest
  } = props;

  return WidgetFactory({
    backgroundColor: bgColor,
    borderRadius: borderRadius,
    padding: padding,
    elevation: elevation,
    border: showBorder ? border(borderWidth, borderStyle, borderColor) : "none",
    ...rest,
  });
};

export default Card;
