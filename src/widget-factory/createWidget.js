// core/createWidget.js

import { ensureFocusRing } from "../utils/focusRing.js";
import { ensureFieldFont } from "../utils/fieldFont.js";
import { installErrorBoundary } from "../utils/errorBoundary.js";

/**
 * Creates a bare DOM element for use as a widget.
 *
 * This is the lowest-level factory step. It validates the tag, creates the
 * element, and initialises the `_events` array that all higher-level modules
 * rely on for listener tracking. No props are applied here — that is the
 * responsibility of `assignProps`.
 *
 * It is also where the document gets its focus rule: this is the one step every
 * widget passes through, and a ring has to be in the stylesheet before anyone
 * can press Tab.
 *
 * The field-font floor rides along for the same reason: it is a document-level
 * rule about text fields, and this is the only step that runs exactly once per
 * widget without being owned by any of them.
 *
 * So does the error boundary: the global handler that catches the errors no
 * widget owns (a rejected promise, a timer that exploded) belongs to the
 * document, not to any single widget, and this is the one step every widget
 * passes through.
 *
 * @param {string} tag - HTML tag name for the widget.
 *   Defaults to `'div'` when the value is not a string.
 * @returns {HTMLElement} The newly created DOM element with `_events` initialised.
 */
export const createWidget = (tag) => {
  ensureFocusRing();
  ensureFieldFont();
  installErrorBoundary();

  // Validateste that tag is a string; fall back to 'div' when it is not.
  let finalTag = tag;
  if (typeof finalTag !== "string") {
    console.warn("⚠️ createWidget: tag is not a string, using 'div'", finalTag);
    finalTag = "div";
  }

  const widget = document.createElement(finalTag);
  widget._events = [];

  return widget;
};
