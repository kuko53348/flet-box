/**
 * @file Card.js
 * @description Elevated surface card with optional border, padding and radius.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { border, SHADOW_LEVELS } from "../tools/index.js";

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
    widgetName: "Card",
    backgroundColor: bgColor,
    borderRadius: borderRadius,
    padding: padding,
    // The engine routes `elevation` straight into `style.boxShadow`, and CSS drops
    // a bare number: forwarding it left every card flat, whatever depth was asked
    // for. Depth is a scale, so the level is read here into a real shadow — and an
    // explicit `shadow`/`boxShadow` in `rest` still wins over the scale.
    boxShadow: SHADOW_LEVELS[elevation] ?? SHADOW_LEVELS[2],
    border: showBorder ? border(borderWidth, borderStyle, borderColor) : "none",
    ...rest,
  });
};

export default Card;
