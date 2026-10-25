/**
 * @file stackLayout.js
 * @description Makes a `Stack` paint its children in the same box.
 *
 * `Stack` is documented as the overlay container and `alignment` as the corner
 * every child is anchored to. Neither was true: the children arrived in normal
 * flow, so the second one landed under the first and the only way to actually
 * layer them was for each child to declare a `position` of its own.
 *
 * The rule takes every child but the first out of the flow. The first stays in
 * it because a Stack with no explicit `width`/`height` has to be sized by
 * something: with every child floating the box collapses to 0px and the overlay
 * disappears, which is the same bug wearing a different symptom.
 *
 * A floating child that names no edge is placed at the container's `alignment`
 * point for free — an absolutely positioned child of a flex container takes its
 * static position from that container's own `justify-content`/`align-items`, so
 * the nine-point map in `Stack.js` anchors the layers without a second set of
 * rules. A child that does name an edge (`top`, `right`, …) keeps its own
 * declaration, and one that declares `position` inline outranks this rule, so
 * opting back into the flow is possible.
 *
 * It lives in a stylesheet instead of on each child because `update({ children })`
 * rebuilds them: styles written onto the nodes would leave with the nodes, and a
 * rule reaches whatever arrives next.
 *
 * @module stackLayout
 */

/** `id` of the injected tag, so a guard can count it after HMR. */
const STYLE_ID = "fletbox-stack";

/** One rule, no lengths: nothing here scales with the root font size. */
const STACK_RULE = `[data-fb-stack] > :not(:first-child) {
  position: absolute;
}`;

/**
 * Inject the overlay rule, once per document.
 *
 * No-ops outside a browser, so the package stays importable in Node.
 *
 * @returns {void}
 */
export function ensureStackLayout() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STACK_RULE;
  document.head.appendChild(style);
}

export default ensureStackLayout;
