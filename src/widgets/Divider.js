// widgets/Divider.js - Optimized version
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Divider = (props = {}) => {
  const {
    color = colors.surface,
    thickness = 1,
    margin = 16,
    orientation = "horizontal",
    width = "100%",
    height = "100%",
    flexShrink = 0,
    marginTop: propMarginTop,
    marginBottom: propMarginBottom,
    marginLeft: propMarginLeft,
    marginRight: propMarginRight,
    ...rest
  } = props;

  const isHorizontal = orientation === "horizontal";

  // Determine margin values with proper priority:
  // 1. Individual props (marginTop, marginBottom, etc.)
  // 2. margin object (margin.top, margin.bottom, etc.)
  // 3. margin number (applied to all sides)
  // 4. Default values

  let finalMarginTop = propMarginTop ?? 0;
  let finalMarginBottom = propMarginBottom ?? 0;
  let finalMarginLeft = propMarginLeft ?? 0;
  let finalMarginRight = propMarginRight ?? 0;

  if (typeof margin === "number") {
    if (isHorizontal) {
      finalMarginTop = margin;
      finalMarginBottom = margin;
    } else {
      finalMarginLeft = margin;
      finalMarginRight = margin;
    }
  } else if (margin && typeof margin === "object") {
    if (isHorizontal) {
      finalMarginTop = margin.top ?? finalMarginTop;
      finalMarginBottom = margin.bottom ?? finalMarginBottom;
    } else {
      finalMarginLeft = margin.left ?? finalMarginLeft;
      finalMarginRight = margin.right ?? finalMarginRight;
    }
  }

  // If margin is a string, use it directly (overrides everything)
  const useMarginString = typeof margin === "string";

  // Create widget
  const widget = WidgetFactory({
    tag: "div",
    backgroundColor: color,
    flexShrink: flexShrink,
    ...rest,
  });

  // Apply divider-specific props
  if (isHorizontal) {
    widget.update({
      height: thickness,
      width: width,
      marginTop: finalMarginTop,
      marginBottom: finalMarginBottom,
    });
  } else {
    widget.update({
      width: thickness,
      height: height,
      minHeight: 1,
      marginLeft: finalMarginLeft,
      marginRight: finalMarginRight,
    });
  }

  // If margin is a string, apply it directly (overrides individual margins)
  if (useMarginString) {
    widget.update({ margin: margin });
  }

  return widget;
};

export default Divider;
