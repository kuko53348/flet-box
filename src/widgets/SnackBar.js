// widgets/SnackBar.js - Versión definitiva con colores del tema
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

// Colores de respaldo (si el tema aún no está inicializado)
const FALLBACK = {
  gray800: "#1e293b",
  primary: "#6366f1",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  gray900: "#0f172a",
  white: "#ffffff",
};

// Función segura para obtener color del tema
const getThemeColor = (name, fallback) => {
  try {
    return (colors && colors[name]) || fallback;
  } catch {
    return fallback;
  }
};

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
    borderRadius = 8,
    padding = "12px 16px",
    margin = 16,
    elevation = 2,
    animationDuration = 300,
    zIndex = 10000,
    onShow,
    onClose,
  } = options;

  // Presets usando colores del tema (con fallback)
  const presets = {
    normal: {
      bg: getThemeColor("gray800", FALLBACK.gray800),
      text: FALLBACK.white,
      action: getThemeColor("primary", FALLBACK.primary),
    },
    success: {
      bg: getThemeColor("success", FALLBACK.success),
      text: FALLBACK.white,
      action: FALLBACK.white,
    },
    error: {
      bg: getThemeColor("danger", FALLBACK.danger),
      text: FALLBACK.white,
      action: FALLBACK.white,
    },
    warning: {
      bg: getThemeColor("warning", FALLBACK.warning),
      text: getThemeColor("gray900", FALLBACK.gray900),
      action: getThemeColor("gray900", FALLBACK.gray900),
    },
    info: {
      bg: getThemeColor("info", FALLBACK.info),
      text: FALLBACK.white,
      action: FALLBACK.white,
    },
  };

  const preset = presets[type] || presets.normal;
  const finalBg = customBg || preset.bg;
  const finalText = customText || preset.text;
  const finalAction = customAction || preset.action;

  // Crear contenedor principal
  const snackbar = WidgetFactory({
    tag: "div",
    position: "fixed",
    left: `${margin}px`,
    right: `${margin}px`,
    [position]: `${margin}px`,
    backgroundColor: finalBg,
    borderRadius:
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    padding: padding,
    zIndex: zIndex,
    boxShadow:
      elevation === 0
        ? "none"
        : `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.15)`,
    opacity: 0,
    transform:
      position === "bottom"
        ? `translateY(calc(100% + ${margin}px))`
        : `translateY(calc(-100% - ${margin}px))`,
    transition: `opacity ${animationDuration}ms ease, transform ${animationDuration}ms ease`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    fontSize: "14px",
    lineHeight: "1.4",
    color: finalText,
    fontFamily: "system-ui, -apple-system, sans-serif",
    flexWrap: "wrap",
  });

  // Mensaje
  const messageEl = WidgetFactory({
    tag: "span",
    flex: 1,
    textContent: message,
    wordBreak: "break-word",
  });
  snackbar.appendChild(messageEl);

  // Botón de acción
  let actionBtn = null;
  if (action) {
    actionBtn = WidgetFactory({
      tag: "button",
      backgroundColor: "transparent",
      border: "none",
      color: finalAction,
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      padding: "4px 8px",
      margin: "-4px -8px -4px 0",
      borderRadius: "4px",
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

  // Botón de cierre (si es dismissible y no hay acción)
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

  // Añadir al DOM
  document.body.appendChild(snackbar);
  // Forzar reflow
  snackbar.offsetHeight;

  let timeoutId = null;

  const show = () => {
    requestAnimationFrame(() => {
      snackbar.style.opacity = "1";
      snackbar.style.transform = "translateY(0)";
    });
    if (onShow) onShow();
  };

  const close = () => {
    if (timeoutId) clearTimeout(timeoutId);
    snackbar.style.opacity = "0";
    snackbar.style.transform =
      position === "bottom"
        ? `translateY(calc(100% + ${margin}px))`
        : `translateY(calc(-100% - ${margin}px))`;
    setTimeout(() => {
      if (snackbar.parentNode) snackbar.parentNode.removeChild(snackbar);
      if (onClose) onClose();
    }, animationDuration);
  };

  show();
  if (duration > 0) {
    timeoutId = setTimeout(close, duration);
  }

  return { close, show, getElement: () => snackbar };
}

export default SnackBar;
