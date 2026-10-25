/**
 * @file html.js
 * @description
 * The one HTML escaper in the framework.
 *
 * Four modules build HTML strings — the Markdown widget, the Markdown parser,
 * the syntax highlighter and the Markdown code renderer — and every one of them
 * used to carry its own copy of the same five `replace()` calls. Three copies of
 * a security boundary is three chances for one of them to be edited alone, so
 * the implementation lives here: a leaf module with no imports, which matters
 * because `utils/markdownParser.js` imports six widgets and anything that
 * imported it from a widget would drag all six into that widget's graph.
 *
 * @module helpers/html
 */

/** The five characters that can end text or an attribute value early. */
const ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes the characters that let text break out of an HTML context.
 *
 * A single pass over the source: `&` is replaced once and the entities it
 * produces are not rescanned, so the output is safe to insert into element
 * content and into a quoted attribute value.
 *
 * @param {string} text - Raw text.
 * @returns {string} The same text with `& < > " '` replaced by entities.
 */
export const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ENTITIES[char]);

export default escapeHtml;
