/**
 * @file SnackBar.js
 * @description Transient toast controller returned to callers (`show`/`close`).
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { border } from "../tools/index.js";
import { colors } from "../utils/themes.js";
import { readableInk } from "../utils/readableInk.js";

import { toREM } from "../utils/units.js";

/**
 * SnackBar - Notificación temporal
 * @param {Object} options
 * @returns {Object} { close, show, getElement }
 */
export function SnackBar(options) {
  const {
    message,
    action,
    onAction,
    duration = 3000,
    type = "normal", // 'normal', 'success', 'error', 'warning', 'info'
    position = "bottom", // 'bottom', 'top'
    backgroundColor: customBg,
    textColor: customText,
    actionColor: customAction,
    dismissible = false,
    borderRadius = 16,
    padding = "12px 16px",
    margin = 16,
    elevation = 2,
    animationDuration = 300,
    zIndex = 10000,
    onShow,
    onClose,
  } = options;

  // A preset plate is a solid signal colour, and the theme's ink is not always
  // readable on it: in dark mode `colors.text` is near-white, which measured
  // 1.9:1 on the green. The label follows the plate it is painted on.
  const plateInk = (bg) => {
    if (bg === colors.primary) return colors.onPrimary;
    if (bg === colors.secondary) return colors.onSecondary;
    return readableInk(bg, colors.text);
  };

  const successInk = plateInk(colors.success);
  const dangerInk = plateInk(colors.danger);
  const warningInk = plateInk(colors.warning);
  const infoInk = plateInk(colors.info);

  const presets = {
    normal: {
      bg: colors.surface,
      text: colors.text,
      action: colors.primary,
    },
    success: {
      bg: colors.success,
      text: successInk,
      action: successInk,
    },
    error: {
      bg: colors.danger,
      text: dangerInk,
      action: dangerInk,
    },
    warning: {
      bg: colors.warning,
      text: warningInk,
      action: warningInk,
    },
    info: {
      bg: colors.info,
      text: infoInk,
      action: infoInk,
    },
  };

  const preset = presets[type] || presets.normal;
  const finalBg = customBg || preset.bg;
  const finalText = customText || (customBg ? plateInk(finalBg) : preset.text);
  const finalAction =
    customAction || (customBg ? finalText : preset.action);

  // Createste main container
  const snackbar = WidgetFactory({
    tag: "div",
    position: "fixed",
    left: toREM(margin),
    // borderRadius: borderRadius,
    right: toREM(margin),
    [position]: toREM(margin),
    backgroundColor: finalBg,
    borderRadius:
      toREM(borderRadius),
    padding: padding,
    border: border(1, "solid", colors.gray100),
    zIndex: zIndex,
    boxShadow:
      elevation === 0
        ? "none"
        : `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.15)`,
    opacity: 0,
    transform:
      position === "bottom"
        ? `translateY(calc(100% + ${toREM(margin)}))`
        : `translateY(calc(-100% - ${toREM(margin)}))`,
    transition: `opacity ${animationDuration}ms ease, transform ${animationDuration}ms ease`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    fontSize: 14,
    lineHeight: "1.4",
    color: finalText,
    fontFamily: "system-ui, -apple-system, sans-serif",
    flexWrap: "wrap",
  });

  let timeoutId = null;
  let rafId = null;
  // `close()` is final: it must fire `onClose` exactly once and must win any
  // race against the pending `show()` frame, otherwise closing a toast right
  // after creating it would flash it back to opacity 1 for a full animation.
  let closed = false;

  const show = () => {
    if (closed) return;
    if (rafId !== null) cancelAnimationFrame(rafId);
    // Empty it here, fill it on the frame after: that gap is the whole reason the
    // toast is heard. A live region that arrives with its words already inside is
    // a new landmark, not a change, and a reader who is already on the page is
    // told nothing. Clearing first also makes a second `show()` speak again.
    announcer.textContent = "";
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (closed) return;
      announcer.textContent = message;
      snackbar.style.opacity = "1";
      snackbar.style.transform = "translateY(0)";
    });
    if (onShow) onShow();
  };

  const close = () => {
    if (closed) return;
    closed = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    snackbar.style.opacity = "0";
    snackbar.style.transform =
      position === "bottom"
        ? `translateY(calc(100% + ${toREM(margin)}))`
        : `translateY(calc(-100% - ${toREM(margin)}))`;
    setTimeout(() => {
      if (snackbar.parentNode) snackbar.parentNode.removeChild(snackbar);
      if (announcer.parentNode) announcer.parentNode.removeChild(announcer);
      if (onClose) onClose();
    }, animationDuration);
  };

  // Message
  const messageEl = WidgetFactory({
    tag: "span",
    flex: 1,
    wordBreak: "break-word",
    text: message,
  });
  snackbar.appendChild(messageEl);

  // The thing that speaks is not the bar. An error or a warning interrupts the
  // sentence a reader is in the middle of; a confirmation waits for it to end.
  // `opacity: 0` and one unit of size, because a `display: none` region is not
  // read at all, and the bar's own animation is what the eye follows.
  const announcer = WidgetFactory({
    tag: "div",
    role: type === "error" || type === "warning" ? "alert" : "status",
    "aria-live": type === "error" || type === "warning" ? "assertive" : "polite",
    position: "fixed",
    bottom: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
    overflow: "hidden",
    pointerEvents: "none",
  });

  // Action button
  let actionBtn = null;
  if (action) {
    actionBtn = WidgetFactory({
      tag: "button",
      backgroundColor: "transparent",
      border: "none",
      color: finalAction,
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      padding: "4px 8px",
      margin: "-4px -8px -4px 0",
      borderRadius: 4,
      transition: "opacity 0.2s ease",
      textContent: action,
      onclick: () => {
        if (onAction) onAction();
        close();
      },
    });
    actionBtn.addEventListener("mouseenter", () => {
      actionBtn.style.opacity = "0.8";
    });
    actionBtn.addEventListener("mouseleave", () => {
      actionBtn.style.opacity = "1";
    });
    snackbar.appendChild(actionBtn);
  }

  // Close button (if dismissible and no action)
  let closeBtn = null;
  if (dismissible && !action) {
    closeBtn = WidgetFactory({
      tag: "button",
      backgroundColor: "transparent",
      border: "none",
      color: finalText,
      fontSize: "18px",
      cursor: "pointer",
      padding: "0 4px",
      margin: "-4px 0 -4px 8px",
      opacity: 0.7,
      transition: "opacity 0.2s ease",
      textContent: "✕",
      // The glyph is not a name. A reader hears "multiplication sign" and has to
      // guess that this is the thing that dismisses the message.
      "aria-label": "Dismiss notification",
      onclick: close,
    });
    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.opacity = "1";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.opacity = "0.7";
    });
    snackbar.appendChild(closeBtn);
  }

  // Add to DOM
  document.body.appendChild(snackbar);
  document.body.appendChild(announcer);
  // Force reflow
  snackbar.offsetHeight;

  show();
  if (duration > 0) {
    timeoutId = setTimeout(close, duration);
  }

  return { close, show, getElement: () => snackbar };
}

export default SnackBar;
