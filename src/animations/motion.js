/**
 * motion.js - The one motion preference the whole app shares.
 *
 * `prefers-reduced-motion` is a real accessibility requirement, not a style
 * note: vestibular disorders make parallax, spin and large-scale movement
 * physically unpleasant. FletBox answers it at the engine level rather than in
 * each widget, because an animation that asks the widget to opt in is an
 * animation that ships without the check.
 *
 * Three modes:
 * - `"auto"` (default) — follow the operating system.
 * - `"reduce"` — no movement, regardless of what the OS says.
 * - `"full"` — always animate, for an app that owns a "motion" setting.
 *
 * `markMotionLoop(element)` is the shared hook for anything that writes a CSS
 * `animation`: a JS check is read at build time and cannot reach a loop already
 * running, so the preference is also answered by one injected media rule.
 *
 * Everything here is lazy: `window` and `matchMedia` are touched inside the
 * functions, never at module scope, so `flet-box` stays importable in Node.
 *
 * @module animations/motion
 */

const MODES = new Set(["auto", "reduce", "full"]);

/**
 * The mode an app or the previous conversation settled on. `auto` means
 * "whatever the system says", which is what a screen shipped without an
 * opinion about motion should do.
 * @type {"auto"|"reduce"|"full"}
 */
let mode = "auto";

/**
 * Listeners notified when the mode changes, so a widget holding a live loop can
 * stop it the moment the user turns motion off instead of waiting to unmount.
 * @type {Set<(reduced: boolean) => void>}
 */
const listeners = new Set();

/** Cached `MediaQueryList` for the system preference, created on first read. */
let systemQuery = null;

/**
 * Reads the system preference, wiring the change listener once.
 *
 * @returns {boolean} True when the OS asks for reduced motion.
 */
const systemPrefersReduce = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  if (!systemQuery) {
    systemQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The user can flip the OS setting while the app is open; notifying keeps
    // `prefersReducedMotion()` honest without a poll.
    if (typeof systemQuery.addEventListener === "function") {
      systemQuery.addEventListener("change", () => notify());
    }
  }
  return systemQuery.matches === true;
};

/**
 * @param {boolean} reduced - The value every listener should now act on.
 * @returns {void}
 */
const notify = (reduced) => {
  const value = reduced === undefined ? prefersReducedMotion() : reduced;
  listeners.forEach((listener) => {
    try {
      listener(value);
    } catch (error) {
      console.warn("⚠️ [motion] A motion-mode listener threw:", error);
    }
  });
};

/**
 * Whether anything animated right now should skip its movement.
 *
 * @returns {boolean} True for `"reduce"`, and for `"auto"` when the system asks.
 */
export const prefersReducedMotion = () =>
  mode === "reduce" || (mode === "auto" && systemPrefersReduce());

/**
 * The active mode.
 *
 * @returns {"auto"|"reduce"|"full"}
 */
export const getMotionMode = () => mode;

/**
 * Sets the app-wide motion mode.
 *
 * `"reduce"` is what a settings switch turns on; `"full"` is what an app with an
 * "animations" toggle turns on for a user who wants motion even though their OS
 * says otherwise. Anything unrecognized leaves the mode untouched and warns.
 *
 * @param {"auto"|"reduce"|"full"} next - The mode to apply.
 * @returns {"auto"|"reduce"|"full"} The mode now in effect.
 */
export const setMotionMode = (next) => {
  if (!MODES.has(next)) {
    console.warn(
      `⚠️ [motion] Unknown motion mode "${next}". Use "auto", "reduce" or "full".`,
    );
    return mode;
  }
  if (next === mode) return mode;
  mode = next;
  notify();
  return mode;
};

/**
 * Subscribes to motion-mode changes (including the system flipping its own
 * setting while the app is open).
 *
 * @param {(reduced: boolean) => void} listener - Called with the new answer.
 * @returns {() => void} Unsubscribe — call it from the widget's `onUnmount`.
 */
export const onMotionModeChange = (listener) => {
  if (typeof listener !== "function") return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * The `id` of the one stylesheet that answers the operating-system preference.
 * @type {string}
 */
const REDUCED_MOTION_RULE_ID = "fletbox-reduced-motion";

/**
 * Marks an element as carrying a CSS animation, and injects — once — the media
 * rule that stops every such animation when the reader asks for reduced motion.
 *
 * A JS check is read when the widget builds, so it cannot reach an element that
 * is already looping. The OS preference can flip mid-session, and this rule is
 * the browser answering live, with no listener to register and none to leak.
 * The JS path stays: it is what covers an app's own `setMotionMode('reduce')`,
 * which CSS cannot see.
 *
 * @param {HTMLElement} element - The element about to be given a CSS animation.
 * @returns {void}
 */
export const markMotionLoop = (element) => {
  if (!element || typeof element.setAttribute !== "function") return;
  element.setAttribute("data-fb-anim", "");
  if (typeof document === "undefined") return;
  if (document.getElementById(REDUCED_MOTION_RULE_ID)) return;
  const style = document.createElement("style");
  style.id = REDUCED_MOTION_RULE_ID;
  style.textContent = `@media (prefers-reduced-motion: reduce) {
  [data-fb-anim] {
    animation-duration: 0.01ms !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
  }
}`;
  document.head.appendChild(style);
};

/**
 * The duration an animation should actually run under the current mode.
 *
 * `0` is not a shortcut for "skip it": the engine's single frame writes the end
 * value and resolves, so a state change still lands where the caller expects it
 * and an `await` never hangs. Only the movement disappears.
 *
 * @param {number} duration - The duration the caller asked for, in ms.
 * @returns {number} `0` when motion is reduced, otherwise `duration` sanitized.
 */
export const motionDuration = (duration) => {
  const safe = Math.max(0, Number(duration) || 0);
  return prefersReducedMotion() ? 0 : safe;
};

/**
 * The delay for item `index` of an entrance, capped so a long list cannot turn
 * into a wait.
 *
 * Staggering is the difference between a screen arriving and a screen loading,
 * and the failure mode is arithmetic: 20 rows at 60ms is a 1.2s entrance. Beyond
 * `max` every item shares the same delay, so the tail appears at once.
 *
 * @param {number} index             - Position in the list, 0-based.
 * @param {object}  [options]
 * @param {number}  [options.start=0]  - Delay the first item gets, in ms.
 * @param {number}  [options.step=60]  - Extra delay per item, in ms.
 * @param {number}  [options.max=8]    - Index past which the delay stops growing.
 * @returns {number} Delay in ms, ready to use as an `animations[].delay` or a
 *   `setTimeout` argument.
 */
export const stagger = (index, { start = 0, step = 60, max = 8 } = {}) => {
  const position = Math.max(0, Number(index) || 0);
  const capped = Math.min(position, Math.max(0, Number(max) || 0));
  const safeStart = Math.max(0, Number(start) || 0);
  const safeStep = Math.max(0, Number(step) || 0);
  return safeStart + capped * safeStep;
};
