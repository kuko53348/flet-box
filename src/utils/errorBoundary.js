/**
 * @file errorBoundary.js
 * @description
 * The wall that keeps one broken widget from taking the whole screen with it.
 *
 * A FletBox app is a tree of DOM nodes built by factories. A throw inside one
 * of them — a prop that reads something undefined, a callback that assumes a
 * shape the data no longer has — used to travel straight out of the factory,
 * out of the component, out of `renderApp`, and leave the root empty: a white
 * page, a red line in the console, and nothing on the screen to say where it
 * went. The person saw a blank app; the developer saw a stack trace with no
 * hint of which widget was on screen at the time.
 *
 * This module is that missing wall, in the three places a throw can escape:
 *
 *   1. **the factory** catches a throw while it builds or updates a widget, and
 *      the widget paints a placeholder in its own place — the rest of the
 *      screen keeps working;
 *   2. **the app render** catches a throw that happened outside any widget, and
 *      the root paints the placeholder instead of staying empty;
 *   3. **a handler** is wrapped where it is attached, so a throw inside an
 *      `onPress` is reported with the name of the widget that owns it.
 *
 * The placeholder is written with theme tokens and never with hard-coded
 * colors, and it is announced (`role="alert"`): a broken widget is still
 * information the person on the other side needs, and a silent empty box is
 * how a blank screen becomes a mystery.
 *
 * Nothing here swallows an error. The global handler reports it and lets the
 * browser report it too — the boundary adds context, it does not hide.
 *
 * @module errorBoundary
 */

import { colors } from "./themes.js";
import { toREM } from "./units.js";

/**
 * The attribute a failed widget carries, so a harness, an inspector or a test
 * can find the failure without reading the console.
 *
 * @type {string}
 */
export const FAILURE_ATTR = "data-fb-error";

/**
 * The last failure the boundary saw. A harness reads it to assert *what* was
 * reported, not only that something was painted.
 *
 * @type {{error: Error, message: string, widgetName: string|null, phase: string, event: string|null, source: string|null, when: string}|null}
 */
let lastFailure = null;

/**
 * The placeholder's own styles. Every length is a framework unit through
 * `toREM`, so the note grows with the reader's font like the rest of the page,
 * and every color is a theme token, so it follows the theme it is painted in.
 *
 * The ink is the page's own `text` and not the red: on the error tint the red
 * measures 3.49:1 in the light theme, which is a rim and not a word. The rim
 * carries the "this went wrong" and the text stays readable.
 */
const PLACEHOLDER_CSS = `
  display: flex;
  flex-direction: column;
  gap: ${toREM(4)};
  padding: ${toREM(12)};
  border-radius: ${toREM(8)};
  border: 1px solid var(--color-error, ${colors.error});
  background: var(--color-errorBg, ${colors.errorBg});
  color: var(--color-text, ${colors.text});
  font-size: ${toREM(14)};
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

/**
 * Reports a failure with the context that makes it actionable.
 *
 * The console line names the widget, the phase and the message; the original
 * error is passed along so the stack stays clickable. The failure is also
 * remembered, because a screen that shows a placeholder must be able to say
 * *why* without the developer hunting through the console.
 *
 * @param {Error|unknown} error - What was thrown.
 * @param {Object} [context={}] - Where it happened.
 * @param {string} [context.widgetName] - The widget that owns the failure.
 * @param {string} [context.phase] - `render`, `update`, `handler`, `app`…
 * @param {string} [context.event] - The event name, when a handler threw.
 * @param {string} [context.source] - `file:line`, when the browser reported it.
 * @returns {Object} The recorded failure.
 */
export function reportFailure(error, context = {}) {
  const message =
    error && typeof error.message === "string" && error.message
      ? error.message
      : String(error);

  lastFailure = {
    error,
    message,
    widgetName: context.widgetName || null,
    phase: context.phase || "unknown",
    event: context.event || null,
    source: context.source || null,
    when: new Date().toISOString(),
  };

  const whose = lastFailure.widgetName ? lastFailure.widgetName : "the app";
  const where = lastFailure.event
    ? `${whose} failed in its ${lastFailure.event} handler`
    : `${whose} failed during ${lastFailure.phase}`;

  console.error(`[FletBox] ${where}: ${message}`, error);
  return lastFailure;
}

/**
 * The last failure the boundary saw, or `null`.
 *
 * @returns {Object|null} The recorded failure.
 */
export function getLastFailure() {
  return lastFailure;
}

/**
 * Paints the placeholder that stands in for a widget that could not be built.
 *
 * The placeholder goes *inside* the host, so the widget keeps its place in the
 * layout: a broken card is a card that says so, not a hole where a card was.
 * The host's own content is cleared first — a half-built widget is worse than
 * an empty one, because it looks finished.
 *
 * The host is the element that carries the marker, so one failure is one
 * marked element and the placeholder inside it is found by its role.
 *
 * @param {HTMLElement} host - The widget (or the app root) that failed.
 * @param {Object} failure - The recorded failure.
 * @param {Object} [context={}] - Where it happened.
 * @returns {HTMLElement|null} The placeholder, or `null` outside a browser.
 */
export function paintFailure(host, failure, context = {}) {
  if (!host || typeof document === "undefined") return null;

  const phase = context.phase || "render";

  const box = document.createElement("div");
  box.setAttribute("role", "alert");
  box.style.cssText = PLACEHOLDER_CSS;

  const title = document.createElement("strong");
  title.textContent = context.widgetName
    ? `${context.widgetName} could not be rendered`
    : "This screen could not be rendered";

  const detail = document.createElement("span");
  detail.textContent = failure.message;

  box.appendChild(title);
  box.appendChild(detail);

  while (host.firstChild) host.removeChild(host.firstChild);
  host.appendChild(box);
  host.setAttribute(FAILURE_ATTR, phase);
  host._failureBox = box;
  return box;
}

/**
 * Reports a failure and paints the placeholder in its place.
 *
 * @param {HTMLElement} host - The widget (or the app root) that failed.
 * @param {Error|unknown} error - What was thrown.
 * @param {Object} [context={}] - Where it happened.
 * @returns {HTMLElement|null} The placeholder, or `null` outside a browser.
 */
export function renderFailure(host, error, context = {}) {
  if (!host || typeof document === "undefined") return null;
  const failure = reportFailure(error, context);
  return paintFailure(host, failure, context);
}

/**
 * Removes the placeholder a previous failure painted, so a later successful
 * update can put the real content back.
 *
 * @param {HTMLElement} host - The widget that may carry a placeholder.
 * @returns {void}
 */
export function clearFailure(host) {
  if (!host) return;
  if (host._failureBox && host._failureBox.parentNode === host) {
    host._failureBox.remove();
  }
  host._failureBox = null;
  host.removeAttribute(FAILURE_ATTR);
}

/**
 * Wraps an event handler so a throw inside it is caught with the name of the
 * widget that owns it.
 *
 * Without this, an `onPress` that throws reaches `window.onerror` as an
 * anonymous stack: the developer learns that *something* threw and has to
 * guess which control. Here the console names the widget.
 *
 * @param {Function} handler - The handler to protect.
 * @param {Object} [context={}] - Where it happened.
 * @returns {Function} The protected handler.
 */
export function guardHandler(handler, context = {}) {
  if (typeof handler !== "function") return handler;
  return (event) => {
    try {
      return handler(event);
    } catch (error) {
      reportFailure(error, {
        ...context,
        phase: "handler",
        event: (event && event.type) || context.event || null,
      });
      return undefined;
    }
  };
}

/**
 * Installs the global handler: the last wall, for the errors no widget owns.
 *
 * A rejected promise and an error thrown from a timer never reach a widget,
 * so nothing above can catch them. This reports them with whatever context the
 * browser carries (the file and the line) and leaves the browser's own report
 * in place — `preventDefault()` is not called, because an error that nobody
 * can see is worse than a noisy console.
 *
 * Calling it twice installs one handler: the second call returns the same
 * disposer.
 *
 * @param {Object} [options={}] - Optional `onError(error, context)` hook.
 * @returns {Function|null} A disposer, or `null` outside a browser.
 */
export function installErrorBoundary(options = {}) {
  if (typeof window === "undefined" || !window.addEventListener) return null;
  if (installErrorBoundary._release) return installErrorBoundary._release;

  const onError = (event) => {
    // A resource that failed to load (an image, a font) also arrives here, and
    // it is not a thrown error: it has no stack and it is not a bug in the app.
    if (!event.error && !event.filename) return;

    const error = event.error || new Error(event.message || "Unknown error");
    const context = {
      phase: "global",
      source: event.filename ? `${event.filename}:${event.lineno}` : null,
    };
    const failure = reportFailure(error, context);
    if (typeof options.onError === "function") options.onError(error, failure);
  };

  const onRejection = (event) => {
    const reason = event.reason;
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const failure = reportFailure(error, { phase: "rejection" });
    if (typeof options.onError === "function") options.onError(error, failure);
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  installErrorBoundary._release = () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    installErrorBoundary._release = null;
  };
  return installErrorBoundary._release;
}

export default {
  FAILURE_ATTR,
  reportFailure,
  getLastFailure,
  paintFailure,
  renderFailure,
  clearFailure,
  guardHandler,
  installErrorBoundary,
};
