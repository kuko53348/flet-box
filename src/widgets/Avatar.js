/**
 * @file Avatar.js
 * @description A user avatar widget that renders an image, an icon, or
 * initials derived from a name, depending on what props are provided.
 * Falls back gracefully: image → icon → initials → generic person icon.
 * Supports circular, rounded-square, and square shapes, shows an optional
 * presence dot, and applies every one of its own props again on update.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import {
  isReactive,
  reactiveKeyOf,
  resolveReactive,
} from "../widget-factory/reactiveValue.js";
import { registerWidget } from "../tools/useState.js";
import { Image } from "./Image.js";
import { Icon } from "./Icon.js";
import { Text } from "./Text.js";

/**
 * Props the avatar applies itself: content (image, icon, initials), the box it
 * sits in, and the presence dot. They must never reach the factory — and the
 * factory must not keep them in `_originalProps`, where a later update would
 * re-apply the construction-time value over the widget's own.
 *
 * `bgColor` and `fontSize` are deliberately absent: the engine already routes
 * them (`backgroundColor`, `font-size`), so it can re-apply and re-subscribe
 * them better than this widget can.
 */
import { toREM } from "../utils/units.js";

const AVATAR_PROPS = [
  "src",
  "name",
  "icon",
  "size",
  "shape",
  "textColor",
  "online",
  "badgeColor",
];

/** Diameter of the presence dot, as a share of the avatar. */
const DOT_SIZE_RATIO = 0.3;

/**
 * Gap between the dot and the edge of the avatar. The dot stays inside because
 * the avatar clips its content (`overflow: hidden`) to its own shape: a dot
 * hung on the corner would be cut in half by a circular avatar, and a corner
 * inset of `s·0.12` with a `s·0.3` dot is the largest one that still fits
 * inside a circle of diameter `s`.
 */
const DOT_INSET_RATIO = 0.12;

/** Framework units → a CSS length that scales with the reader's base font. */

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
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

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
 * @param {number} [props.fontSize=16] - Font size of the avatar box in pixels; initials are sized from `size`.
 * @param {'circle'|'rounded'|'square'} [props.shape='circle'] - Shape of the avatar container.
 * @param {string} [props.bgColor=colors.primary] - Background color shown behind icons or initials.
 * @param {string} [props.textColor=colors.onPrimary] - Color of icon or initials.
 * @param {string} [props.icon] - Material icon name to display instead of an image or initials.
 * @param {boolean} [props.online=false] - Shows a presence dot in the bottom-right corner.
 * @param {string} [props.badgeColor=colors.success] - Color of the presence dot.
 * @param {Function} [props.onPress] - Click handler. When provided, a hover scale effect is also applied.
 * @returns {HTMLElement} The avatar element, augmented with an `updateContent` method.
 */
export const Avatar = (inputProps = {}) => {
  // The factory never sees these keys, so it can neither resolve a `useState`
  // value for them (a live reactive is a *function*, and the content branches
  // below only test them for presence) nor subscribe this widget to the key.
  // Both happen here instead: read once, keep the keys, bind after
  // `composeUpdate` has routed a later patch into `applyProps`.
  const boundKeys = new Map();
  const props = { ...inputProps };
  for (const key of AVATAR_PROPS) {
    const value = inputProps[key];
    if (!isReactive(value)) continue;
    props[key] = resolveReactive(value);
    const stateKey = reactiveKeyOf(value);
    if (stateKey) boundKeys.set(key, stateKey);
  }

  let {
    src,
    name,
    size = 40,
    fontSize = 16,
    shape = "circle",
    bgColor = colors.primary,
    // The default plate is `primary`, so the initials are its ink. Reading
    // `colors.text` here put near-white letters on a near-white avatar in dark.
    textColor = colors.onPrimary,
    icon,
    online = false,
    badgeColor = colors.success,
    onPress,
    ...rest
  } = props;

  /**
   * Border radius the current `shape` gives the current `size`. A square has to
   * say so — it is not merely "no radius applied yet", or the radius from the
   * previous shape would stay on the element.
   */
  const radiusFor = () => {
    if (shape === "rounded") return toREM(size * 0.2);
    if (shape === "square") return "0";
    return "50%";
  };

  /** Chooses the child element for the props currently held. */
  const buildContent = () => {
    if (src) {
      return Image({ src, width: "100%", height: "100%", fit: "cover" });
    }
    if (icon) return Icon({ name: icon, size: size * 0.5, color: textColor });
    if (name) {
      return Text({
        text: getInitials(name),
        color: textColor,
        size: size * 0.4,
        weight: "bold",
      });
    }
    // Generic fallback when no content is supplied
    return Icon({ name: "person", size: size * 0.5, color: textColor });
  };

  const avatar = WidgetFactory({
    widgetName: "Avatar",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    bgColor: bgColor,
    textColor: textColor,
    fontSize: fontSize,
    overflow: "hidden",
    fontWeight: "500",
    userSelect: "none",
    cursor: onPress ? "pointer" : "default",
    transition: "transform 0.2s ease",
    onclick: onPress,
    ...rest,
  });

  /**
   * Paints the box. Geometry is set here rather than passed to the factory as
   * `width`/`height`/`borderRadius` because the factory keeps those in
   * `_originalProps` and re-applies them on every later update — which would
   * snap the avatar back to its construction-time size. An explicit `width`,
   * `height` or `borderRadius` still wins, as it always has.
   */
  const paintGeometry = () => {
    avatar.style.width = toREM(rest.width ?? size);
    avatar.style.height = toREM(rest.height ?? size);
    // `radiusFor()` is already a CSS value; a caller's `borderRadius: 8` is a
    // framework number, and written straight to `style` it is an invalid value
    // the browser drops. toREM tells the two apart and scales the first.
    avatar.style.borderRadius = toREM(rest.borderRadius ?? radiusFor());
  };

  paintGeometry();

  // Both children are appended, never passed as `child`: the factory re-creates
  // whatever it built for `child` on any update that re-passes it, which would
  // drop the presence dot and revert the content to the construction-time node.
  let content = buildContent();
  const dot = WidgetFactory({
    tag: "div",
    position: "absolute",
    borderRadius: "50%",
    pointerEvents: "none",
  });
  avatar.appendChild(content);
  avatar.appendChild(dot);

  const paintDot = () => {
    dot.style.width = toREM(Math.round(size * DOT_SIZE_RATIO));
    dot.style.height = toREM(Math.round(size * DOT_SIZE_RATIO));
    dot.style.right = toREM(Math.round(size * DOT_INSET_RATIO));
    dot.style.bottom = toREM(Math.round(size * DOT_INSET_RATIO));
    dot.style.backgroundColor = badgeColor;
    dot.style.display = online ? "block" : "none";
  };

  /**
   * Applies the props this widget owns. Only the keys present in `next` are
   * touched; anything absent keeps its current value, so an update that only
   * flips `online` never reloads the image.
   *
   * @param {Object} next - Partial props to apply.
   */
  const applyProps = (next = {}) => {
    let rebuild = false;
    let resize = false;

    if ("src" in next) {
      src = next.src;
      rebuild = true;
    }
    if ("icon" in next) {
      icon = next.icon;
      rebuild = true;
    }
    if ("name" in next) {
      name = next.name;
      rebuild = true;
    }
    if ("textColor" in next) {
      textColor = next.textColor;
      avatar.style.color = textColor;
      rebuild = true;
    }
    if ("size" in next) {
      size = next.size;
      rebuild = true;
      resize = true;
    }
    if ("shape" in next) {
      shape = next.shape;
      resize = true;
    }
    if ("online" in next) online = next.online;
    if ("badgeColor" in next) badgeColor = next.badgeColor;

    if (resize) paintGeometry();
    if (rebuild) {
      const nextContent = buildContent();
      avatar.replaceChild(nextContent, content);
      content = nextContent;
    }
    paintDot();
  };

  paintDot();

  // Add a subtle scale-up on hover when the avatar is interactive
  const scaleUp = () => {
    avatar.style.transform = "scale(1.05)";
  };
  const scaleDown = () => {
    avatar.style.transform = "scale(1)";
  };
  if (onPress) {
    avatar.addEventListener("mouseenter", scaleUp);
    avatar.addEventListener("mouseleave", scaleDown);
  }

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    avatar.removeEventListener("mouseenter", scaleUp);
    avatar.removeEventListener("mouseleave", scaleDown);
  };
  avatar.onUnmount(dispose);

  composeUpdate(avatar, AVATAR_PROPS, applyProps);

  /**
   * Updates the avatar without recreating the element. This is `update()`: the
   * keys the avatar owns are applied here, everything else — `bgColor`,
   * `fontSize`, padding — goes through the factory, so the two public paths can
   * never disagree about what a prop does.
   *
   * @param {Object} newProps - Partial props to apply: `src`, `name`, `icon`,
   * `size`, `shape`, `textColor`, `online`, `badgeColor`, plus any style prop.
   */
  avatar.updateContent = (newProps = {}) => avatar.update(newProps);

  // Bind after composing: `registerWidget` pushes the current store value
  // through `update`, which must be the composed one that routes owned keys to
  // `applyProps`. It also releases the subscription itself on unmount.
  for (const [propName, stateKey] of boundKeys) {
    registerWidget(stateKey, avatar, propName);
  }

  return avatar;
};

export default Avatar;
