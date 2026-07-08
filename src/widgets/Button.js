// widgets/Button.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";

// ============================================================
// CONFIGURATION
// ============================================================

const SIZE_PRESETS = {
  small: { padding: [6, 12], fontSize: 12, gap: 6, iconSize: 16 },
  medium: { padding: [10, 20], fontSize: 14, gap: 8, iconSize: 20 },
  large: { padding: [14, 28], fontSize: 16, gap: 10, iconSize: 24 },
};

const SHADOW_LEVELS = {
  0: "none",
  1: "0 1px 3px rgba(0,0,0,0.12)",
  2: "0 3px 6px rgba(0,0,0,0.16)",
  3: "0 6px 12px rgba(0,0,0,0.2)",
  4: "0 10px 20px rgba(0,0,0,0.25)",
  5: "0 15px 30px rgba(0,0,0,0.3)",
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

function computeTextColor(variant, disabled, color, bgColor) {
  if (disabled) return colors.textDisabled;
  if (variant === "filled") return color || "#fff";
  return color || bgColor || colors.primary;
}

function computeBorder(variant, disabled, color, bgColor) {
  if (disabled) return `1px solid ${colors.gray300}`;
  if (variant === "outlined") {
    const borderColor = color || bgColor || colors.primary;
    return `2px solid ${borderColor}`;
  }
  if (variant === "text") return "none";
  return `1px solid ${colors.border}`;
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

function applySpacingToProps(buttonProps, padding, margin) {
  const normalizedPadding = normalizeSpacing(
    padding,
    SIZE_PRESETS.medium.padding,
  );
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
    borderRadius = 24,
    elevation = 2,
    disabled = false,
    fullWidth = false,
    bgColor = colors.surface,
    color = colors.text,
    ...rest
  } = props;

  const sizePreset = SIZE_PRESETS[size] || SIZE_PRESETS.medium;
  const shadow = SHADOW_LEVELS[elevation] || SHADOW_LEVELS[0];

  const background = computeBackground(variant, disabled, bgColor, gradient);
  const textColor = computeTextColor(variant, disabled, color, bgColor);
  const border = computeBorder(variant, disabled, color, bgColor);

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
    display: "inline-flex",
    flexDirection,
    alignItems: "center",
    justifyContent: "center",
    gap: sizePreset.gap,
    borderRadius,
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

  applySpacingToProps(buttonProps, padding, margin);

  if (gradient) {
    buttonProps.background = gradient;
    delete buttonProps.backgroundColor;
  }

  const button = WidgetFactory(buttonProps);
  button.setAttribute("type", "button");

  return button;
};

export default Button;
