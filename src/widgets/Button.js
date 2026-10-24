/**
 * @file Button.js
 * @description Button with size presets, variants, icons and gradient support.
 */
import { WidgetFactory } from "../widget-factory/index.js";import { colors } from "../utils/themes.js";
import { SHADOW_LEVELS, TAP_MINIMUM } from "../tools/index.js";
import { readableInk } from "../utils/readableInk.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";

// ============================================================
// CONFIGURATION
// ============================================================

/**
 * Every number here is a framework unit — the factory converts lengths to `rem`,
 * so the whole preset grows with the reader's font size instead of freezing at
 * the pixel it was written in.
 *
 * `minHeight` is the Fitts floor: a pressable box the finger can hit, set on the
 * box rather than reached through padding, so `small` stays a small *looking*
 * control that is still a real target. `medium` and `large` land on 40 and 48;
 * `small` is 32 and is a desktop-density escape hatch, not a touch target.
 */
const SIZE_PRESETS = {
  small: { padding: [4, 12], fontSize: 12, gap: 4, iconSize: 16, minHeight: 32 },
  medium: { padding: [8, 16], fontSize: 14, gap: 8, iconSize: 20, minHeight: TAP_MINIMUM },
  large: { padding: [12, 24], fontSize: 16, gap: 12, iconSize: 24, minHeight: 48 },
};

// ============================================================
// HELPERS
// ============================================================

function normalizeSpacing(value, defaultPair) {
  if (value === undefined) return defaultPair;
  if (typeof value === "number") return [value, value * 2];
  if (Array.isArray(value) && value.length === 2) return value;
  return value;
}

function computeBackground(variant, disabled, bgColor, gradient) {
  if (disabled) return colors.gray100;
  if (variant === "filled") return gradient || bgColor || colors.primary;
  return "transparent";
}

function computeTextColor(variant, disabled, color, background, inkFromFill) {
  if (disabled) return colors.textDisabled;
  if (variant === "filled") {
    // The default `color` is the theme's ink, which is the right answer for a
    // filled button sitting on the default surface. Once the caller names the
    // fill, that ink can be the fill itself (dark on the light theme's primary,
    // near-white on the dark theme's), so the label has to follow the plate.
    if (!inkFromFill) return color;
    if (background === colors.primary) return colors.onPrimary;
    if (background === colors.secondary) return colors.onSecondary;
    return readableInk(background, colors.text);
  }
  return color || background || colors.primary;
}

function computeBorder(variant, disabled, color, bgColor, borderColor, namesItsOwnFill) {
  if (disabled) return `1px solid ${colors.gray300}`;
  if (variant === "outlined") {
    const tint = color || bgColor || colors.primary;
    return `2px solid ${tint}`;
  }
  if (variant === "text") return "none";
  // A filled button whose caller named the fill is a colour decision; a neutral
  // grey ring around it is an edge that belongs to no token and reads as a
  // rendering bug on the deep variants. A button that names no fill lands on
  // `colors.surface`, and there the hairline is what keeps the control findable
  // on a card of the same colour. An explicit `borderColor` always wins.
  if (borderColor) return `1px solid ${borderColor}`;
  return namesItsOwnFill ? "none" : `1px solid ${colors.border}`;
}

function createIcon(name, size, color) {
  if (!name) return null;
  return Icon({ name, size, color, display: "inline-flex" });
}

function resolveIconNames(props) {
  const { icon, iconPosition, iconTop, iconLeft, iconRight, iconBottom } =
    props;
  return {
    top: iconTop || (icon && iconPosition === "top" ? icon : null),
    left: iconLeft || (icon && iconPosition === "left" ? icon : null),
    right: iconRight || (icon && iconPosition === "right" ? icon : null),
    bottom: iconBottom || (icon && iconPosition === "bottom" ? icon : null),
  };
}

function buildIconElements(iconNames, size, color) {
  return {
    top: createIcon(iconNames.top, size, color),
    left: createIcon(iconNames.left, size, color),
    right: createIcon(iconNames.right, size, color),
    bottom: createIcon(iconNames.bottom, size, color),
  };
}

function buildButtonChildren(text, textColor, fontSize, gap, iconElements) {
  const children = [];

  if (iconElements.top) children.push(iconElements.top);

  const middleRow = [];
  if (iconElements.left) middleRow.push(iconElements.left);
  if (text) {
    middleRow.push(
      Text({ text, color: textColor, size: fontSize, weight: "bold" }),
    );
  }
  if (iconElements.right) middleRow.push(iconElements.right);

  if (middleRow.length > 0) {
    children.push(
      WidgetFactory({
        tag: "div",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap,
        child: middleRow,
      }),
    );
  }

  if (iconElements.bottom) children.push(iconElements.bottom);

  if (children.length === 0 && iconElements.left) {
    children.push(iconElements.left);
  }

  return children;
}

function applySpacingToProps(buttonProps, padding, margin, fallbackPadding) {
  const normalizedPadding = normalizeSpacing(padding, fallbackPadding);
  const normalizedMargin = normalizeSpacing(margin, undefined);

  if (Array.isArray(normalizedPadding)) {
    buttonProps.paddingTop = normalizedPadding[0];
    buttonProps.paddingBottom = normalizedPadding[0];
    buttonProps.paddingLeft = normalizedPadding[1];
    buttonProps.paddingRight = normalizedPadding[1];
  } else if (normalizedPadding !== undefined) {
    buttonProps.padding = normalizedPadding;
  }

  if (Array.isArray(normalizedMargin)) {
    buttonProps.marginTop = normalizedMargin[0];
    buttonProps.marginBottom = normalizedMargin[0];
    buttonProps.marginLeft = normalizedMargin[1];
    buttonProps.marginRight = normalizedMargin[1];
  } else if (normalizedMargin !== undefined) {
    buttonProps.margin = normalizedMargin;
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const Button = (props) => {
  const {
    text,
    iconLeft,
    iconRight,
    iconTop,
    iconBottom,
    icon,
    gradient,
    padding,
    margin,
    onPress,
    iconPosition = "left",
    variant = "filled",
    size = "medium",
    borderRadius = 16,
    elevation = null,
    disabled = false,
    fullWidth = false,
    bgColor = colors.surface,
    color = colors.text,
    ...rest
  } = props;

  const sizePreset = SIZE_PRESETS[size] || SIZE_PRESETS.medium;
  // Depth follows the variant: a text or outlined button is not a surface lifted
  // off the page, and a shadow drawn around a transparent box paints a grey blob
  // where the label should sit alone. An explicit `elevation` still wins.
  const lifted = elevation === null ? (variant === "filled" ? 2 : 0) : elevation;
  const shadow = SHADOW_LEVELS[lifted] || SHADOW_LEVELS[0];

  const background = computeBackground(variant, disabled, bgColor, gradient);
  // `bgColor` above always has a value (the default is the surface), so whether
  // the caller chose the fill has to be read off the props, not the local.
  const namesItsOwnFill =
    props.bgColor !== undefined ||
    props.backgroundColor !== undefined ||
    !!gradient;
  const textColor = computeTextColor(
    variant,
    disabled,
    color,
    background,
    props.color === undefined && namesItsOwnFill,
  );
  const border = computeBorder(
    variant,
    disabled,
    color,
    bgColor,
    rest.borderColor,
    namesItsOwnFill,
  );

  const iconNames = resolveIconNames({
    icon,
    iconPosition,
    iconTop,
    iconLeft,
    iconRight,
    iconBottom,
  });

  const iconElements = buildIconElements(
    iconNames,
    sizePreset.iconSize,
    textColor,
  );

  const children = buildButtonChildren(
    text,
    textColor,
    sizePreset.fontSize,
    sizePreset.gap,
    iconElements,
  );

  const hasTopOrBottomIcon = !!(iconElements.top || iconElements.bottom);
  const flexDirection = hasTopOrBottomIcon ? "column" : "row";

  const buttonProps = {
    tag: "button",
    widgetName: "Button",
    display: "inline-flex",
    flexDirection,
    alignItems: "center",
    justifyContent: "center",
    gap: sizePreset.gap,
    borderRadius,
    minHeight: sizePreset.minHeight,
    width: fullWidth ? "100%" : "auto",
    backgroundColor: background,
    border,
    color: textColor,
    boxShadow: shadow,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    boxSizing: fullWidth ? "border-box" : undefined,
    flexShrink: fullWidth ? undefined : 0,
    onclick: disabled ? null : onPress,
    child: children.length === 1 ? children[0] : children,
    ...rest,
  };

  applySpacingToProps(buttonProps, padding, margin, sizePreset.padding);

  if (gradient) {
    buttonProps.background = gradient;
    delete buttonProps.backgroundColor;
  }

  const button = WidgetFactory(buttonProps);
  button.setAttribute("type", "button");

  return button;
};

export default Button;
