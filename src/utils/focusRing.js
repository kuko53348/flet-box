/**
 * @file focusRing.js
 * @description
 * The one focus indicator the framework paints, injected once per document.
 *
 * A ring cannot be an inline style: `:focus-visible` is a *state*, and a state
 * only exists in a stylesheet. So this module plays the same role for the
 * keyboard that `styleInjector.js` plays for `@keyframes` and `motion.js` plays
 * for reduced motion — one owned `<style>` tag in `<head>`, inserted the first
 * time a widget is created and never again.
 *
 * The color is `var(--color-focusRing)`, which `applyPalette` already writes for
 * every theme token, so the ring moves with the theme without this module
 * knowing anything about themes. The literal after the comma is the boot
 * palette's value: it is what a page shows before the first `setTheme`.
 *
 * Two deliberate choices:
 * - `:where(...)` keeps specificity at zero, so a widget or an app that wants a
 *   different ring overrides it with one class instead of an `!important`.
 * - The widths are pixels, not rem, and belong with `SHADOW_LEVELS` and the
 *   hairline `borderWidth` on the list of honest pixels: a 1px ring is invisible
 *   and a 6px one is a blob, whatever the reader's font size is.
 *
 * @module focusRing
 */

/** `id` of the injected tag, so the guard reaches it after HMR or a `document.write`. */
const STYLE_ID = "fletbox-focus-ring";

/**
 * The rule. `[tabindex]:not([tabindex="-1"])` is what makes an element the
 * engine turned pressable show up here; `-1` is an element that can be focused
 * by script but is not a stop on the Tab path, and must not announce one.
 *
 * The second pair belongs to a composite field (`Input`). Its native `<input>`
 * is the thing that holds focus, but it is not the thing a person sees: the
 * field is a wrapper with a border, an icon and maybe a trailing button, and a
 * ring drawn around the text box alone cuts across that control. So the ring
 * moves to the wrapper — which is what `data-fb-field` marks — and the inner
 * box is silenced by a rule, never by an inline `outline` an app could never
 * override.
 */
const FOCUS_RULE = `:where(a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])):focus-visible {
  outline: 2px solid var(--color-focusRing, #1d4ed8);
  outline-offset: 2px;
}
:where([data-fb-field]):has(> input:focus-visible) {
  outline: 2px solid var(--color-focusRing, #1d4ed8);
  outline-offset: 2px;
}
:where([data-fb-field]) > input:focus-visible {
  outline: none;
}`;

/**
 * Appends the focus rule to `<head>` unless it is already there.
 *
 * No-ops outside a browser, like every other document-touching utility here, so
 * the package stays importable in Node.
 *
 * @returns {void}
 */
export function ensureFocusRing() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = FOCUS_RULE;
  document.head.appendChild(style);
}

export default ensureFocusRing;
