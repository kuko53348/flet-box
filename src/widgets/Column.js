/**
 * @file Column.js
 * @description Vertical flex layout container (default `flex-direction: column`).
 */
import { WidgetFactory } from "../widget-factory/index.js";

export const Column = (props = {}) => {
  const {
    display = "flex",
    flexDirection = "column",
    width = "100%",
    height = "auto",
    boxSizing = "border-box",
    ...rest
  } = props;

  return WidgetFactory({
    tag: "div",
    widgetName: "Column",
    display: display,
    flexDirection: flexDirection,
    width: width,
    height: height,
    boxSizing: boxSizing,
    ...rest,
  });
};

export default Column;
