// widgets/Card.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { border } from "../tools/index.js";

export const Card = (props) => {
  const { elevation = 2, padding = 16, borderRadius = 12, ...rest } = props;

  return WidgetFactory({
    bgColor: colors.surface,
    borderRadius: borderRadius,
    padding: padding,
    elevation: elevation,
    border: border(1, "solid", colors.border), // ← opcional
    ...rest,
  });
};
