// widgets/Divider.js - Versión completa con WidgetFactory (sin Container)
import { WidgetFactory } from "../widget-factory/index.js";

// Color por defecto (no depende de temas para evitar errores de inicialización)
const DEFAULT_COLOR = "#e2e8f0";

export const Divider = (props = {}) => {
  const {
    color = DEFAULT_COLOR,
    thickness = 1,
    margin = 16,
    orientation = "horizontal",
    style = {},
    ...rest
  } = props;

  const isHorizontal = orientation === "horizontal";
  const finalThickness =
    typeof thickness === "number" ? `${thickness}px` : thickness;

  // Procesar margen (número, string u objeto)
  let marginStyle = "";
  if (typeof margin === "number") {
    marginStyle = isHorizontal ? `${margin}px 0` : `0 ${margin}px`;
  } else if (typeof margin === "string") {
    marginStyle = margin;
  } else if (margin && typeof margin === "object") {
    const top =
      margin.top !== undefined
        ? typeof margin.top === "number"
          ? `${margin.top}px`
          : margin.top
        : "0";
    const right =
      margin.right !== undefined
        ? typeof margin.right === "number"
          ? `${margin.right}px`
          : margin.right
        : "0";
    const bottom =
      margin.bottom !== undefined
        ? typeof margin.bottom === "number"
          ? `${margin.bottom}px`
          : margin.bottom
        : "0";
    const left =
      margin.left !== undefined
        ? typeof margin.left === "number"
          ? `${margin.left}px`
          : margin.left
        : "0";
    marginStyle = `${top} ${right} ${bottom} ${left}`;
  } else {
    marginStyle = isHorizontal ? "16px 0" : "0 16px";
  }

  const baseStyle = {
    backgroundColor: color,
    flexShrink: 0,
    ...style,
  };

  if (isHorizontal) {
    baseStyle.height = finalThickness;
    baseStyle.width = "100%";
    baseStyle.margin = marginStyle;
  } else {
    baseStyle.width = finalThickness;
    baseStyle.height = "100%";
    baseStyle.minHeight = "1px"; // para que se vea en contenedores flex
    baseStyle.margin = marginStyle;
  }

  return WidgetFactory({
    tag: "div",
    style: baseStyle,
    ...rest,
  });
};

export default Divider;
