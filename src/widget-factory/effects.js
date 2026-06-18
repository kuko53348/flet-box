// core/effects.js - SOLO EFECTOS VISUALES
export const applyEffects = (widget) => {
  widget.style.webkitTapHighlightColor = "transparent";
  widget.style.outline = "none";
  widget.style.transition = "box-shadow 0.2s ease, transform 0.15s ease";

  // ✅ Solo verificar si hay onclick (NO tocar)
  const hasClick = widget.onclick && typeof widget.onclick === "function";

  if (hasClick) {
    const originalShadow = widget.style.boxShadow;
    const disableTransform = widget._props?.disableTransform === true;

    if (!disableTransform) {
      // 🔥 Press effect (visual)
      const onStart = () => {
        widget.style.transform = "scale(0.98)";
        widget.style.boxShadow = "none";
      };

      const onEnd = () => {
        widget.style.transform = "";
        widget.style.boxShadow = originalShadow;
      };

      // Mouse + Touch
      widget.addEventListener("mousedown", onStart);
      widget.addEventListener("touchstart", onStart);
      widget.addEventListener("mouseup", onEnd);
      widget.addEventListener("touchend", onEnd);
      widget.addEventListener("mouseleave", onEnd);
      widget.addEventListener("touchcancel", onEnd);

      // 🔥 Hover effect (visual)
      widget.addEventListener("mouseenter", () => {
        widget.style.transform = "translateY(-0.5px) scale(1.00)";
        if (originalShadow && originalShadow !== "none") {
          widget.style.boxShadow = originalShadow.replace(
            /0 \d+px \d+px/,
            "0 8px 16px",
          );
        }
      });

      widget.addEventListener("mouseleave", () => {
        widget.style.transform = "";
        widget.style.boxShadow = originalShadow;
      });
    }

    widget.style.cursor = "pointer";
  }

  return widget;
};

export default applyEffects;
