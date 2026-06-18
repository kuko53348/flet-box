// effects.js - Corregido (transform solo si no está deshabilitado)
export const applyEffects = (widget) => {
  widget.style.webkitTapHighlightColor = "transparent";
  widget.style.outline = "none";

  // ✅ Establecemos transición solo para box-shadow, no para transform
  widget.style.transition = "box-shadow 0.2s ease";

  // Verificar si realmente hay un callback (no solo una función vacía)
  const hasRealCallback =
    widget.onclick && typeof widget.onclick === "function";

  if (hasRealCallback) {
    const originalCallback = widget.onclick;
    const originalShadow = widget.style.boxShadow;
    widget._originalShadow = originalShadow;

    let isPressed = false;

    // ✅ Verificar si debemos deshabilitar transformaciones
    const disableTransform = widget._props?.disableTransform === true;

    // Press (solo si no está deshabilitado)
    widget.onclick = (event) => {
      if (!disableTransform) {
        isPressed = true;
        widget.style.transform = "scale(0.97)";
        widget.style.boxShadow = "none";
      }

      setTimeout(() => {
        originalCallback(widget, event);

        setTimeout(() => {
          if (!disableTransform) {
            widget.style.transform = "";
            widget.style.boxShadow = originalShadow;
            isPressed = false;
          }
        }, 150);
      }, 50);
    };

    // Hover (solo si no está deshabilitado)
    if (!disableTransform) {
      widget.addEventListener("mouseenter", () => {
        if (isPressed) return;
        widget.style.transform = "translateY(-1.2px)";
        if (originalShadow && originalShadow !== "none") {
          widget.style.boxShadow = originalShadow.replace(
            /0 \d+px \d+px/,
            "0 8px 16px",
          );
        }
      });

      widget.addEventListener("mouseleave", () => {
        if (isPressed) return;
        widget.style.transform = "";
        widget.style.boxShadow = originalShadow;
      });
    }

    widget.style.cursor = "pointer";
  }

  return widget;
};
