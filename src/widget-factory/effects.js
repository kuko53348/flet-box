// core/effects.js

import { SHADOW_LEVELS } from "../tools/shadow.js";

/**
 * The three geometry numbers of a CSS shadow: x, y and blur.
 * The colour is stripped first, because the scale writes `0 3px 6px` while the
 * browser serialises the live style as `0px 3px 6px 0px` — matching numbers
 * instead of tokens is what lets both forms compare equal.
 */
const shadowGeometry = (value) => {
  const numbers = String(value ?? "")
    .replace(/rgba?\([^)]*\)/g, "")
    .trim()
    .split(/\s+/)
    .map(parseFloat);
  return numbers.length >= 3 && numbers.every(Number.isFinite)
    ? numbers.slice(0, 3)
    : null;
};

/**
 * The next `SHADOW_LEVELS` entry above `value`, or `null` when the shadow is not
 * one of the scale's levels. Matching is by geometry, not by string: the browser
 * serialises "0 3px 6px rgba(0,0,0,0.16)" as "rgba(0, 0, 0, 0.16) 0px 3px 6px",
 * so comparing the literals would never find a level.
 */
const nextElevation = (value) => {
  const geometry = shadowGeometry(value);
  if (!geometry) return null;
  const level = Object.keys(SHADOW_LEVELS).find((key) => {
    const candidate = shadowGeometry(SHADOW_LEVELS[key]);
    return candidate && candidate.every((n, i) => Math.abs(n - geometry[i]) < 0.01);
  });
  if (level === undefined) return null;
  return SHADOW_LEVELS[Number(level) + 1] ?? null;
};


/**
 * Applies interactive visual effects to a widget that has a click handler.
 *
 * On every call, previously registered effect listeners are removed before new
 * ones are attached, so calling `applyEffects` again after an `update` is safe
 * and idempotent.
 *
 * **Base effects (always applied):**
 * - `-webkit-tap-highlight-color` set to `transparent` to suppress the default
 *   mobile tap flash.
 * - `outline` removed for a cleaner focused appearance.
 *
 * **Press / hover effects (only when a click handler is present and
 * `disableTransform !== true`):**
 * - On press start (`mousedown` / `touchstart`): scales the widget to `0.98`
 *   and removes the box shadow.
 * - On press end (`mouseup` / `touchend` / `mouseleave` / `touchcancel`):
 *   restores the original scale and shadow.
 * - On hover enter (`mouseenter`): translates the widget up by `0.5px` and
 *   raises the box shadow by one `SHADOW_LEVELS` step when the widget already
 *   carries a shadow from that scale.
 * - On hover leave (`mouseleave`): restores the original translate and shadow.
 * - Sets `cursor: pointer`.
 *
 * The `scale` and `translate` CSS properties are modified independently to
 * avoid overwriting any `transform` set by `stackPosition` or other consumers.
 *
 * @param {HTMLElement} widget - The widget to apply effects to. Must have
 *   `_originalProps` and `_effectListeners` properties (set up by
 *   `WidgetFactory`).
 * @returns {HTMLElement} The same widget (for chaining).
 */
export const applyEffects = (widget) => {
  // Remove previously registered effect listeners before re-attaching.
  if (widget._effectListeners) {
    widget._effectListeners.forEach(({ event, handler }) => {
      widget.removeEventListener(event, handler);
    });
    widget._effectListeners = [];
  }

  widget.style.webkitTapHighlightColor = "transparent";
  widget.style.outline = "none";

  const hasClick = widget.onclick && typeof widget.onclick === "function";
  if (!hasClick) return widget;

  // Store the current shadow so it can be restored after press / hover effects.
  //
  // Skipped while the pointer is over the widget: `update()` re-runs
  // `applyEffects`, and capturing the lifted hover shadow as the base would make
  // every update climb one more elevation step.
  if (!widget._hovering) widget._originalShadow = widget.style.boxShadow || "";
  const hoverShadow = nextElevation(widget._originalShadow);

  const disableTransform = widget._originalProps?.disableTransform === true;
  const listeners = [];

  if (!disableTransform) {
    let isPressed = false;

    /**
     * Handles press-start events (mousedown / touchstart).
     * Scales the widget down and removes its shadow.
     */
    const onStart = () => {
      if (isPressed) return;
      isPressed = true;
      // Use the independent `scale` property to avoid conflicting with stackPosition.
      widget.style.scale = "0.98";
      widget.style.boxShadow = "none";
    };

    /**
     * Handles press-end events (mouseup / touchend / mouseleave / touchcancel).
     * Restores scale and shadow without touching `transform`.
     */
    const onEnd = () => {
      if (!isPressed) return;
      isPressed = false;
      // Restore scale without touching transform.
      widget.style.scale = "";
      widget.style.boxShadow = widget._originalShadow || "";  
    };

    const pressStart = ["mousedown", "touchstart"];
    const pressEnd = ["mouseup", "touchend", "mouseleave", "touchcancel"];

    pressStart.forEach((ev) => {
      widget.addEventListener(ev, onStart, { passive: true });
      listeners.push({ event: ev, handler: onStart });
    });
    pressEnd.forEach((ev) => {
      widget.addEventListener(ev, onEnd, { passive: true });
      listeners.push({ event: ev, handler: onEnd });
    });

    /**
     * Handles hover-enter (`mouseenter`).
     * Lifts the widget slightly and enhances its shadow when one is present.
     * No-ops while the widget is pressed to avoid conflicting with `onStart`.
     */
    const onHoverEnter = () => {
      if (isPressed) return;
      widget._hovering = true;
      // Use the independent `translate` property.
      widget.style.translate = "0 -0.5px";
      if (hoverShadow) widget.style.boxShadow = hoverShadow;
    };

    /**
     * Handles hover-leave (`mouseleave`).
     * Restores translate and shadow without touching `transform`.
     * No-ops while the widget is pressed.
     */
    const onHoverLeave = () => {
      if (isPressed) return;
      // Restore translate without touching transform.
      widget.style.translate = "";
      widget.style.boxShadow = widget._originalShadow || "";
      widget._hovering = false;
    };

    widget.addEventListener("mouseenter", onHoverEnter, { passive: true });
    widget.addEventListener("mouseleave", onHoverLeave, { passive: true });
    listeners.push({ event: "mouseenter", handler: onHoverEnter });
    listeners.push({ event: "mouseleave", handler: onHoverLeave });

    // An update re-applies the props' own shadow and translate, which cancels a
    // hover that is still in progress. Re-assert it, from the same base, so a
    // reactive update neither drops the lift nor climbs another step.
    if (widget._hovering) {
      widget.style.translate = "0 -0.5px";
      if (hoverShadow) widget.style.boxShadow = hoverShadow;
    }

    widget.style.cursor = "pointer";
  }

  widget._effectListeners = listeners;
  return widget;
};

export default applyEffects;
