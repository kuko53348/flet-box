/**
 * @file Avatar.js
 * @description A user avatar widget that renders an image, an icon, or
 * initials derived from a name, depending on what props are provided.
 * Falls back gracefully: image → icon → initials → generic person icon.
 * Supports circular, rounded-square, and square shapes, and exposes a method
 * to update its content without rebuilding the DOM.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Image } from "./Image.js";
import { Icon } from "./Icon.js";
import { Text } from "./Text.js";

/**
 * Creates an Avatar widget.
 *
 * Content priority (first match wins):
 * 1. `src` — renders an `<img>` filling the avatar circle.
 * 2. `icon` — renders a Material icon centered in the avatar.
 * 3. `name` — extracts up to two initials and renders them as text.
 * 4. Fallback — renders a generic "person" icon.
 *
 * @param {Object} props - Configuration for the avatar.
 * @param {string} [props.src] - URL of a profile image.
 * @param {string} [props.name] - Full name from which initials are derived (e.g. "Jane Doe" → "JD").
 * @param {number} [props.size=40] - Diameter of the avatar in pixels.
 * @param {number} [props.fontSize=16] - Font size of initials text in pixels (overridden by the auto-computed size when `size` changes).
 * @param {'circle'|'rounded'|'square'} [props.shape='circle'] - Shape of the avatar container.
 * @param {string} [props.bgColor=colors.primary] - Background color shown behind icons or initials.
 * @param {string} [props.textColor=colors.text] - Color of icon or initials.
 * @param {string} [props.icon] - Material icon name to display instead of an image or initials.
 * @param {Function} [props.onPress] - Click handler. When provided, a hover scale effect is also applied.
 * @returns {HTMLElement} The avatar container element, augmented with an `updateContent` method.
 */
export const Avatar = (props) => {
  let {
    src,
    name,
    size = 40,
    fontSize = 16,
    shape = "circle",
    bgColor = colors.primary,
    textColor = colors.text,
    icon,
    onPress,
    ...rest
  } = props;

  // Map shape to a CSS border-radius value
  let borderRadius = "50%";
  if (shape === "rounded") borderRadius = `${size * 0.2}px`;
  if (shape === "square") borderRadius = "0";

  /**
   * Extracts up to two initials from a full name.
   * Single-word names return just the first letter; multi-word names use
   * the first letter of the first and last words.
   *
   * @param {string} fullName - The user's full name.
   * @returns {string} 1–2 uppercase initials, or "?" if the name is empty.
   */
  const getInitials = (fullName) => {
    if (!fullName) return "?";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Choose the appropriate child element based on prop priority
  let content = null;
  if (src) {
    content = Image({
      src: src,
      width: "100%",
      height: "100%",
      fit: "cover",
    });
  } else if (icon) {
    content = Icon({
      name: icon,
      size: size * 0.5,
      color: textColor,
    });
  } else if (name) {
    const initials = getInitials(name);
    content = Text({
      text: initials,
      color: textColor,
      size: size * 0.4,
      weight: "bold",
    });
  } else {
    // Generic fallback when no content is supplied
    content = Icon({
      name: "person",
      size: size * 0.5,
      color: textColor,
    });
  }

  const avatar = WidgetFactory({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    borderRadius: borderRadius,
    backgroundColor: bgColor,
    color: textColor,
    overflow: "hidden",
    fontSize: fontSize,
    fontWeight: "500",
    userSelect: "none",
    cursor: onPress ? "pointer" : "default",
    transition: "transform 0.2s ease",
    child: content,
    onclick: onPress,
    ...rest,
  });

  // Add a subtle scale-up on hover when the avatar is interactive
  if (onPress) {
    avatar.addEventListener("mouseenter", () => {
      avatar.style.transform = "scale(1.05)";
    });
    avatar.addEventListener("mouseleave", () => {
      avatar.style.transform = "scale(1)";
    });
  }

  /**
   * Updates the avatar's content and/or dimensions without recreating the element.
   * Only the properties present in `newProps` are applied; others are left as-is.
   *
   * @param {Object} newProps - Partial props to apply.
   * @param {string} [newProps.src] - New image URL.
   * @param {string} [newProps.name] - New name (re-derives initials).
   * @param {string} [newProps.icon] - New icon name.
   * @param {string} [newProps.bgColor] - New background color.
   * @param {number|string} [newProps.size] - New avatar diameter.
   */
  avatar.updateContent = (newProps) => {
    // Sync the mutable local variables with any supplied overrides
    if (newProps.src !== undefined) src = newProps.src;
    if (newProps.name !== undefined) name = newProps.name;
    if (newProps.icon !== undefined) icon = newProps.icon;
    if (newProps.bgColor !== undefined)
      avatar.style.backgroundColor = newProps.bgColor;
    if (newProps.size !== undefined) {
      const newSize = newProps.size;
      avatar.style.width =
        typeof newSize === "number" ? `${newSize}px` : newSize;
      avatar.style.height =
        typeof newSize === "number" ? `${newSize}px` : newSize;
      avatar.style.fontSize =
        typeof newSize === "number" ? `${newSize * 0.4}px` : "16px";
    }

    // Rebuild the inner content using the updated props
    let newContent = null;
    if (newProps.src !== undefined || src !== undefined) {
      const finalSrc = newProps.src !== undefined ? newProps.src : src;
      newContent = Image({
        src: finalSrc,
        width: "100%",
        height: "100%",
        fit: "cover",
      });
    } else if (newProps.icon !== undefined || icon !== undefined) {
      const finalIcon = newProps.icon !== undefined ? newProps.icon : icon;
      const finalSize = newProps.size || size;
      newContent = Icon({
        name: finalIcon,
        size: finalSize * 0.5,
        color: textColor,
      });
    } else if (newProps.name !== undefined || name !== undefined) {
      const finalName = newProps.name !== undefined ? newProps.name : name;
      const initials = getInitials(finalName);
      const finalSize = newProps.size || size;
      newContent = Text({
        text: initials,
        color: textColor,
        size: finalSize * 0.4,
        weight: "bold",
      });
    } else {
      const finalSize = newProps.size || size;
      newContent = Icon({
        name: "person",
        size: finalSize * 0.5,
        color: textColor,
      });
    }

    // Replace the existing child with the new content
    while (avatar.firstChild) avatar.removeChild(avatar.firstChild);
    avatar.appendChild(newContent);
    avatar._child = newContent;
  };

  return avatar;
};

export default Avatar;
