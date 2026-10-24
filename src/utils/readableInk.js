import { color } from "../tools/color.js";

const SOLID_COLOR =
  /^(#[0-9a-f]{3,8}|rgba?\(\s*\d|hsla?\(\s*\d|black|white|red|green|blue|yellow|cyan|magenta|gray|darkgray|lightgray)$/i;

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
