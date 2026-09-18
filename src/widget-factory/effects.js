// core/effects.js
export const applyEffects = (widget) => {
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

  // Guardar shadow actual en el widget
  widget._originalShadow = widget.style.boxShadow || "";

  const disableTransform = widget._originalProps?.disableTransform === true;
  const listeners = [];

  if (!disableTransform) {
    let isPressed = false;

    const onStart = () => {
      if (isPressed) return;
      isPressed = true;
      // ✅ Uso de scale independiente para no chocar con stackPosition
      widget.style.scale = "0.98";
      widget.style.boxShadow = "none";
    };

    const onEnd = () => {
      if (!isPressed) return;
      isPressed = false;
      // ✅ Restaurar scale sin tocar transform
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

    const onHoverEnter = () => {
      if (isPressed) return;
      // ✅ Uso de translate independiente
      widget.style.translate = "0 -0.5px";
      if (widget._originalShadow && widget._originalShadow !== "none") {
        widget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
      }
    };

    const onHoverLeave = () => {
      if (isPressed) return;
      // ✅ Restaurar translate sin tocar transform
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