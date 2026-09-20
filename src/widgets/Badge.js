/**
 * @file Badge.js
 * @description An overlay badge that renders a small indicator on top of a
 * child element. Commonly used for notification counts, status dots, or
 * "new item" markers on icons and avatars.
 *
 * Returns the child element directly when the badge should not be displayed
 * (value is zero and `showZero` is false, or value is absent). Otherwise
 * wraps the child in a Stack container with the badge positioned absolutely.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { Stack } from "./Stack.js";
import { Text } from "./Text.js";
import { colors, subscribeTheme } from "../utils/themes.js";

/**
 * Creates a Badge widget that overlays a small count or status indicator on
 * top of any child element.
 *
 * When `value` is falsy (and `showZero` is false), the child is returned
 * unwrapped — no DOM overhead is added for hidden badges.
 *
 * @param {Object} props - Configuration for the badge.
 * @param {number|string} props.value - The value to display. Numbers are formatted; strings are shown verbatim.
 * @param {HTMLElement} props.child - The element the badge is anchored to.
 * @param {string} [props.bgColor=colors.secondary] - Badge background color.
 * @param {string} [props.color=colors.text] - Badge text/icon color.
 * @param {number} [props.size=20] - Badge diameter in pixels; also controls font size proportionally.
 * @param {'top-right'|'top-left'|'bottom-right'|'bottom-left'} [props.position='top-right'] - Where to anchor the badge relative to the child.
 * @param {number} [props.borderWidth=2] - Width of the contrasting border around the badge in pixels.
 * @param {string} [props.borderColor=colors.surface] - Color of the border around the badge (typically matches the parent background).
 * @param {boolean} [props.showZero=false] - When true, the badge is visible even when `value` is 0.
 * @param {number} [props.max=99] - When `value` exceeds this, the badge shows `"{max}+"` instead of the raw number.
 * @param {number} [props.offset=0] - Additional pixel offset applied to the badge position for fine-tuning.
 * @returns {HTMLElement} The wrapped Stack element, or the child element directly if the badge is hidden.
 */
export const Badge = (props) => {
  const {
    value,
    child,
    bgColor = colors.secondary,
    color = colors.text,
    size = 20,
    position = "top-right",
    borderWidth = 2,
    borderColor = colors.surface,
    showZero = false,
    max = 99,
    offset = 0,
    ...rest
  } = props;

  // Use the supplied bgColor; fall back to danger red if neither bgColor nor color is set
  const finalBgColor = bgColor || color || colors.danger;

  let unsubscribeTheme = null;

  // Decide whether to show the badge at all
  const hasValue = value !== undefined && value !== null && value !== "";
  const showBadge =
    hasValue &&
    (showZero || (typeof value === "number" ? value > 0 : value !== ""));

  // Return the child unwrapped to avoid unnecessary DOM nesting
  if (!showBadge) {
    return child || null;
  }

  // Truncate numbers that exceed the `max` cap
  let displayValue = value;
  if (typeof value === "number" && max && value > max) {
    displayValue = `${max}+`;
  }

  // Pixel offsets for each anchor position — the transform handles the corner alignment
  const positions = {
    "top-right": {
      top: -offset,
      right: -offset,
      transform: "translate(25%, -25%)",
    },
    "top-left": {
      top: -offset,
      left: -offset,
      transform: "translate(-25%, -25%)",
    },
    "bottom-right": {
      bottom: -offset,
      right: -offset,
      transform: "translate(25%, 25%)",
    },
    "bottom-left": {
      bottom: -offset,
      left: -offset,
      transform: "translate(-25%, 25%)",
    },
  };

  const pos = positions[position] || positions["top-right"];

  // The badge pill element itself
  const badgeElement = WidgetFactory({
    position: "absolute",
    top: pos.top,
    right: pos.right,
    bottom: pos.bottom,
    left: pos.left,
    transform: pos.transform,
    backgroundColor: finalBgColor,
    borderRadius: size,
    minWidth: size,
    height: size,
    // Extra horizontal padding for two-digit numbers so they don't clip
    padding: size > 20 ? `0 ${size / 3}px` : 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: borderWidth,
    borderColor: borderColor,
    zIndex: 1,
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    child: Text({
      text: String(displayValue),
      size: size * 0.55,
      color: color,
      weight: "bold",
      align: "center",
      lineHeight: 1,
    }),
  });

  // Subscribe to theme changes to keep the badge color in sync when no explicit
  // bgColor/color was provided by the caller
  if (!bgColor && !color) {
    unsubscribeTheme = subscribeTheme(() => {
      badgeElement.style.backgroundColor = colors.danger;
    });
  }

  const validChild = child instanceof HTMLElement ? child : null;

  if (!validChild) {
    console.warn("Badge: child must be an HTMLElement");
    if (unsubscribeTheme) unsubscribeTheme();
    return badgeElement;
  }

  // Wrap the child and the badge in a Stack so the badge is positioned relative to the child
  const badgeStack = Stack({
    position: "relative",
    display: "inline-block",
    style: { position: "relative", display: "inline-block" },
    children: [validChild, badgeElement],
    ...rest,
  });

  // Unsubscribe from theme updates when the component is removed from the DOM
  const originalCleanup = badgeStack._cleanup;
  badgeStack._cleanup = () => {
    if (unsubscribeTheme) unsubscribeTheme();
    if (originalCleanup) originalCleanup();
  };

  /**
   * Updates the displayed badge value without re-rendering the component.
   * Hides the badge automatically when the new value is zero (unless `showZero` is true).
   *
   * @param {number|string} newValue - The new badge value.
   */
  badgeStack.updateValue = (newValue) => {
    let newDisplayValue = newValue;
    if (typeof newValue === "number" && max && newValue > max) {
      newDisplayValue = `${max}+`;
    }
    const textElement = badgeElement.querySelector("span:not(.material-icons)");
    if (textElement) {
      textElement.textContent = String(newDisplayValue);
    }
    const shouldShow =
      newValue &&
      (showZero ||
        (typeof newValue === "number" ? newValue > 0 : newValue !== ""));
    badgeElement.style.display = shouldShow ? "flex" : "none";
  };

  return badgeStack;
};

export default Badge;
