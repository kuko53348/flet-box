// widgets/Slider.js - Corrected and complete version
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

// Inject keyframes only once
const injectedKeyframes = new Set();
const injectKeyframes = (name, css) => {
  if (injectedKeyframes.has(name)) return;
  const style = document.createElement("style");
  style.textContent = `@keyframes ${name} { ${css} }`;
  document.head.appendChild(style);
  injectedKeyframes.add(name);
};

injectKeyframes(
  "slider-stripes",
  `0% { background-position: 0 0; } 100% { background-position: 20px 0; }`,
);
injectKeyframes(
  "slider-glow",
  `0% { filter: brightness(1); } 50% { filter: brightness(1.2); box-shadow: 0 0 8px currentColor; } 100% { filter: brightness(1); }`,
);

export const Slider = (props) => {
  let {
    // Basic values
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    // Appearance
    width = "100%",
    height = 4,
    thumbSize = 20,
    color = colors.primary,
    trackColor = colors.border,
    thumbColor = "#fff",
    orientation = "horizontal",
    inverted = false,
    // Text and marks
    showValue = false,
    valuePrefix = "",
    valueSuffix = "",
    showMarks = false,
    marks = [], // ← implemented
    // Visual effects
    striped = true,
    animatedStripes = false,
    stripeColor = "rgba(255,255,255,0.25)",
    glow = false,
    // Events
    onChanged,
    onChangeEnd,
    // Rest
    ...rest
  } = props;

  // Internal state
  let currentValue = Math.min(Math.max(value, min), max);
  let currentMin = min;
  let currentMax = max;
  let currentStep = step;

  // Percentage (0..1) always in positive direction (not inverted)
  let rawPercent = (currentValue - currentMin) / (currentMax - currentMin);
  let displayPercent = inverted ? 1 - rawPercent : rawPercent;

  let isHorizontal = orientation === "horizontal";
  let trackSizePx = isHorizontal ? height : width;
  let trackLengthPx =
    typeof trackSizePx === "number" ? `${trackSizePx}px` : trackSizePx;
  let thumbSizeNum = typeof thumbSize === "number" ? thumbSize : 20;

  // Main container
  const container = WidgetFactory({
    tag: "div",
    width: isHorizontal ? width : "auto",
    height: !isHorizontal ? width : "auto",
    opacity: disabled ? 0.5 : 1,
    ...rest,
  });

  // ---------- Value display ----------
  let valueDisplay = null;
  if (showValue) {
    valueDisplay = WidgetFactory({
      tag: "div",
      textContent: `${valuePrefix}${currentValue}${valueSuffix}`,
      fontSize: "14px",
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: isHorizontal ? "4px" : "0",
      marginRight: !isHorizontal ? "4px" : "0",
    });
    container.appendChild(valueDisplay);
  }

  // ---------- Wrapper (ensures fixed height/width) ----------
  const wrapper = WidgetFactory({
    tag: "div",
    position: "relative",
    ...(isHorizontal
      ? {
          width: "100%",
          height: trackLengthPx,
          display: "flex",
          alignItems: "center",
        }
      : {
          height: "100%", // for vertical, the wrapper takes the full height
          display: "flex",
          justifyContent: "center",
        }),
  });
  container.appendChild(wrapper);

  // ---------- Track (background) ----------
  const track = WidgetFactory({
    tag: "div",
    position: "relative",
    ...(isHorizontal
      ? {
          width: "100%",
          height: trackLengthPx,
        }
      : {
          width: trackLengthPx,
          height: "100%",
        }),
    backgroundColor: trackColor,
    borderRadius: trackLengthPx,
    cursor: disabled ? "not-allowed" : "pointer",
  });
  wrapper.appendChild(track);

  // ---------- Fill (progress) ----------
  const fill = WidgetFactory({
    tag: "div",
    position: "absolute",
    backgroundColor: color,
    borderRadius: trackLengthPx,
    transition: disabled ? "none" : "width 0.1s ease, height 0.1s ease",
    ...(isHorizontal
      ? {
          width: `${displayPercent * 100}%`,
          height: "100%",
          left: 0,
          top: 0,
        }
      : {
          height: `${displayPercent * 100}%`,
          width: "100%",
          bottom: 0,
          left: 0,
        }),
  });

  if (striped) {
    fill.style.backgroundImage = `repeating-linear-gradient(45deg, ${stripeColor} 0px, ${stripeColor} 8px, transparent 8px, transparent 16px)`;
    fill.style.backgroundSize = "16px 16px";
    if (animatedStripes)
      fill.style.animation = "slider-stripes 0.5s linear infinite";
  }
  if (glow) fill.style.animation = "slider-glow 1.5s ease-in-out infinite";
  track.appendChild(fill);

  // ---------- Thumb (knob) ----------
  const thumb = WidgetFactory({
    tag: "div",
    position: "absolute",
    width: `${thumbSizeNum}px`,
    height: `${thumbSizeNum}px`,
    backgroundColor: thumbColor,
    borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    cursor: disabled ? "not-allowed" : "grab",
    zIndex: 2,
    boxSizing: "border-box",
    pointerEvents: "auto",
    ...(isHorizontal
      ? {
          top: "50%",
          transform: "translateY(-50%)",
        }
      : {
          left: "50%",
          transform: "translateX(-50%)",
        }),
  });
  wrapper.appendChild(thumb);

  // ---------- Marks ----------
  let marksContainer = null;
  if (showMarks) {
    marksContainer = WidgetFactory({
      tag: "div",
      position: "absolute",
      ...(isHorizontal
        ? {
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            height: "100%",
            pointerEvents: "none",
          }
        : {
            top: 0,
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            pointerEvents: "none",
          }),
    });
    wrapper.appendChild(marksContainer);
    renderMarks();
  }

  // ---------- Helper functions ----------
  function renderMarks() {
    if (!marksContainer) return;
    // Clear previous marks
    while (marksContainer.firstChild)
      marksContainer.removeChild(marksContainer.firstChild);

    const markValues = marks.length ? marks : generateDefaultMarks();
    for (const mark of markValues) {
      const markValue = typeof mark === "number" ? mark : mark.value;
      if (markValue < currentMin || markValue > currentMax) continue;

      const percent = (markValue - currentMin) / (currentMax - currentMin);
      const posPercent = inverted ? 1 - percent : percent;

      let markElement = WidgetFactory({
        tag: "div",
        position: "absolute",
        ...(isHorizontal
          ? {
              left: `${posPercent * 100}%`,
              // transform: 'translateX(-50%)',
              top: "50%",
              transform: "translate(-50%, -50%)",
            }
          : {
              bottom: `${posPercent * 100}%`,
              transform: "translate(-50%, 50%)",
              left: "50%",
            }),
        width: mark.size || 4,
        height: mark.size || 4,
        backgroundColor: mark.color || colors.textSecondary,
        borderRadius: "50%",
        cursor: "pointer",
      });
      if (mark.label) {
        const label = WidgetFactory({
          tag: "span",
          textContent: mark.label,
          fontSize: "10px",
          color: colors.textSecondary,
          position: "absolute",
          ...(isHorizontal
            ? {
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginTop: "4px",
              }
            : {
                left: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                marginLeft: "4px",
              }),
          whiteSpace: "nowrap",
        });
        markElement.appendChild(label);
      }
      marksContainer.appendChild(markElement);
    }
  }

  function generateDefaultMarks() {
    const stepMark = (currentMax - currentMin) / 4;
    const marksList = [];
    for (let i = currentMin; i <= currentMax + 0.1; i += stepMark) {
      marksList.push(Math.round(i));
    }
    return marksList;
  }

  // Update the position of the fill and thumb
  function updateUI() {
    rawPercent = (currentValue - currentMin) / (currentMax - currentMin);
    displayPercent = inverted ? 1 - rawPercent : rawPercent;

    if (isHorizontal) {
      fill.style.width = `${displayPercent * 100}%`;
    } else {
      fill.style.height = `${displayPercent * 100}%`;
    }
    updateThumbPosition();
    if (valueDisplay) {
      valueDisplay.textContent = `${valuePrefix}${currentValue}${valueSuffix}`;
    }
    if (showMarks && marksContainer) {
      renderMarks();
    }
  }

  function updateThumbPosition() {
    if (!track || !thumb) return;
    const trackRect = track.getBoundingClientRect();
    if (trackRect.width === 0 && trackRect.height === 0) {
      requestAnimationFrame(updateThumbPosition);
      return;
    }
    if (isHorizontal) {
      const left = displayPercent * trackRect.width;
      thumb.style.left = `${left - thumbSizeNum / 2}px`;
      thumb.style.top = "50%";
      thumb.style.transform = "translateY(-50%)";
    } else {
      const bottom = displayPercent * trackRect.height;
      thumb.style.bottom = `${bottom - thumbSizeNum / 2}px`;
      thumb.style.left = "50%";
      thumb.style.transform = "translateX(-50%)";
    }
  }

  function calcValueFromEvent(clientX, clientY) {
    const rect = track.getBoundingClientRect();
    let percent;
    if (isHorizontal) {
      let x = clientX - rect.left;
      percent = Math.min(Math.max(x / rect.width, 0), 1);
    } else {
      let y = rect.bottom - clientY;
      percent = Math.min(Math.max(y / rect.height, 0), 1);
    }
    if (inverted) percent = 1 - percent;
    let raw = currentMin + percent * (currentMax - currentMin);
    let stepped = Math.round(raw / currentStep) * currentStep;
    return Math.min(Math.max(stepped, currentMin), currentMax);
  }

  function setValue(newVal, triggerChange = true, triggerEnd = false) {
    if (disabled) return;
    let clamped = Math.min(Math.max(newVal, currentMin), currentMax);
    if (clamped === currentValue) return;
    currentValue = clamped;
    updateUI();
    if (triggerChange && onChanged) onChanged(currentValue);
    if (triggerEnd && onChangeEnd) onChangeEnd(currentValue);
  }

  // ---------- Drag events ----------
  let dragging = false;
  let currentPointerId = null;
  let hasMoved = false;

  const onMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    let clientX, clientY;
    if (e.clientX !== undefined) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else return;
    const newValue = calcValueFromEvent(clientX, clientY);
    setValue(newValue, true, false);
    hasMoved = true;
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    if (currentPointerId !== null) {
      thumb.releasePointerCapture(currentPointerId);
      currentPointerId = null;
    }
    if (hasMoved && onChangeEnd) onChangeEnd(currentValue);
    hasMoved = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
    thumb.style.cursor = "grab";
    if (wrapper.style) wrapper.style.touchAction = "";
  };

  const onStart = (e) => {
    if (disabled) return;
    e.preventDefault();
    dragging = true;
    hasMoved = false;
    thumb.style.cursor = "grabbing";
    if (e.pointerId !== undefined) {
      currentPointerId = e.pointerId;
      thumb.setPointerCapture(currentPointerId);
    }
    if (wrapper.style) wrapper.style.touchAction = "none";

    let clientX, clientY;
    if (e.clientX !== undefined) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else return;

    const newValue = calcValueFromEvent(clientX, clientY);
    setValue(newValue, true, false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onEnd);
  };

  track.addEventListener("mousedown", onStart);
  track.addEventListener("touchstart", onStart);
  thumb.addEventListener("mousedown", onStart);
  thumb.addEventListener("touchstart", onStart);

  // ---------- ResizeObserver to reposition thumb ----------
  let resizeObserver = null;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      updateThumbPosition();
    });
    resizeObserver.observe(track);
  } else {
    window.addEventListener("resize", updateThumbPosition);
  }

  // ---------- Public API and reactivity ----------
  const update = (newProps) => {
    let needsUpdate = false;
    if (newProps.min !== undefined && newProps.min !== currentMin) {
      currentMin = newProps.min;
      needsUpdate = true;
    }
    if (newProps.max !== undefined && newProps.max !== currentMax) {
      currentMax = newProps.max;
      needsUpdate = true;
    }
    if (newProps.step !== undefined && newProps.step !== currentStep) {
      currentStep = newProps.step;
      needsUpdate = true;
    }
    if (newProps.value !== undefined && newProps.value !== currentValue) {
      currentValue = Math.min(Math.max(newProps.value, currentMin), currentMax);
      needsUpdate = true;
    }
    if (needsUpdate) {
      updateUI();
      if (onChanged) onChanged(currentValue);
    }
  };

  Object.defineProperty(container, "value", {
    get: () => currentValue,
    set: (v) => setValue(v, true, false),
  });
  Object.defineProperty(container, "min", {
    get: () => currentMin,
    set: (v) => update({ min: v }),
  });
  Object.defineProperty(container, "max", {
    get: () => currentMax,
    set: (v) => update({ max: v }),
  });
  Object.defineProperty(container, "step", {
    get: () => currentStep,
    set: (v) => update({ step: v }),
  });

  container.setValue = (v) => setValue(v, true, false);
  container.getValue = () => currentValue;
  container.update = update;

  // ---------- Cleanup ----------
  const cleanup = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener("resize", updateThumbPosition);
    }
    track.removeEventListener("mousedown", onStart);
    track.removeEventListener("touchstart", onStart);
    thumb.removeEventListener("mousedown", onStart);
    thumb.removeEventListener("touchstart", onStart);
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  };
  if (container.onUnmount) container.onUnmount(cleanup);
  else container._cleanup = cleanup;

  // Initialize position
  setTimeout(() => updateThumbPosition(), 0);
  return container;
};

export default Slider;
