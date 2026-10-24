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

import { toREM } from "../utils/units.js";
import { isColor, mixColor } from "./color.js";
import { motionDuration } from "./motion.js";
import { resolveEasing, spring as springCurve } from "./easings.js";

// ========== INTERPOLATION HELPERS ==========

/**
 * Interpolates between two values at a given progress point.
 * Handles four value shapes:
 * - `number → number`: straight numeric lerp.
 * - `#rrggbb` / `rgb()` / `rgba()`: the shared mixer in `color.js`.
 * - `"16px" → anything numeric`: parses the numeric part, lerps it, re-attaches
 *   the starting value's unit.
 * - anything else (a named color, `hidden`/`visible`, a font stack): a cut at the
 *   end of the loop.
 *
 * The last case is the one worth naming: the unit branch used to run `parseFloat`
 * on values with no number in them and write `"NaNpx"` on every frame. The browser
 * drops a declaration it cannot parse, so the animation looked like it ran and
 * changed nothing at all — the same silent failure the transform registry fixed
 * for `translateY`.
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
  // Color to color — hex, rgb() and rgba() all blend
  if (isColor(from) && isColor(to)) {
    return mixColor(from, to, progress);
  }
  // String with units (e.g., "16px", "2rem")
  if (typeof from === "string") {
    const fromNum = parseFloat(from);
    const toNum = parseFloat(to);
    if (Number.isFinite(fromNum) && Number.isFinite(toNum)) {
      const unit = from.replace(fromNum.toString(), "");
      return fromNum + (toNum - fromNum) * progress + unit;
    }
  }
  // Not a number, not a length, not a color: arrive at the end, don't pretend.
  if (from === to) return from;
  return progress >= 1 ? to : from;
};

// ========== EASING FUNCTIONS ==========

/**
 * Applies a named easing curve to a linear progress value.
 *
 * The curves live in `easings.js` so the imperative engine, the presets and a
 * `spring()` all read the same table. A function is accepted as the curve, which
 * is how a caller passes one that is not in the vocabulary.
 *
 * @param {string|((t: number) => number)} type - Easing name or curve.
 * @param {number} t - Raw linear progress in [0, 1].
 * @returns {number} Eased progress; outside `[0, 1]` for the overshoot curves.
 */
const getEasing = (type, t) => resolveEasing(type)(t);

/**
 * Transform functions the engine can animate, with the kind of value each one
 * takes and the value that means "no effect" — the value an animation with no
 * explicit `from` starts from.
 *
 * `translateX`/`rotate`/`skewY` are not properties of `CSSStyleDeclaration`, so
 * the generic write path used to land them on the widget object as a harmless JS
 * field: `animate(row, "translateY", 24, 0)` ran a full animation loop and moved
 * nothing, which is why the skill had to tell you to reach for `scale` even for a
 * slide. They are now composed into one `transform` string.
 *
 * A `length` function takes framework units, not pixels: the bare `24` a caller
 * writes becomes `1.5rem`, the same way every routed prop does, so a slide grows
 * with the reader's font instead of staying a pixel while the row it belongs to
 * got taller. `angle` functions take degrees and `number` functions are scalars.
 *
 * @type {Object<string, { kind: "length"|"angle"|"number", neutral: number }>}
 */
const TRANSFORM_FUNCTIONS = {
  translateX: { kind: "length", neutral: 0 },
  translateY: { kind: "length", neutral: 0 },
  translateZ: { kind: "length", neutral: 0 },
  rotate: { kind: "angle", neutral: 0 },
  rotateX: { kind: "angle", neutral: 0 },
  rotateY: { kind: "angle", neutral: 0 },
  rotateZ: { kind: "angle", neutral: 0 },
  skewX: { kind: "angle", neutral: 0 },
  skewY: { kind: "angle", neutral: 0 },
  scale: { kind: "number", neutral: 1 },
  scaleX: { kind: "number", neutral: 1 },
  scaleY: { kind: "number", neutral: 1 },
};

/**
 * The order the parts are written in. CSS transforms apply left to right, so
 * translate first, then rotate, then scale keeps a rotation spinning about the
 * element's own centre instead of the page's.
 * @type {string[]}
 */
const TRANSFORM_ORDER = Object.keys(TRANSFORM_FUNCTIONS);

/**
 * Live transform parts per widget, so two loops on one element (a slide and a
 * scale) each own a function rather than overwriting the whole string.
 * @type {WeakMap<object, Map<string, number|string>>}
 */
const transformParts = new WeakMap();

/**
 * Merges one transform function into the widget's `transform` string.
 *
 * @param {HTMLElement} widget   - The element to write on.
 * @param {string}      property - A key of {@link TRANSFORM_FUNCTIONS}.
 * @param {number|string} value  - A bare number gets the unit that function needs.
 * @returns {void}
 */
const writeTransformPart = (widget, property, value) => {
  let parts = transformParts.get(widget);
  if (!parts) {
    parts = new Map();
    transformParts.set(widget, parts);
  }
  parts.set(property, formatTransformValue(property, value));
  widget.style.transform = TRANSFORM_ORDER.filter((name) => parts.has(name))
    .map((name) => `${name}(${parts.get(name)})`)
    .join(" ");
};

/**
 * The CSS value of one transform function.
 *
 * A string already carries its unit and is passed through; a bare number is a
 * framework unit for a `length`, degrees for an `angle`, and a plain scalar for a
 * `number`.
 *
 * @param {string}             property - A key of {@link TRANSFORM_FUNCTIONS}.
 * @param {number|string}      value
 * @returns {string}
 */
const formatTransformValue = (property, value) => {
  if (typeof value !== "number") return String(value);
  const { kind } = TRANSFORM_FUNCTIONS[property];
  if (kind === "length") return toREM(value);
  if (kind === "angle") return `${value}deg`;
  return String(value);
};

/**
 * Reads the current animated value of a property from a widget.
 * Transform functions live inside a `transform` string rather than as
 * standalone properties, so a transform with no part stored yet reads neutral
 * (`1` for `scale`, `0` for the rest).
 *
 * @param {HTMLElement|object} widget   - The target widget or DOM element.
 * @param {string}             property - The property to read.
 * @returns {number|string} The current value, or the property's neutral value.
 */
const readAnimatedValue = (widget, property) => {
  if (TRANSFORM_FUNCTIONS[property]) {
    const stored = transformParts.get(widget)?.get(property);
    if (stored !== undefined) return stored;
    return TRANSFORM_FUNCTIONS[property].neutral;
  }
  if (widget?.style && property in widget.style) {
    const inline = widget.style[property];
    // An inline-unset property reads as "" and `interpolate` turns that into the
    // string "NaN", which the browser silently drops — so `animate(el, "opacity",
    // undefined, 1, 300)` (the documented API) wrote "NaN" every frame and never
    // animated anything. What the element actually looks like is the next place to
    // ask, because a widget styled through a class or a stylesheet has an empty
    // inline value and a real one: `fadeOut` of a card the theme set to 0.8 must
    // start at 0.8, not at the neutral guess below.
    if (inline !== "" && inline !== null && inline !== undefined) return inline;
    const computed = readComputedStyle(widget, property);
    if (computed !== undefined) return computed;
    return property === "opacity" ? 1 : 0;
  }
  return widget?.[property];
};

/**
 * The value a real element shows right now, from its computed style.
 *
 * Read once when a loop starts, never per frame. A plain object passed by a caller
 * (a widget-shaped mock) has no computed style, and asking is what a `null` answer
 * means here.
 *
 * @param {HTMLElement|object} widget
 * @param {string} property
 * @returns {string|undefined}
 */
const readComputedStyle = (widget, property) => {
  if (typeof getComputedStyle !== "function") return undefined;
  if (!(widget instanceof Element)) return undefined;
  const value = getComputedStyle(widget)[property];
  return value === "" || value === undefined ? undefined : value;
};

/**
 * Style properties a bare number must NOT get a length unit on.
 *
 * The same exemptions the factory's `toCSSValue` keeps, listed here because the
 * animation engine writes styles directly and cannot ask the prop registry.
 * @type {Set<string>}
 */
const UNITLESS_STYLE_PROPS = new Set([
  "opacity",
  "zIndex",
  "order",
  "flex",
  "flexGrow",
  "flexShrink",
  "fontWeight",
  "lineHeight",
  "aspectRatio",
]);

/**
 * Writes an animated value to a widget property.
 * - Transform functions merge into `transform` (see {@link writeTransformPart}).
 * - A bare number on any other length is a framework unit and becomes rem, the way
 *   a routed prop does — `animate(el, "width", 100, 300)` grows with the reader's
 *   font instead of staying a pixel while the card around it got taller.
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
  if (TRANSFORM_FUNCTIONS[property]) {
    if (!widget.style) return;
    writeTransformPart(widget, property, value);
    return;
  }
  if (widget.style && property in widget.style) {
    widget.style[property] =
      typeof value === "number" && !UNITLESS_STYLE_PROPS.has(property)
        ? toREM(value)
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
 *   receiving eased progress in `[0, 1]`. Used by `pulse` and the named
 *   transitions to keep a multi-phase gesture inside a single cancelable loop.
 * @param {(widget: HTMLElement|object) => void} [onDone] - Called when the loop
 *   ends — also when it is cancelled or replaced, so awaiting code never hangs.
 * @returns {() => boolean} Cancel function; true when it stopped a live loop.
 */
export const runAnimation = (
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
  // Reduced motion goes through the same door: one frame that writes the end
  // value, so the state still lands and an `await` still resolves.
  const safeDuration = motionDuration(duration);
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
 * @param {string|((t: number) => number)} [easing="linear"] - Easing curve name
 *   from `EASING_NAMES`, or a curve (`spring().easing`, `cubicBezier(…)`).
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
 * @param {string|((t: number) => number)} [easing="linear"] - Easing curve name
 *   from `EASING_NAMES`, or a curve (`spring().easing`, `cubicBezier(…)`).
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

/**
 * Animates a property the way a physical object settles: overshoot, then stop.
 *
 * There is no duration to choose — a spring runs until its envelope has decayed
 * inside `epsilon`, and `spring()` works that number out. Which is why this is a
 * separate call instead of another easing name: passing `spring().duration` by
 * hand is the same result, this only saves the arithmetic.
 *
 * @param {HTMLElement|object} widget   - The target widget or DOM element.
 * @param {string}             property - The CSS property (or `"scale"`) to animate.
 * @param {number|string}      from     - Starting value; reads the widget when `undefined`.
 * @param {number|string}      to       - Ending value.
 * @param {object}             [options] - Spring parameters (`stiffness`,
 *   `damping`, `mass`, `initialVelocity`, `epsilon`, `maxDuration`); see {@link spring}.
 * @returns {() => boolean} Cancel function (see {@link animate}).
 */
export const animateSpring = (widget, property, from, to, options = {}) => {
  const { duration, easing } = springCurve(options);
  return animate(widget, property, from, to, duration, easing ?? "linear");
};

/**
 * The awaitable form of {@link animateSpring}.
 *
 * @param {HTMLElement|object} widget   - The target widget or DOM element.
 * @param {string}             property - The CSS property (or `"scale"`) to animate.
 * @param {number|string}      from     - Starting value.
 * @param {number|string}      to       - Ending value.
 * @param {object}             [options] - Spring parameters (see {@link animateSpring}).
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` when the spring
 *   settles — or as soon as it is cancelled or replaced.
 */
export const animateSpringAsync = (widget, property, from, to, options = {}) => {
  const { duration, easing } = springCurve(options);
  return animateAsync(widget, property, from, to, duration, easing ?? "linear");
};

// ========== HELPER FUNCTIONS (Fire and Forget) ==========

/**
 * The scale a pulse is at, given eased progress.
 *
 * Up for the first half of the gesture and back down for the second, inside one
 * loop: a pulse is one cancelable movement, not an animation plus a timer that
 * starts the second half on a widget someone already unmounted.
 *
 * @param {number} progress - Progress through the pulse in `[0, 1]`.
 * @returns {number} The scale to write.
 */
const pulseScale = (progress) =>
  interpolate(1, 1.1, progress < 0.5 ? progress * 2 : 2 - progress * 2);

/**
 * Fades a widget out by animating its `opacity` to `0`.
 *
 * It starts from wherever the widget actually is — the element's own value, then
 * its computed style — so a card the theme set to `0.8` fades from `0.8` instead
 * of first jumping to fully opaque.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Fade duration in milliseconds.
 * @returns {() => boolean} Cancel function (see {@link animate}).
 */
export const fadeOut = (widget, duration = 300) => {
  return animate(widget, "opacity", undefined, 0, duration);
};

/**
 * Fades a widget in by animating its `opacity` to `1`.
 * Fire-and-forget — does not return a Promise.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Fade duration in milliseconds.
 * @returns {() => boolean} Cancel function (see {@link animate}).
 */
export const fadeIn = (widget, duration = 300) => {
  return animate(widget, "opacity", undefined, 1, duration);
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
  runAnimation(widget, "scale", 1, 1, duration, "linear", pulseScale);

// ========== ASYNC HELPER FUNCTIONS (Returns Promise) ==========

/**
 * Fades a widget out by animating its `opacity` to `0`.
 * Returns a Promise that resolves when the fade completes.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Fade duration in milliseconds.
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` on completion.
 */
export const fadeOutAsync = (widget, duration = 300) => {
  return animateAsync(widget, "opacity", undefined, 0, duration);
};

/**
 * Fades a widget in by animating its `opacity` to `1`.
 * Returns a Promise that resolves when the fade completes.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Fade duration in milliseconds.
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` on completion.
 */
export const fadeInAsync = (widget, duration = 300) => {
  return animateAsync(widget, "opacity", undefined, 1, duration);
};

/**
 * The awaitable form of {@link pulse}.
 *
 * The same single loop, not an up-animation chained to a down-animation: the two
 * halves were twice the frames of the gesture they described, stopped on the
 * `setTimeout` that separated them, and resolved with nothing while every other
 * `Async` helper resolves with the widget it just moved.
 *
 * @param {HTMLElement|object} widget        - The target widget.
 * @param {number}             [duration=300] - Total pulse duration in milliseconds
 *   (split evenly between scale-up and scale-down).
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` when the pulse
 *   finishes — or as soon as it is cancelled or replaced.
 */
export const pulseAsync = (widget, duration = 300) =>
  new Promise((resolve) => {
    runAnimation(
      widget,
      "scale",
      1,
      1,
      duration,
      "linear",
      pulseScale,
      resolve,
    );
  });
