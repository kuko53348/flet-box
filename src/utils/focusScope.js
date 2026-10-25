/**
 * @file focusScope.js
 * @description
 * The keyboard half of a modal: while a panel is open, Tab walks around *inside*
 * it, and when it closes focus goes back where it came from.
 *
 * Escape already exists in the three overlays — the mouse can dismiss them. What
 * none of them did was hold the Tab key, so a keyboard user pressing Tab on an
 * open Modal walked out of the dialog, behind the scrim, into the page they could
 * no longer see or reach, and had no way back except tabbing through the whole
 * document. That is the defect this module closes, and it is the reason the three
 * overlays share one implementation instead of each writing its own listener.
 *
 * Deliberately **not** handled here: Escape. Every overlay already listens for it
 * on `document`, and a second listener would fire the close twice — an `onClose`
 * that runs twice is a state update that happens twice.
 *
 * @module focusScope
 */

/**
 * What the browser would let a person land on: HTML's own reachable elements,
 * plus whatever the engine put on the Tab path. `tabindex="-1"` is excluded —
 * that is the document's own words for "focusable by script, not a stop".
 *
 * @type {string}
 */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Traps the Tab key inside `container` until the returned function is called.
 *
 * @param {HTMLElement} container - The open panel to keep the keyboard in.
 * @returns {function(): void} Idempotent release: removes the listener and puts
 *   focus back on whatever was focused before the panel opened. Call it from the
 *   widget's `onUnmount` disposer like every other registered resource.
 */
export function trapFocus(container) {
  if (typeof document === "undefined" || !container) return () => {};

  const previous = document.activeElement;
  let released = false;

  // `offsetParent` is null for a `position: fixed` element, which is what every
  // overlay is, so the usual visibility test would filter out the whole panel.
  // A box that renders has client rects, hidden or not.
  const reachable = () =>
    [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
      (el) => el.getClientRects().length > 0,
    );

  const onKeyDown = (event) => {
    if (event.key !== "Tab") return;
    const stops = reachable();
    if (stops.length === 0) {
      // Nothing to reach: keep the panel itself focused rather than let Tab
      // escape to the page behind it.
      event.preventDefault();
      return;
    }
    const first = stops[0];
    const last = stops[stops.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener("keydown", onKeyDown);

  // A panel with no control in it (an alert with two lines of text) still has to
  // take the keyboard, or the trap has nothing to hold. `-1` is the honest value:
  // it is focusable because the dialog is open, not a stop on the Tab path.
  const stops = reachable();
  if (stops.length > 0) {
    stops[0].focus();
  } else if (!container.hasAttribute("tabindex")) {
    container.tabIndex = -1;
    container._focusScopeMadeTabbable = true;
    container.focus();
  }

  return () => {
    if (released) return;
    released = true;
    container.removeEventListener("keydown", onKeyDown);
    if (container._focusScopeMadeTabbable) {
      container.removeAttribute("tabindex");
      delete container._focusScopeMadeTabbable;
    }
    // Only hand focus back if the element it came from is still there: a route
    // change that replaced the page while the dialog was open has nothing to go
    // back to, and focusing a detached node is a silent no-op at best.
    if (previous && previous.isConnected && typeof previous.focus === "function") {
      previous.focus();
    }
  };
}

export default trapFocus;
