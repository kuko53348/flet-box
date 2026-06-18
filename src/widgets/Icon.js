// widgets/Icon.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Icon = (props) => {
  const { name, size = 24, color = colors.textSecondary, ...rest } = props;

  return WidgetFactory({
    tag: "span",
    className: "material-icons",
    textContent: name,
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
