// widgets/Icon.js (fixed)
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
    text: iconName, // ✅ CHANGED: text instead of textContent
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
