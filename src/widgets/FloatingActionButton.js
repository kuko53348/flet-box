/**
 * @file FloatingActionButton.js
 * @description Circular floating action button anchored to a corner.
 */
import { Container } from "./Container.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { colors } from "../utils/themes.js";
import { toREM } from "../utils/units.js";
import { SHADOW_LEVELS, PILL } from "../tools/index.js";

export const FloatingActionButton = (props) => {
  const {
    icon = "add",
    label,
    onPress,
    backgroundColor = colors.primary,
    foregroundColor = "#ffffff",
    // Depth is the 0-5 scale, like every other widget; 6 was a number the scale
    // does not have, which only worked because this widget built its own string.
    elevation = 4,
    borderRadius = PILL,
    padding = 12,
    mini = false,
    extended = false,
    disabled = false,
    ...rest
  } = props;

  // 48 and 40 are both scale steps, and both clear the Fitts floor: the mini FAB
  // sits exactly on it, which is as small as a floating target may get.
  const size = mini ? 40 : 48;
  const iconSize = mini ? 20 : 24;

  const children = [
    Icon({
      padding,
      borderRadius,
      name: icon,
      size: iconSize,
      color: foregroundColor,
    }),
  ];

  if (extended && label) {
    children.push(
      Text({
        // FIX: `value` es special y `applySpecial` solo lo aplica en inputs
        // → en un <span> no hacía nada y el label quedaba vacío.
        text: label,
        size: 14,
        fontWeight: "500",
        color: foregroundColor,
      }),
    );
  }

  const button = Container({
    widgetName: "FloatingActionButton",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: extended ? "auto" : size,
    height: size,
    borderRadius: extended ? borderRadius : "50%",
    backgroundColor: backgroundColor,
    color: foregroundColor,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    boxShadow: SHADOW_LEVELS[elevation] ?? SHADOW_LEVELS[4],
    transition: "all 0.2s ease",
    padding: extended ? `0 ${toREM(16)}` : 0,
    child: extended
      ? Row({ alignItems: "center", gap: 8, children })
      : children[0],
    ...rest,
  });

  if (onPress && !disabled) {
    button.addEventListener("click", onPress);
    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.05)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)";
    });
  }

  return button;
};

export default FloatingActionButton;