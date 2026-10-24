/**
 * transitions.js - The named entrances and feedback gestures.
 *
 * Between an app that animates and one that looks animated there are three
 * movements: something arriving, something leaving, and something saying "that
 * was wrong". Writing them per screen is how a codebase ends up with eleven
 * slightly different entrances, and each one is a hand-rolled loop that no longer
 * obeys the reduced-motion preference because the engine never saw it.
 *
 * These are the three that carry a product, built on the same `runAnimation()`
 * loop everything else uses, so they inherit its guarantees for free: one
 * registered loop per widget and property, the end value always lands, a cancel
 * function that also resolves an `await`, and duration collapsing to zero when the
 * user asked for reduced motion.
 *
 * Every preset is described once, as the list of loops the gesture is made of, and
 * the two forms — the one that hands back a cancel function and the one you `await`
 * — are that same list run two ways. A preset that grows an option cannot end up
 * meaning one thing to `slideIn` and another to `slideInAsync`.
 *
 * @module animations/transitions
 */

import { runAnimation } from "./animate.js";

/**
 * One loop of a gesture, as the arguments `runAnimation` takes.
 *
 * @typedef {object} GestureStep
 * @property {string} property - The CSS property or transform function.
 * @property {number|string} from - Starting value.
 * @property {number|string} to - Ending value.
 * @property {number} duration - Milliseconds.
 * @property {string|((t: number) => number)} easing - Curve name or curve.
 * @property {((progress: number) => number|string)} [valueAt] - Custom value curve.
 */

/**
 * Stops every loop a preset started on a widget.
 *
 * @param {(...: any) => boolean} cancels - The cancel functions of the loops.
 * @returns {() => boolean} One cancel for the whole gesture.
 */
const combine = (cancels) => () =>
  cancels.map((cancel) => cancel()).some(Boolean);

/**
 * Runs a gesture and hands back one cancel for the whole of it.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {GestureStep[]} steps
 * @returns {() => boolean}
 */
const play = (widget, steps) =>
  combine(
    steps.map(({ property, from, to, duration, easing, valueAt }) =>
      runAnimation(widget, property, from, to, duration, easing, valueAt ?? null),
    ),
  );

/**
 * Runs a gesture and resolves when every loop of it has landed.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {GestureStep[]} steps
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` — or as soon as any
 *   loop is cancelled or replaced, so `await` never hangs.
 */
const playAsync = (widget, steps) =>
  Promise.all(
    steps.map(
      ({ property, from, to, duration, easing, valueAt }) =>
        new Promise((resolve) =>
          runAnimation(
            widget,
            property,
            from,
            to,
            duration,
            easing,
            valueAt ?? null,
            resolve,
          ),
        ),
    ),
  ).then(() => widget);

/**
 * Resolves the axis a `direction` names.
 *
 * The direction is the way the element *travels* as it arrives, which is how
 * people say it out loud ("slide up"), and the axis it moves along is the second
 * step: `up` and `down` are vertical travel, so the offset lives in `translateY`.
 *
 * @param {string} direction
 * @returns {{ property: string, sign: number }}
 */
const axisFor = (direction) => {
  switch (direction) {
    case "down":
      return { property: "translateY", sign: -1 };
    case "left":
      return { property: "translateX", sign: 1 };
    case "right":
      return { property: "translateX", sign: -1 };
    case "up":
    default:
      return { property: "translateY", sign: 1 };
  }
};

/**
 * The travel of a `slide`, as one framework-unit offset on the axis the direction
 * names, plus the fade that carries it.
 *
 * @param {object} options - See {@link slideIn}.
 * @param {"up"|"down"|"left"|"right"} [options.direction="up"]
 * @param {number} [options.distance=16]
 * @param {number} [options.duration=240]
 * @param {string|((t: number) => number)} [options.easing="easeOut"]
 * @param {boolean} [options.fade=true]
 * @param {boolean} [options.leaving=false] - The exit mirrors the entrance.
 * @returns {GestureStep[]}
 */
const slideSteps = ({
  direction = "up",
  distance = 16,
  duration = 240,
  easing = "easeOut",
  fade = true,
  leaving = false,
}) => {
  const { property, sign } = axisFor(direction);
  const offset = Math.abs(Number(distance) || 0) * sign;
  const steps = leaving
    ? [{ property, from: 0, to: -offset, duration, easing }]
    : [{ property, from: offset, to: 0, duration, easing }];
  if (fade) {
    steps.push({
      property: "opacity",
      from: leaving ? 1 : 0,
      to: leaving ? 0 : 1,
      duration,
      easing,
    });
  }
  return steps;
};

/**
 * The decaying side-to-side (or up-and-down) movement of a `shake`.
 *
 * @param {object} options - See {@link shake}.
 * @param {"x"|"y"} [options.axis="x"]
 * @param {number} [options.distance=6]
 * @param {number} [options.cycles=3]
 * @param {number} [options.duration=320]
 * @returns {GestureStep[]}
 */
const shakeSteps = ({
  axis = "x",
  distance = 6,
  cycles = 3,
  duration = 320,
}) => {
  const property = axis === "y" ? "translateY" : "translateX";
  const amplitude = Math.abs(Number(distance) || 0);
  const swings = Math.max(1, Number(cycles) || 3);
  return [
    {
      property,
      from: 0,
      to: 0,
      duration,
      easing: "linear",
      // (1 - t) makes each swing smaller than the last, so the gesture ends at rest
      // instead of stopping mid-swing and leaving the row off its own column.
      valueAt: (progress) =>
        amplitude * Math.sin(progress * Math.PI * 2 * swings) * (1 - progress),
    },
  ];
};

/**
 * Brings a widget onto the screen: a short travel plus a fade, as one gesture.
 *
 * This is the entrance the design rules describe (opacity + a small `translate`,
 * one direction, under 500ms) with the arithmetic already done, so a screen does
 * not need three `animate()` calls and a `Promise.all` to say "this appeared".
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {object}  [options]
 * @param {"up"|"down"|"left"|"right"} [options.direction="up"] - The way the
 *   element travels as it arrives. `up` starts below its resting place.
 * @param {number}  [options.distance=16] - How far it travels, in framework units:
 *   a bare `16` is a `rem` offset through the engine, so it grows with the
 *   reader's font exactly like the widget it belongs to.
 * @param {number}  [options.duration=240] - Milliseconds; stay under 500.
 * @param {string|((t: number) => number)} [options.easing="easeOut"] - Curve name
 *   or curve. An entrance decelerates — `easeIn` reads as a screen that is late.
 * @param {boolean} [options.fade=true] - Also animate `opacity` from 0.
 * @returns {() => boolean} Cancel function for both loops.
 */
export const slideIn = (widget, options = {}) =>
  play(widget, slideSteps(options));

/**
 * The awaitable form of {@link slideIn}.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {object} [options] - See {@link slideIn}.
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` when the element
 *   has arrived, or as soon as either loop is cancelled or replaced.
 */
export const slideInAsync = (widget, options = {}) =>
  playAsync(widget, slideSteps(options));

/**
 * The scale a `popIn` travels through, plus the optional fade.
 *
 * @param {object} options - See {@link popIn}.
 * @returns {GestureStep[]}
 */
const popSteps = ({
  from = 0.94,
  to = 1,
  duration = 180,
  easing = "easeOutBack",
  fade = false,
}) => {
  const steps = [{ property: "scale", from, to, duration, easing }];
  if (fade) steps.push({ property: "opacity", from: 0, to: 1, duration, easing });
  return steps;
};

/**
 * Brings a widget in from slightly smaller than its final size.
 *
 * `scale` from 0 is a dot that pops, and from 1.2 it is a banner that slams.
 * 0.94 → 1 with a `Back` curve is the version that reads as an object being set
 * down, which is the one worth having a name for.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {object}  [options]
 * @param {number}  [options.from=0.94] - Starting scale; keep it above 0.9.
 * @param {number}  [options.to=1]      - Resting scale.
 * @param {number}  [options.duration=180] - Milliseconds.
 * @param {string|((t: number) => number)} [options.easing="easeOutBack"] - Curve;
 *   the small overshoot is the whole effect, and a spring works here too.
 * @param {boolean} [options.fade=false] - Also animate `opacity` from 0.
 * @returns {() => boolean} Cancel function.
 */
export const popIn = (widget, options = {}) =>
  play(widget, popSteps(options));

/**
 * The awaitable form of {@link popIn}.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {object} [options] - See {@link popIn}.
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` when it settles.
 */
export const popInAsync = (widget, options = {}) =>
  playAsync(widget, popSteps(options));

/**
 * Says "that was wrong" without a word: a short, decaying side-to-side move.
 *
 * One loop with a decaying sine rather than a chain of animations, because a
 * multi-phase gesture made of separate calls cannot be cancelled as a gesture —
 * and a shake that outlives the error it belongs to is worse than no shake.
 * `valueAt` receives eased progress, so the curve stays triangular in time.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {object}  [options]
 * @param {"x"|"y"} [options.axis="x"] - Which way it shakes; `y` for a vertical list.
 * @param {number}  [options.distance=6] - Amplitude of the first swing, in framework
 *   units (a bare `6` is `0.375rem`).
 * @param {number}  [options.cycles=3]   - Number of swings; more reads as a glitch.
 * @param {number}  [options.duration=320] - Milliseconds.
 * @returns {() => boolean} Cancel function; cancelling leaves the element at the
 *   offset it held at that moment, so call it from `onUnmount` rather than mid-error.
 */
export const shake = (widget, options = {}) =>
  play(widget, shakeSteps(options));

/**
 * The awaitable form of {@link shake}.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {object} [options] - See {@link shake}.
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` when the shake ends.
 */
export const shakeAsync = (widget, options = {}) =>
  playAsync(widget, shakeSteps(options));

/**
 * Moves a widget out of the screen and leaves it invisible.
 *
 * The exit is the mirror of {@link slideIn} and one notch shorter: motion leaving
 * is a courtesy, motion arriving is information. It does not remove anything from
 * the DOM — the caller hides or unmounts the widget when this resolves, which is
 * the only reason to `await` an exit.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {object}  [options]
 * @param {"up"|"down"|"left"|"right"} [options.direction="down"] - The way it leaves.
 * @param {number}  [options.distance=12] - How far it travels, in framework units.
 * @param {number}  [options.duration=180] - Milliseconds.
 * @param {string|((t: number) => number)} [options.easing="easeIn"] - Curve; an
 *   element leaving the screen at speed is the one place `easeIn` is right.
 * @param {boolean} [options.fade=true]  - Also animate `opacity` to 0.
 * @returns {() => boolean} Cancel function.
 */
export const slideOut = (widget, options = {}) =>
  play(widget, slideSteps({ direction: "down", ...options, leaving: true }));

/**
 * The awaitable form of {@link slideOut} — the usual one, since what follows an
 * exit is the unmount.
 *
 * @param {HTMLElement|object} widget - The target widget or DOM element.
 * @param {object} [options] - See {@link slideOut}.
 * @returns {Promise<HTMLElement|object>} Resolves with `widget` when it has left.
 */
export const slideOutAsync = (widget, options = {}) =>
  playAsync(widget, slideSteps({ direction: "down", ...options, leaving: true }));
