// widgets/Icon.js (corregido)
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Icon = (props) => {
  const {
    icon,
    name,
    size = 24,
    color = colors.textSecondary,
    ...rest
  } = props;
  const iconName = icon || name || "";

  return WidgetFactory({
    tag: "span",
    className: "material-icons",
    text: iconName, // ✅ CAMBIADO: text en lugar de textContent
    fontSize: typeof size === "number" ? `${size}px` : size,
    color: color,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    ...rest,
  });
};

export default Icon;
