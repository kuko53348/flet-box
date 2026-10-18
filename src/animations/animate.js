/**
 * animate.js - Imperative animation utilities for DOM widgets.
 *
 * Provides two tiers of animation helpers:
 * - **Fire-and-forget** (`animate`, `fadeOut`, `fadeIn`, `pulse`): start an
 *   animation and move on — each returns a cancel function instead of awaiting.
 * - **Async/awaitable** (`animateAsync`, `fadeOutAsync`, `fadeInAsync`,
 *   `pulseAsync`): return a Promise that resolves when the animation finishes,
 *   allowing sequential composition with `await`.
 *
 * Every loop is registered per widget and property, so starting a second
 * animation on the same property replaces the first (two loops writing one style
 * fight each other), and {@link stopAnimation} ends whatever is still running on
 * a widget — the usual cleanup an unmount needs when the caller kept no handle.
 *
 * All functions drive the browser's `requestAnimationFrame` loop directly and
 * do not rely on CSS transitions or the Web Animations API.
 *
 * @module animations/animate
 */

// ========== INTERPOLATION HELPERS ==========

/**
 * Interpolates between two values at a given progress point.
 * Handles three value types:
 * - `number → number`: straight numeric lerp.
 * - `"#rrggbb" → string`: delegates to {@link interpolateColor}.
 * - `"16px" → string`: parses the numeric part, lerps it, re-attaches the unit.
 *
 * @param {number|string} from     - Starting value.
 * @param {number|string} to       - Ending value.
 * @param {number}        progress - Interpolation factor in [0, 1].
 * @returns {number|string} Interpolated value.
 */
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

/**
 * Linearly interpolates between two hex color values, returning an `rgb()` string.
 *
 * @param {string} color1   - Starting color as a hex string (e.g. `"#ff0000"`).
 * @param {string} color2   - Ending color as a hex string.
 * @param {number} progress - Interpolation factor in [0, 1].
 * @returns {string} Interpolated color as `"rgb(r, g, b)"`.
 */
const interpolateColor = (color1, color2, progress) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * progress);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * progress);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * progress);
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Parses a hex color string into its red, green, and blue components.
 *
 * @param {string} hex - Hex color string (with or without leading `#`).
 * @returns {{ r: number, g: number, b: number }} RGB components in [0, 255].
 *   Returns `{ r: 0, g: 0, b: 0 }` if the string cannot be parsed.
 */
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

/**
 * Applies a named easing curve to a linear progress value.
 * Falls back to linear if `type` is not recognized.
 *
 * @param {"linear"|"easeIn"|"easeOut"|"easeInOut"} type - Easing curve name.
 * @param {number} t - Raw linear progress in [0, 1].
 * @returns {number} Eased progress value in [0, 1].
 */
const getEasing = (type, t) => {
  const easings = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  };
  return easings[type]?.(t) ?? t;
};

/**
 * Reads the current animated value of a property from a widget.
 * For `"scale"`, returns `1` as a safe default since scale is stored
 * inside a `transform` string rather than as a standalone property.
 *
 * @param {HTMLElement|object} widget   - The target widget or DOM element.
 * @param {string}             property - The property to read.
 * @returns {number|string} The current value, or `1` for `"scale"`.
 */
const readAnimatedValue = (widget, property) => {
  if (property === "scale") return 1;
  if (widget?.style && property in widget.style) {
    const inline = widget.style[property];
    // An inline-unset property reads as "" and `interpolate` turns that into the
    // string "NaN", which the browser silently drops — so `animate(el, "opacity",
    // undefined, 1, 300)` (the documented API) wrote "NaN" every frame and never
    // animated anything. Fall back to the property's neutral value.
    if (inline !== "" && inline !== null && inline !== undefined) return inline;
    return property === "opacity" ? 1 : 0;
  }
  return widget?.[property];
};

/**
 * Writes an animated value to a widget property.
 * - `"scale"` is written as `transform: scale(value)`.
 * - Numeric values for style properties that require a unit get `"px"` appended
 *   (unitless properties such as `opacity`, `zIndex`, etc. are exempt).
 * - Falls back to setting the property directly on the widget object for
 *   non-style properties.
 *
 * @param {HTMLElement|object} widget   - The target widget or DOM element.
 * @param {string}             property - The property to write.
 * @param {number|string}      value    - The value to assign.
 * @returns {void}
 */
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

// ========== ACTIVE LOOP REGISTRY ==========

/**
 * Live loops by widget and property.
 *
 * Two loops writing the same style property fight each other: the older one keeps
 * overwriting the newer value on every frame and neither can be stopped. The
 * registry lets a fresh animation replace whatever already animates that
 * property, and lets {@link stopAnimation} end loops whose caller never kept the
 * handle — the usual case for a widget that unmounts mid-fade.
 *
 * @type {WeakMap<object, Map<string, { raf: number, running: boolean, cancel: () => boolean }>>}
 */
const activeLoops = new WeakMap();

const isTrackable = (widget) =>
  widget !== null &&
  (typeof widget === "object" || typeof widget === "function");

const registerLoop = (widget, property, state) => {
  if (!isTrackable(widget)) return;
  let byProperty = activeLoops.get(widget);
  if (!byProperty) {
    byProperty = new Map();
    activeLoops.set(widget, byProperty);
  }
  byProperty.set(property, state);
};

const unregisterLoop = (widget, property, state) => {
  if (!isTrackable(widget)) return;
  const byProperty = activeLoops.get(widget);
  if (byProperty && byProperty.get(property) === state) byProperty.delete(property);
};

/**
 * Stops the animation currently running on a widget.
 *
 * @param {HTMLElement|object} widget - The animated widget or DOM element.
 * @param {string} [property] - Stop only this property; every animated property when omitted.
 * @returns {boolean} True when at least one loop was stopped.
 */
export const stopAnimation = (widget, property) => {
  if (!isTrackable(widget)) return false;
  const byProperty = activeLoops.get(widget);
  if (!byProperty) return false;

  if (property !== undefined) {
    const state = byProperty.get(property);
    if (!state) return false;
    return state.cancel();
  }

  const loops = Array.from(byProperty.values());
  loops.forEach((state) => state.cancel());
  return loops.length > 0;
};

/**
 * Runs one property animation and returns its cancel function.
 *
 * Shared engine behind `animate`, `animateAsync` and `pulse`, so all three get
 * the same guarantees: the loop is bounded by a sanitised duration, it replaces
 * any animation already driving that property, and it stops the moment its
 * handle is called.
 *
 * @param {HTMLElement|object} widget
 * @param {string} property
 * @param {number|string} from - Starting value; reads the widget when `undefined`.
 * @param {number|string} to
 * @param {number} duration
 * @param {string} easing
 * @param {(progress: number) => number|string} [valueAt] - Custom value curve,
 *   receiving eased progress in `[0, 1]`. Used by `pulse` to keep the whole
 *   up-and-down gesture inside a single cancelable loop.
 * @param {(progress: number) => number|string} [valueAt] - Custom value curve,
 *   receiving eased progress in `[0, 1]`. Used by `pulse` to keep the whole
 *   up-and-down gesture inside a single cancelable loop.
 * @param {(widget: HTMLElement|object) => void} [onDone] - Called when the loop
 *   ends — also when it is cancelled or replaced, so awaiting code never hangs.
 * @returns {() => boolean} Cancel function; true when it stopped a live loop.
 */
const runAnimation = (
  widget,
  property,
  from,
  to,
  duration,
  easing,
  valueAt,
  onDone,
) => {
  // A negative duration makes elapsed/duration increasingly negative, so progress
  // never reaches 1 and the loop re-arms forever (and `animateAsync` never
  // resolves). Clamping the progress is not enough — it just sits at 0 and
  // `0 < 1` stays true — so sanitise the duration itself. `0` collapses to one frame.
  const safeDuration = Math.max(0, Number(duration) || 0);
  const startValue = from !== undefined ? from : readAnimatedValue(widget, property);

  // Replace the loop already animating this property instead of racing it.
  stopAnimation(widget, property);

  const startTime = performance.now();
  const state = { raf: 0, running: true, cancel: null };

  const finish = () => {
    if (!state.running) return;
    state.running = false;
    unregisterLoop(widget, property, state);
    if (onDone) onDone(widget);
  };

  state.cancel = () => {
    if (!state.running) return false;
    cancelAnimationFrame(state.raf);
    finish();
    return true;
  };

  registerLoop(widget, property, state);

  const step = (currentTime) => {
    if (!state.running) return;
    const progress = Math.max(
      0,
      Math.min(1, (currentTime - startTime) / safeDuration),
    );
    const easedProgress = getEasing(easing, progress);
    const currentValue = valueAt
      ? valueAt(easedProgress)
      : interpolate(startValue, to, easedProgress);

    writeAnimatedValue(widget, property, currentValue);

    if (progress < 1) {
      state.raf = requestAnimationFrame(step);
      return;
    }
    finish();
  };

  state.raf = requestAnimationFrame(step);
  return state.cancel;
};

// ========== FIRE AND FORGET (No Promise) ==========

/**
 * Animates a single property of a widget from one value to another.
 * Fire-and-forget: returns immediately without waiting for the animation to end.
 * Use {@link animateAsync} when you need to sequence animations.
 *
 * @param {HTMLElement|object} widget        - The target widget or DOM element.
 * @param {string}             property      - The CSS property (or `"scale"`) to animate.
 * @param {number|string}      from          - Starting value. If `undefined`, the current
 *   value is read from the widget via {@link readAnimatedValue}.
 * @param {number|string}      to            - Ending value.
 * @param {number}             [duration=300] - Animation duration in milliseconds.
 * @param {string}             [easing="linear"] - Easing curve name (see {@link getEasing}).
 * @returns {() => boolean} Cancel function — true if it stopped a loop still running.
 *   The animation also stops on its own when a new animation takes the same property,
 *   or via {@link stopAnimation}.
 */
export const animate = (
  widget,
  property,
  from,
  to,
  duration = 300,
  easing = "linear",
) => runAnimation(widget, property, from, to, duration, easing, null);

// ========== ASYNC ANIMATION (Returns Promise) ==========

/**
 * Animates a single property of a widget from one value to another.
 * Returns a Promise that resolves with the widget once the animation completes.
 * Use this when you need to `await` the end of an animation before starting the next.
 *
 * @param {HTMLElement|object} widget        - The target widget or DOM element.
 * @param {string}             property      - The CSS property (or `"scale"`) to animate.
 * @param {number|string}      from          - Starting value. If `undefined`, the current
 *   value is read from the widget via {@link readAnimatedValue}.
 * @param {number|string}      to            - Ending value.
 * @param {number}             [duration=300] - Animation duration in milliseconds.
 * @param {string}             [easing="linear"] - Easing curve name (see {@link getEasing}).
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` when the animation
 *   finishes — or as soon as it is cancelled or replaced, so `await` never hangs.
 */
export const animateAsync = (
  widget,
  property,
  from,
  to,
  duration = 300,
  easing = "linear",
) =>
  new Promise((resolve) => {
    // `resolve` runs on completion AND when the loop is cancelled or replaced, so
    // an `await` chain cannot hang on an animation that never got to finish.
    runAnimation(widget, property, from, to, duration, easing, null, resolve);
  });

// ========== HELPER FUNCTIONS (Fire and Forget) ==========

/**
 * Fades a widget out by animating its `opacity` from `1` to `0`.
 * Fire-and-forget — does not return a Promise.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Fade duration in milliseconds.
 * @returns {() => boolean} Cancel function (see {@link animate}).
 */
export const fadeOut = (widget, duration = 300) => {
  return animate(widget, "opacity", 1, 0, duration);
};

/**
 * Fades a widget in by animating its `opacity` from `0` to `1`.
 * Fire-and-forget — does not return a Promise.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Fade duration in milliseconds.
 * @returns {() => boolean} Cancel function (see {@link animate}).
 */
export const fadeIn = (widget, duration = 300) => {
  return animate(widget, "opacity", 0, 1, duration);
};

/**
 * Scales a widget up then back to its original size (a "pulse" effect).
 * Fire-and-forget — does not return a Promise. For an awaitable version use
 * {@link pulseAsync}.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Total pulse duration in milliseconds
 *   (split evenly between scale-up and scale-down).
 * @returns {() => boolean} Cancel function (see {@link animate}).
 */
export const pulse = (widget, duration = 300) =>
  runAnimation(
    widget,
    "scale",
    1,
    1,
    duration,
    "linear",
    // One loop with a triangular curve instead of an animation plus a
    // `setTimeout`: the timer used to start phase two on a widget that had
    // already been removed from the DOM, and nothing could cancel it.
    (progress) => interpolate(1, 1.1, progress < 0.5 ? progress * 2 : 2 - progress * 2),
  );

// ========== ASYNC HELPER FUNCTIONS (Returns Promise) ==========

/**
 * Fades a widget out by animating its `opacity` from `1` to `0`.
 * Returns a Promise that resolves when the fade completes.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Fade duration in milliseconds.
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` on completion.
 */
export const fadeOutAsync = (widget, duration = 300) => {
  return animateAsync(widget, "opacity", 1, 0, duration);
};

/**
 * Fades a widget in by animating its `opacity` from `0` to `1`.
 * Returns a Promise that resolves when the fade completes.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Fade duration in milliseconds.
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` on completion.
 */
export const fadeInAsync = (widget, duration = 300) => {
  return animateAsync(widget, "opacity", 0, 1, duration);
};

/**
 * Scales a widget up then back to its original size, awaiting each phase.
 * Use this when subsequent code must run only after the full pulse finishes.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Total pulse duration in milliseconds
 *   (split evenly between scale-up and scale-down).
 * @returns {Promise<void>} Resolves when both phases of the pulse have completed.
 */
export const pulseAsync = async (widget, duration = 300) => {
  await animateAsync(widget, "scale", 1, 1.1, duration / 2);
  await animateAsync(widget, "scale", 1.1, 1, duration / 2);
};
