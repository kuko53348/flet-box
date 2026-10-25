import { color } from "../tools/color.js";

// A fill this code can measure: a hex, an opaque `rgb()`/`hsl()`, or a named color.
// The `$` anchors the whole alternation, so each branch has to match the *entire*
// value — the `rgba?\(\s*\d` this file used to carry could only ever match the
// three-character string "rgb", which made every functional color fall through to
// the caller's default. An alpha'd fill stays unmeasured on purpose: what reads on
// it depends on what is behind it.
const SOLID_COLOR =
  /^(#[0-9a-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|hsl\(\s*[\d.]+(?:deg)?\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|black|white|red|green|blue|yellow|cyan|magenta|gray|darkgray|lightgray)$/i;

/**
 * Black or white, whichever reads better on `background` by WCAG contrast.
 * Falls back when the fill is not a solid color this code can measure (a
 * gradient, a CSS variable) — guessing there is worse than the caller's choice.
 */
export const readableInk = (background, fallback) => {
  if (typeof background !== "string" || !SOLID_COLOR.test(background)) {
    return fallback;
  }
  const bg = color(background);
  return bg.contrastRatio("#ffffff") >= bg.contrastRatio("#000000")
    ? "#ffffff"
    : "#000000";
};
