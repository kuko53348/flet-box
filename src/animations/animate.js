// utils/animate.js - Complete Enhanced Version

// ========== INTERPOLATION HELPERS ==========

const interpolate = (from, to, progress) => {
  // Number to number
  if (typeof from === "number" && typeof to === "number") {
    return from + (to - from) * progress;
  }
  // Color to color (hex → rgb)
  if (typeof from === "string" && from.startsWith("#")) {
    return interpolateColor(from, to, progress);
  }
  // String with units (e.g., "16px", "2rem")
  if (typeof from === "string") {
    const fromNum = parseFloat(from);
    const toNum = parseFloat(to);
    const unit = from.replace(fromNum.toString(), "");
    return fromNum + (toNum - fromNum) * progress + unit;
  }
  return to;
};

const interpolateColor = (color1, color2, progress) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * progress);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * progress);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * progress);
  return `rgb(${r}, ${g}, ${b})`;
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// ========== EASING FUNCTIONS ==========

const getEasing = (type, t) => {
  const easings = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  };
  return easings[type]?.(t) ?? t;
};

const readAnimatedValue = (widget, property) => {
  if (property === "scale") return 1;
  if (widget?.style && property in widget.style) {
    return widget.style[property];
  }
  return widget?.[property];
};

const writeAnimatedValue = (widget, property, value) => {
  if (!widget) return;
  if (property === "scale") {
    widget.style.transform = `scale(${value})`;
    return;
  }
  if (widget.style && property in widget.style) {
    const unitlessProperties = new Set([
      "opacity",
      "zIndex",
      "fontWeight",
      "lineHeight",
      "flexGrow",
      "flexShrink",
    ]);
    widget.style[property] =
      typeof value === "number" && !unitlessProperties.has(property)
        ? `${value}px`
        : value;
    return;
  }
  widget[property] = value;
};

// ========== FIRE AND FORGET (No Promise) ==========
// Use for simple animations where you don't need to know when they finish
export const animate = (
  widget,
  property,
  from,
  to,
  duration = 300,
  easing = "linear",
) => {
  const startTime = performance.now();
  const startValue = from !== undefined ? from : readAnimatedValue(widget, property);
  const endValue = to;

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const easedProgress = getEasing(easing, progress);
    const currentValue = interpolate(startValue, endValue, easedProgress);

    writeAnimatedValue(widget, property, currentValue);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

// ========== ASYNC ANIMATION (Returns Promise) ==========
// Use when you need to wait for the animation to complete
export const animateAsync = (
  widget,
  property,
  from,
  to,
  duration = 300,
  easing = "linear",
) => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const startValue = from !== undefined ? from : readAnimatedValue(widget, property);
    const endValue = to;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = getEasing(easing, progress);
      const currentValue = interpolate(startValue, endValue, easedProgress);

      writeAnimatedValue(widget, property, currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve(widget);
      }
    };

    requestAnimationFrame(step);
  });
};

// ========== HELPER FUNCTIONS (Fire and Forget) ==========

export const fadeOut = (widget, duration = 300) => {
  animate(widget, "opacity", 1, 0, duration);
};

export const fadeIn = (widget, duration = 300) => {
  animate(widget, "opacity", 0, 1, duration);
};

export const pulse = (widget, duration = 300) => {
  animate(widget, "scale", 1, 1.1, duration / 2);
  setTimeout(() => {
    animate(widget, "scale", 1.1, 1, duration / 2);
  }, duration / 2);
};

// ========== ASYNC HELPER FUNCTIONS (Returns Promise) ==========

export const fadeOutAsync = (widget, duration = 300) => {
  return animateAsync(widget, "opacity", 1, 0, duration);
};

export const fadeInAsync = (widget, duration = 300) => {
  return animateAsync(widget, "opacity", 0, 1, duration);
};

export const pulseAsync = async (widget, duration = 300) => {
  await animateAsync(widget, "scale", 1, 1.1, duration / 2);
  await animateAsync(widget, "scale", 1.1, 1, duration / 2);
};
