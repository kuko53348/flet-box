/**
 * @file Container.js
 * @description General-purpose surface container: flex column with overflow and
 * the theme's surface background by default.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Container = (props = {}) => {
  const {
    display = "flex",
    flexDirection = "column",
    overflow = "auto",
    boxSizing = "border-box",
    bgColor = colors.surface,
    flex,
    flexGrow,
    flexShrink,
    ...rest
  } = props;

  // Container paints `overflow: auto`, and a flex item whose overflow is not
  // `visible` has an automatic minimum size of zero — so by default it shrank
  // to nothing inside a column that overflows. Opting into the flex shorthand
  // still wins, which is how a stretchable body keeps working.
  const flexDefaults =
    flex === undefined && flexGrow === undefined && flexShrink === undefined
      ? { flexShrink: 0 }
      : { flex, flexGrow, flexShrink };

  return WidgetFactory({
    tag: "div",
    widgetName: "Container",
    display: display,
    flexDirection: flexDirection,
    overflow: overflow,
    boxSizing: boxSizing,
    backgroundColor: bgColor,
    ...flexDefaults,
    ...rest,
  });
};

export default Container;
