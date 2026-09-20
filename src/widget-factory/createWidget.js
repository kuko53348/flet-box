// core/createWidget.js

/**
 * Creates a bare DOM element for use as a widget.
 *
 * This is the lowest-level factory step. It validates the tag, creates the
 * element, and initialises the `_events` array that all higher-level modules
 * rely on for listener tracking. No props are applied here — that is the
 * responsibility of `assignProps`.
 *
 * @param {string} tag - HTML tag name for the element (e.g. `'div'`, `'button'`).
 *   Defaults to `'div'` when the value is not a string.
 * @param {Object} props - Reserved for future use; currently unused.
 * @returns {HTMLElement} The newly created DOM element with `_events` initialised.
 */
export const createWidget = (tag, props) => {
  // Validate that tag is a string; fall back to 'div' when it is not.
  let finalTag = tag;
  if (typeof finalTag !== "string") {
    console.warn("⚠️ createWidget: tag is not a string, using 'div'", finalTag);
    finalTag = "div";
  }

  const widget = document.createElement(finalTag);
  widget._events = [];

  return widget;
};
