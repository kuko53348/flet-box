/**
 * easings.js - The curves the imperative engine knows.
 *
 * A curve is the difference between an element arriving and an element being
 * teleported. Four names (`linear`, `easeIn`, `easeOut`, `easeInOut`) cover
 * almost nothing, and the gap gets filled by hand-written `requestAnimationFrame`
 * loops in app code — a second animation system, which this repo already has one
 * of. So the standard set lives here.
 *
 * Two rules the shapes obey:
 * - An **entrance** decelerates (`easeOut*`, `spring`): it leaves the start line
 *   fast, which is what reads as responsive.
 * - Anything the user presses repeatedly either has no curve at all (no
 *   animation) or a short `easeOut`; `easeIn*` starts slow and feels broken.
 *
 * Overshoot curves (`*Back`, `Elastic`, `Bounce`, an underdamped spring) return
 * values outside `[0, 1]`. That is the point — the element travels slightly past
 * its resting place — and every consumer handles it: numbers and units
 * extrapolate, colors clamp, `scale` accepts any positive factor.
 *
 * @module animations/easings
 */

/**
 * Overshoot amount for the `Back` family — 1.70158 is the value the CSS easing
 * community settled on (`1.70158 * 1.525` for the in-out variant).
 * @type {number}
 */
const BACK_OVERSHOOT = 1.70158;

/**
 * Solves a cubic Bézier timing function for x, using Newton-Raphson with a
 * bisection fallback, and returns the curve as an easing function.
 *
 * This is the bridge between the two easing vocabularies in the framework:
 * `AnimatedBox({ timing })` and `ParallaxBox({ easing })` hand a string to CSS,
 * while `animate(..., easing)` reads a name. `cubicBezier()` gives the imperative
 * side the exact curve a stylesheet would use, so a screen can share one motion
 * language across declarative and imperative motion.
 *
 * @param {number} x1 - First control point x (must be in `[0, 1]`).
 * @param {number} y1 - First control point y (any value; >1 overshoots).
 * @param {number} x2 - Second control point x (must be in `[0, 1]`).
 * @param {number} y2 - Second control point y.
 * @returns {(t: number) => number} Easing function, `t` in `[0, 1]`.
 */
export const cubicBezier = (x1, y1, x2, y2) => {
  const px = (t) => 3 * t * (1 - t) * (1 - t) * x1 + 3 * t * t * (1 - t) * x2 + t * t * t;
  const py = (t) => 3 * t * (1 - t) * (1 - t) * y1 + 3 * t * t * (1 - t) * y2 + t * t * t;
  // Derivative of px, used to walk the parameter toward the requested x.
  const dx = (t) =>
    3 * (1 - t) * (1 - t) * x1 + 6 * t * (1 - t) * (x2 - x1) + 3 * t * t * (1 - x2);

  return (progress) => {
    if (!(progress > 0)) return 0;
    if (progress >= 1) return 1;
    let parameter = progress;
    for (let i = 0; i < 8; i++) {
      const error = px(parameter) - progress;
      if (Math.abs(error) < 1e-5) return py(parameter);
      const slope = dx(parameter);
      if (Math.abs(slope) < 1e-6) break;
      parameter -= error / slope;
    }
    // Newton wandered off the curve; bisect between the ends, which cannot fail.
    let low = 0;
    let high = 1;
    parameter = progress;
    for (let i = 0; i < 20; i++) {
      const value = px(parameter);
      if (Math.abs(value - progress) < 1e-5) break;
      if (value > progress) high = parameter;
      else low = parameter;
      parameter = (low + high) / 2;
    }
    return py(parameter);
  };
};

/**
 * The named curves `animate()`, `animateAsync()` and the presets accept.
 * Read off the standard Penner set, plus the four Material timing shapes.
 *
 * `easeIn` / `easeOut` / `easeInOut` keep their original quadratic shapes so any
 * animation already in an app moves exactly as it did before.
 *
 * @type {Object<string, (t: number) => number>}
 */
export const EASINGS = {
  linear: (t) => t,

  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,

  easeInQuart: (t) => t ** 4,
  easeOutQuart: (t) => 1 - (1 - t) ** 4,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),

  easeInExpo: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  easeInOutExpo: (t) =>
    t === 0 || t === 1
      ? t
      : t < 0.5
        ? 2 ** (20 * t - 10) / 2
        : (2 - 2 ** (-20 * t + 10)) / 2,

  easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t) => Math.sqrt(1 - (t - 1) ** 2),
  easeInOutCirc: (t) =>
    t < 0.5
      ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2
      : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,

  easeInBack: (t) => (BACK_OVERSHOOT + 1) * t ** 3 - BACK_OVERSHOOT * t * t,
  easeOutBack: (t) =>
    1 + (BACK_OVERSHOOT + 1) * (t - 1) ** 3 + BACK_OVERSHOOT * (t - 1) ** 2,
  easeInOutBack: (t) => {
    const c = BACK_OVERSHOOT * 1.525;
    return t < 0.5
      ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2
      : ((2 * t - 2) ** 2 * ((c + 1) * (2 * t - 2) + c) + 2) / 2;
  },

  easeInElastic: (t) => {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 3;
    return -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 3;
    return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t - 1.5 / d1) ** 2 + 0.75;
    if (t < 2.5 / d1) return n1 * (t - 2.25 / d1) ** 2 + 0.9375;
    return n1 * (t - 2.625 / d1) ** 2 + 0.984375;
  },

  // Material 3 shapes, as the curves rather than the CSS strings, so an
  // imperative call can match a stylesheet on the same screen.
  standard: cubicBezier(0.2, 0, 0, 1),
  emphasized: cubicBezier(0.3, 0, 0.1, 1),
  emphasizedDecelerate: cubicBezier(0.05, 0.7, 0.1, 1),
  emphasizedAccelerate: cubicBezier(0.3, 0, 0.8, 0.15),
};

/**
 * Every accepted easing name, in the order they are documented.
 * @type {string[]}
 */
export const EASING_NAMES = Object.keys(EASINGS);

/**
 * Resolves whatever a caller passed as `easing` into a curve.
 *
 * A function is used as given — that is how a `spring()` or a `cubicBezier()`
 * reaches `animate()`. An unknown name falls back to `linear` with a warning:
 * silently linear is how a hand-typed `'ease-out'` (a CSS name, not a framework
 * one) ends up moving like a machine on a screen that was supposed to glide.
 *
 * @param {string|((t: number) => number)} [easing] - A name or a curve.
 * @returns {(t: number) => number}
 */
export const resolveEasing = (easing) => {
  if (typeof easing === "function") return easing;
  if (easing === undefined || easing === null || easing === "") return EASINGS.linear;
  const curve = EASINGS[easing];
  if (!curve) {
    console.warn(
      `⚠️ [easings] "${easing}" is not a FletBox easing. Known names: ${EASING_NAMES.join(", ")}. Falling back to "linear". Note that CSS names ("ease-out") and cubic-bezier() strings belong to AnimatedBox({ timing }), not here.`,
    );
    return EASINGS.linear;
  }
  return curve;
};

/**
 * A damped harmonic oscillator: the curve a real object follows when it is
 * pulled to a target and released.
 *
 * Springs are why an interface feels physical instead of scripted — the movement
 * has no fixed end time, it settles. That also makes them the one thing a
 * duration-based API cannot express, so `spring()` returns both halves: the curve
 * and the duration it needs to settle within `epsilon`.
 *
 * @param {object}  [options]
 * @param {number}  [options.stiffness=170] - Spring constant `k`. Higher snaps.
 * @param {number}  [options.damping=26]    - Damping `c`. Lower keeps bouncing.
 * @param {number}  [options.mass=1]        - Mass `m`. Heavier lags.
 * @param {number}  [options.initialVelocity=0] - Starting velocity; a flick hands
 *   the spring the pointer's speed so the entrance continues the gesture.
 * @param {number}  [options.epsilon=0.001] - How close to the target counts as settled.
 * @param {number}  [options.maxDuration=2000] - Ceiling, in ms: an underdamped
 *   spring with a lot of energy is still not a 4s modal.
 * @returns {{ easing: (t: number) => number, duration: number, overshoot: boolean }}
 *   `easing` is a function, so it goes straight into `animate(...)`'s last
 *   argument; `duration` is the `animate(...)` duration to pass with it.
 */
export const spring = ({
  stiffness = 170,
  damping = 26,
  mass = 1,
  initialVelocity = 0,
  epsilon = 0.001,
  maxDuration = 2000,
} = {}) => {
  const k = Math.max(0.0001, Number(stiffness) || 0);
  const c = Math.max(0, Number(damping) || 0);
  const m = Math.max(0.0001, Number(mass) || 0);
  const v0 = Number(initialVelocity) || 0;
  const eps = Math.min(0.5, Math.max(0.000001, Number(epsilon) || 0.001));

  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));

  // The unit-step response: 0 at t = 0, 1 once settled, with the overshoot the
  // damping allows in between. Each branch is the closed form for that regime.
  const position = (seconds) => {
    if (seconds <= 0) return 0;
    if (zeta < 1) {
      const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
      const envelope = Math.exp(-zeta * omega0 * seconds);
      return (
        1 -
        envelope *
          (Math.cos(omegaD * seconds) +
            ((zeta * omega0 - v0) / omegaD) * Math.sin(omegaD * seconds))
      );
    }
    if (zeta === 1) {
      const envelope = Math.exp(-omega0 * seconds);
      return 1 - envelope * (1 + (omega0 - v0) * seconds);
    }
    const root = omega0 * Math.sqrt(zeta * zeta - 1);
    const r1 = -zeta * omega0 + root;
    const r2 = -zeta * omega0 - root;
    const c1 = (r2 - v0) / (r2 - r1);
    const c2 = (v0 - r1) / (r2 - r1);
    return 1 - (c1 * Math.exp(r1 * seconds) + c2 * Math.exp(r2 * seconds));
  };

  // Time for the exponential envelope to fall inside epsilon. The overdamped
  // tail is slower than its envelope, so solve that branch numerically instead.
  const settleSeconds = () => {
    if (zeta > 0) {
      const estimate = -Math.log(eps) / (zeta * omega0);
      if (zeta < 1) return estimate;
    }
    let seconds = 0.001;
    while (seconds < 10 && Math.abs(position(seconds) - 1) > eps) seconds += 0.001;
    return seconds;
  };

  const duration = Math.min(
    Math.max(1, Math.round(settleSeconds() * 1000)),
    Math.max(1, Number(maxDuration) || 2000),
  );

  return {
    easing: (progress) => (progress >= 1 ? 1 : position(progress * (duration / 1000))),
    duration,
    overshoot: zeta < 1,
  };
};
