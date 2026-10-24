// src/tools/breakpoints.js
// The framework's responsive vocabulary: one width table, the name it answers,
// and a subscription that only fires when the name changes.

/**
 * The widths a FletBox screen answers to. These are viewport widths in CSS
 * pixels, not framework units: a breakpoint is a fact about the window, and the
 * window does not scale with the reader's font.
 *
 * `md` is 768 because that is the switch `AdaptiveScaffold` has always used —
 * the drawer side of the fence — and a framework with two breakpoint tables
 * gives every app two answers to one question.
 */
export const BREAKPOINTS = Object.freeze({ xs: 0, sm: 560, md: 768, lg: 1024, xl: 1280 });

/** The names in width order, so `pick()` can fall back toward smaller steps. */
export const BREAKPOINT_NAMES = Object.freeze(["xs", "sm", "md", "lg", "xl"]);

/**
 * Which breakpoint a viewport width answers to.
 *
 * @param {number} px - A width in CSS pixels.
 * @returns {"xs" | "sm" | "md" | "lg" | "xl"} The largest step the width reaches.
 */
export const breakpointForWidth = (px) => {
  let name = "xs";
  for (const candidate of BREAKPOINT_NAMES) {
    if (px >= BREAKPOINTS[candidate]) name = candidate;
  }
  return name;
};

/**
 * The current breakpoint, read live from the window.
 *
 * @returns {"xs" | "sm" | "md" | "lg" | "xl"}
 */
export const currentBreakpoint = () =>
  breakpointForWidth(typeof window === "undefined" ? 0 : window.innerWidth);

/**
 * Whether the viewport has reached a breakpoint. `atLeast("md")` is the sentence
 * a two-column layout actually needs, and it is the same 768 the scaffold uses.
 *
 * @param {"xs" | "sm" | "md" | "lg" | "xl"} name
 * @returns {boolean}
 */
export const atLeast = (name) => {
  const from = BREAKPOINT_NAMES.indexOf(currentBreakpoint());
  const wanted = BREAKPOINT_NAMES.indexOf(name);
  // An unknown name is not "true by accident": it asks for nothing, so any
  // screen answers it.
  if (wanted === -1) return true;
  return from >= wanted;
};

/**
 * Choose a value by breakpoint. Keys are breakpoint names, and a step that is
 * not named inherits the nearest smaller one that is:
 * `{ xs: 8, md: 16 }` gives 8, 8, 16, 16, 16.
 *
 * @param {Record<string, any>} values - Values keyed by breakpoint name.
 * @param {any} [fallback=undefined] - What to return when nothing matches.
 * @returns {any}
 */
export const pick = (values, fallback) => {
  if (!values) return fallback;
  const name = currentBreakpoint();
  for (let index = BREAKPOINT_NAMES.indexOf(name); index >= 0; index--) {
    const key = BREAKPOINT_NAMES[index];
    if (key in values) return values[key];
  }
  return fallback;
};

// One resize listener for the whole framework, and one remembered name. The
// callback fires when the *breakpoint* changes, not on every pixel: a screen
// that rebuilt itself per pixel would resize itself into a loop the moment its
// own layout changed the scrollbar.
let lastName = null;
const listeners = new Set();
let removeResize = null;

const handleResize = () => {
  const next = currentBreakpoint();
  if (next === lastName) return;
  lastName = next;
  for (const listener of [...listeners]) listener(next);
};

/**
 * Subscribe to breakpoint crossings.
 *
 * @param {(breakpoint: "xs" | "sm" | "md" | "lg" | "xl") => void} listener
 *   Called with the new name whenever the window crosses a step.
 * @returns {() => void} The unsubscribe. Call it from `onUnmount`.
 */
export const onBreakpointChange = (listener) => {
  if (typeof listener !== "function") return () => {};
  if (lastName === null) lastName = currentBreakpoint();
  listeners.add(listener);
  if (typeof window !== "undefined" && !removeResize) {
    window.addEventListener("resize", handleResize);
    removeResize = () => {
      window.removeEventListener("resize", handleResize);
      removeResize = null;
    };
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) removeResize?.();
  };
};
