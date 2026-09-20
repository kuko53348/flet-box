// core/effects.js

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
 *   enhances the box shadow when one was present.
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
  widget._originalShadow = widget.style.boxShadow || "";

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
      // Use the independent `translate` property.
      widget.style.translate = "0 -0.5px";
      if (widget._originalShadow && widget._originalShadow !== "none") {
        widget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
      }
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
    };

    widget.addEventListener("mouseenter", onHoverEnter, { passive: true });
    widget.addEventListener("mouseleave", onHoverLeave, { passive: true });
    listeners.push({ event: "mouseenter", handler: onHoverEnter });
    listeners.push({ event: "mouseleave", handler: onHoverLeave });

    widget.style.cursor = "pointer";
  }

  widget._effectListeners = listeners;
  return widget;
};

export default applyEffects;
