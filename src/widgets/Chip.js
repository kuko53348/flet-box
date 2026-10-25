/**
 * @file Chip.js
 * @description A compact label/tag widget, optionally adorned with a leading
 * icon and a delete button. Supports "filled" and "outlined" variants with
 * configurable colors, sizing, and elevation.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { colors } from "../utils/themes.js";
import { PILL, TAP_MINIMUM } from "../tools/index.js";

/**
 * Creates a Chip widget — a small interactive label commonly used for tags,
 * filters, or multi-select values.
 *
 * @param {Object} props - Configuration for the chip.
 * @param {string} props.label - The text displayed inside the chip.
 * @param {string} [props.icon] - Optional Material icon name rendered before the label.
 * @param {Function} [props.onPress] - Called when the chip is clicked. When provided, the cursor becomes a pointer and a hover opacity effect is added.
 * @param {Function} [props.onDelete] - When provided, renders a close ("×") icon on the right side of the chip. Called when that icon is clicked.
 * @param {'filled'|'outlined'} [props.variant='filled'] - Visual style. 'filled' uses a solid background; 'outlined' uses a transparent background with a border.
 * @param {string} [props.color=colors.primary] - Chip accent color: used as the background (filled) or border/text (outlined).
 * @param {string} [props.textColor] - Explicit text color override. Defaults to `colors.onPrimary` (filled) or `color` (outlined).
 * @param {string} [props.borderColor] - Explicit border color override (outlined variant only). Defaults to `color`.
 * @param {number} [props.borderRadius=999] - Corner radius in framework units (converted to `rem`). The default clamps to a pill.
 * @param {number|string} [props.padding] - Internal padding. A number is a uniform gutter (doubled horizontally); omitted it is 4 vertical x 12 horizontal, in framework units.
 * @param {number} [props.gap=4] - Gap in pixels between icon, label, and delete icon.
 * @param {number} [props.size=12] - Font size in pixels. Also scales the icons proportionally.
 * @param {number} [props.elevation=0] - Box-shadow depth. 0 means no shadow.
 * @returns {HTMLElement} The chip container element.
 */
export const Chip = (props) => {
  const {
    label,
    icon,
    onPress,
    onDelete,
    variant = "filled",
    color = colors.primary,
    textColor,
    borderColor,
    borderRadius = PILL,
    padding,
    gap = 4,
    size = 12,
    elevation = 0,
    ...rest
  } = props;

  /**
   * `4px 12px` as a literal string reaches the factory as raw CSS and freezes
   * there: the chip's type grew with the reader's font and its gutters did not.
   * Numbers go through `toREM` instead, and the pair is on the spacing scale.
   */
  const chipPadding =
    padding === undefined
      ? { paddingVertical: 4, paddingHorizontal: 12 }
      : typeof padding === "number"
        ? { paddingVertical: padding, paddingHorizontal: padding * 2 }
        : { padding };

  // Derive background, text, and border colors from the variant
  let bgColor, txtColor, brdColor;

  if (variant === "outlined") {
    bgColor = "transparent";
    txtColor = textColor || color;
    brdColor = borderColor || color;
  } else {
    bgColor = color;
    // The label sits on the primary plate, so its ink is the theme's, not a
    // literal white: in dark mode a primary chip is near-white and white words
    // would vanish.
    txtColor = textColor || colors.onPrimary;
    brdColor = "transparent";
  }

  const children = [];

  // Optional leading icon — inherits the chip's text color for visual consistency
  if (icon) {
    children.push(
      Icon({
        name: icon,
        size: size,
        color: txtColor,
      }),
    );
  }

  children.push(
    Text({
      text: label,
      size: size,
      color: txtColor,
      weight: "500",
    }),
  );

  // Optional trailing delete button — stopPropagation prevents triggering onPress
  if (onDelete) {
    const closeIcon = Icon({
      name: "close",
      // The glyph is decoration and the ligature is not a name: "close" is what a
      // reader would say, on a control whose whole job is to take this label away.
      "aria-label": label ? `Remove ${label}` : "Remove",
      size: Math.max(12, size - 2),
      color: txtColor,
      cursor: "pointer",
      onclick: (e) => {
        e.stopPropagation();
        onDelete();
      },
    });
    children.push(closeIcon);
  }

  // Inner Row lays out icon + label + delete icon horizontally
  const chipContent = Row({
    alignItems: "center",
    gap: gap,
    backgroundColor: bgColor,
    border: variant === "outlined" ? `1px solid ${brdColor}` : "none",
    borderRadius: borderRadius,
    ...chipPadding,
    width: "fit-content",
    minWidth: "auto",
    boxShadow:
      elevation > 0
        ? `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.1)`
        : "none",
    children: children,
  });

  // Outer wrapper element enables the onclick without styling conflicts.
  // A chip you can press or dismiss is a target, so the wrapper carries the
  // Fitts floor while the pill inside keeps its compact 23-unit height.
  const chip = WidgetFactory({
    widgetName: "Chip",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    ...(onPress || onDelete ? { minHeight: TAP_MINIMUM } : {}),
    cursor: onPress ? "pointer" : "default",
    transition: "all 0.2s ease",
    child: chipContent,
    onclick: onPress,
    ...rest,
  });

  // Hover effects that respect the chip's visual variant
  if (onPress) {
    chip.addEventListener("mouseenter", () => {
      if (variant === "filled") {
        // Slightly dim the chip to signal interactivity
        chip.style.opacity = "0.85";
      } else if (chipContent) {
        // Tint the outlined chip background subtly on hover
        chipContent.style.backgroundColor = `${color}10`;
      }
    });
    chip.addEventListener("mouseleave", () => {
      if (variant === "filled") {
        chip.style.opacity = "1";
      } else if (chipContent) {
        chipContent.style.backgroundColor = "transparent";
      }
    });
  }

  return chip;
};

export default Chip;
