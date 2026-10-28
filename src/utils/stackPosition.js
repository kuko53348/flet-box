// utils/stackPosition.js
/**
 * @file stackPosition.js
 * @description Anchors a widget over its positioned ancestor — the public, call
 * it-yourself form of what `position: "stack"` does inside the factory.
 *
 * The helper used to write `top`, `right`, `bottom` and `left` into the element's
 * `dataset` "so that a parent Stack can read it later". No parent ever read it:
 * `Stack` layers its children with one stylesheet rule (`stackLayout.js`), and
 * nothing in the framework looks at `data-top`. So the call the docs, the snippet
 * library and the design skill all recommend —
 * `stackPosition(badge, { top: 8, right: 8 })` — returned the widget with its
 * edges recorded and its position untouched, which is worse than an error: the
 * overlay simply stayed where the flow had put it.
 *
 * It now delegates to the engine's own implementation, so there is one set of
 * rules for edges, centring and the rem contract rather than two that drift. The
 * engine gates on `position: "stack"` because it sees every prop of every widget
 * and must not treat an unrelated `top` as a placement; an explicit call to this
 * helper *is* the intent to place, so it passes that gate itself.
 *
 * @module stackPosition
 */
import { stackPosition as placeInStack } from "../widget-factory/stackPosition.js";

/**
 * Absolutely position a widget relative to its nearest positioned ancestor.
 *
 * Numbers follow the framework-wide unit contract: they are pixels on the base
 * font size and are emitted as `rem`, so an overlay moves with the reader's text
 * size instead of freezing at the pixel it was written in.
 *
 * @param {HTMLElement} widget - The widget to anchor. Returned unchanged.
 * @param {Object} [props] - Any of `top`, `right`, `bottom`, `left`, `start`,
 *   `end`, `centerX`, `centerY`, `center`, `fullWidth`, `fullHeight`, `full`.
 *   A value of `false` means "do not apply".
 * @returns {HTMLElement} The same `widget`, now positioned.
 *
 * @example
 * const badge = Icon({ name: "notifications" });
 * stackPosition(badge, { top: 8, right: 8 });   // → position:absolute; top:.5rem; right:.5rem
 */
export const stackPosition = (widget, props = {}) =>
  placeInStack(widget, { ...props, position: "stack" });

export default stackPosition;
