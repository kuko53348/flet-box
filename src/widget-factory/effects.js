// core/effects.js - EFECTOS VISUALES CON LIMPIEZA
export const applyEffects = (widget) => {
  // Limpiar listeners anteriores si existen
  if (widget._effectListeners) {
    widget._effectListeners.forEach(({ event, handler }) => {
      widget.removeEventListener(event, handler);
    });
    widget._effectListeners = [];
  }

  widget.style.webkitTapHighlightColor = "transparent";
  widget.style.outline = "none";
  widget.style.transition = "box-shadow 0.2s ease, transform 0.15s ease";

  const hasClick = widget.onclick && typeof widget.onclick === "function";
  if (!hasClick) return widget;

  const originalShadow = widget.style.boxShadow;
  // Usar _originalProps en lugar de _props (definido en widgetFactory)
  const disableTransform = widget._originalProps?.disableTransform === true;
  const listeners = [];

  if (!disableTransform) {
    const onStart = () => {
      widget.style.transform = "scale(0.98)";
      widget.style.boxShadow = "none";
    };
    const onEnd = () => {
      widget.style.transform = "";
      widget.style.boxShadow = originalShadow || "";
    };

    // Eventos de presión (mouse y touch)
    const pressEvents = [
      "mousedown",
      "touchstart",
      "mouseup",
      "touchend",
      "mouseleave",
      "touchcancel",
    ];
    pressEvents.forEach((ev) => {
      const handler =
        ev === "mousedown" || ev === "touchstart" ? onStart : onEnd;
      widget.addEventListener(ev, handler);
      listeners.push({ event: ev, handler });
    });

    // Eventos de hover
    const onHoverEnter = () => {
      widget.style.transform = "translateY(-0.5px) scale(1.00)";
      if (originalShadow && originalShadow !== "none") {
        // Asignamos una sombra más grande sin usar replace
        widget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
      }
    };
    const onHoverLeave = () => {
      widget.style.transform = "";
      widget.style.boxShadow = originalShadow || "";
    };
    widget.addEventListener("mouseenter", onHoverEnter);
    widget.addEventListener("mouseleave", onHoverLeave);
    listeners.push({ event: "mouseenter", handler: onHoverEnter });
    listeners.push({ event: "mouseleave", handler: onHoverLeave });

    widget.style.cursor = "pointer";
  }

  // Guardar referencias para limpieza futura
  widget._effectListeners = listeners;
  return widget;
};

export default applyEffects;
