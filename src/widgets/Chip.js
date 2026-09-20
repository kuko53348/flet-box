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
 * @param {string} [props.textColor] - Explicit text color override. Defaults to '#fff' (filled) or `color` (outlined).
 * @param {string} [props.borderColor] - Explicit border color override (outlined variant only). Defaults to `color`.
 * @param {number} [props.borderRadius=32] - Corner radius in pixels. High values produce a pill shape.
 * @param {string} [props.padding='4px 12px'] - Internal padding of the chip row.
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
    borderRadius = 32,
    padding = "4px 12px",
    gap = 4,
    size = 12,
    elevation = 0,
    ...rest
  } = props;

  // Derive background, text, and border colors from the variant
  let bgColor, txtColor, brdColor;

  if (variant === "outlined") {
    bgColor = "transparent";
    txtColor = textColor || color;
    brdColor = borderColor || color;
  } else {
    bgColor = color;
    txtColor = textColor || "#fff";
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
      size: size - 2,
      color: txtColor,
      style: { cursor: "pointer" },
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
    padding: padding,
    width: "fit-content",
    minWidth: "auto",
    boxShadow:
      elevation > 0
        ? `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.1)`
        : "none",
    children: children,
    ...rest,
  });

  // Outer wrapper element enables the onclick without styling conflicts
  const chip = WidgetFactory({
    display: "inline-block",
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
