// src/utils/colors.js
// The framework's selectable accents: ten hue families an app can offer a reader
// without designing a palette of its own.
//
// This file is a token file (`checkUi`'s `isTokenFile`), which is why the hexes
// live here and not in the widget that paints them: an app that writes
// `color: "#0f766e"` has hard-coded a brand, and the clean-UI gate says so. A
// preset table is the same information in the one place the theme can move it.
//
// ## A family is a ramp, and the accent is a stop on it
//
// Each family carries five stops per theme, dark-to-light in `light` and
// light-to-dark in `dark`. The accent is never the same index in both themes:
//
//   light theme → the deepest stop (index 0), which carries white words
//   dark  theme → the second stop (index 1), which carries the page's own ink
//
// That is the design skill's pair rule (35) — lift the lightness and drop the
// saturation going dark — applied to a brand instead of a surface. The middle
// stops of a scale are the ones designers reach for in a mockup and the ones
// that fail here: #3b82f6 puts white at 3.15:1 and #eab308 reads on a white page
// at 1.88:1, so a "blue button" copied straight from a palette card is either an
// unreadable label or an invisible link. Index 0 and index 1 are what survives.
//
// ## The veto
//
// Seven numbers decide whether a stop ships, in each theme, and the guard in
// `tests/regression.test.js` re-measures all of them on every run:
//
//   1. the accent's own ink on the accent            ≥ 4.5  (a button label)
//   2. the accent read as words on the page          ≥ 4.5  (a link, a tab)
//   3. the accent read as a glyph on a card          ≥ 3    (an icon, a rim)
//   4. the page's ink on the family's wash           ≥ 4.5  (a selected row)
//   5. the page's secondary ink on that wash         ≥ 4.5  (its caption)
//   6. the accent on its own wash                   ≥ 4.5  (a chip)
//   7. the wash against the page                   1.04–1.5 (a wash, not a plate)
//
// Number 7 is why the band is asymmetric in practice: on a white page a hue reads
// as a tint at 1.10, but on a black page the same family needs up to 1.48 of lift
// before the eye calls it coloured at all. Both ends of that band are real; a wash
// over 1.5 stops being a wash and starts competing with a card.
//
// Number 6 is the one that bites, and it is what a *predefined* set is for.
// Yellow's deep stop #a16207 sits 4.42:1 on its own wash #fef3c7 — a chip
// labelled in yellow fails AA by 0.08 — so that family takes the scale's next step
// down. Six more families were measured out of this table for the other failure a
// set can have: marine, violet, coral and amber each duplicate another family's
// accent in one of the two themes, and a picker with two squares of the same color
// is not a choice. Adding a family means passing all seven, in both themes, and
// landing somewhere a neighbour already does not.

import { color } from "../tools/color.js";
import { readableInk } from "./readableInk.js";

/**
 * The ink that reads on an accent plate.
 *
 * `readableInk` answers pure black or white; a bright plate in the dark theme is
 * labelled with the dark palette's own page ink instead, because that is what the
 * framework already does for its near-white `primary` and a second black in the
 * system would be one more value to keep in sync.
 *
 * @param {string} primary - The accent's hex.
 * @returns {string} `#ffffff` or `#09090b`.
 */
export const onAccent = (primary) =>
  readableInk(primary, "#ffffff") === "#ffffff"
    ? "#ffffff"
    : "#09090b";

/**
 * Which stop of a family is the accent, and which is its wash, per theme.
 * `light` counts from the deep end and `dark` from the bright end, so index 0 is
 * the deepest stop of one and the brightest of the other.
 */
const STOPS = {
  light: { primary: 0, tint: 3 },
  dark: { primary: 1, tint: 4 },
};

// How far a wash is pushed from an accent that arrived without a ramp — a brand
// registered as a pair of hexes by an app that has a color and not a scale. Light
// lifts it almost to the page, dark drops it almost to the page; both measure
// 1.04–1.35 against their own background, which is the band a wash has to live
// in (deep enough to read as a plate, pale enough not to compete with one).
const WASH_LIGHTEN = 90;
const WASH_DARKEN = 82;

/**
 * The families, in the order a picker should show them: the neutral one first,
 * then the cool end of the wheel, then the warm, then the rose-purples that
 * close it. `label` is the control's accessible name.
 *
 * @type {Array<{id: string, label: string, light: string[], dark: string[]}>}
 */
export const ACCENT_FAMILIES = [
  {
    id: "neutral",
    label: "Neutral",
    light: ["#0f172a", "#475569", "#94a3b8", "#e2e8f0", "#f8fafc"],
    dark: ["#f8fafc", "#cbd5e1", "#64748b", "#334155", "#0f172a"],
  },
  {
    id: "blue",
    label: "Blue",
    light: ["#1e3a8a", "#3b82f6", "#93c5fd", "#dbeafe", "#eff6ff"],
    dark: ["#bfdbfe", "#60a5fa", "#3b82f6", "#1d4ed8", "#0b1220"],
  },
  {
    id: "indigo",
    label: "Indigo",
    light: ["#3730a3", "#6366f1", "#a5b4fc", "#e0e7ff", "#eef2ff"],
    dark: ["#a5b4fc", "#818cf8", "#6366f1", "#3730a3", "#1e1b4b"],
  },
  {
    id: "purple",
    label: "Purple",
    light: ["#6d28d9", "#a855f7", "#c084fc", "#ede9fe", "#f5f3ff"],
    dark: ["#ddd6fe", "#a78bfa", "#8b5cf6", "#6d28d9", "#2e1065"],
  },
  {
    id: "pink",
    label: "Pink",
    light: ["#be185d", "#ec4899", "#f9a8d4", "#fce7f3", "#fdf2f8"],
    dark: ["#f9a8d4", "#f472b6", "#ec4899", "#be185d", "#500724"],
  },
  {
    id: "rose",
    label: "Rose",
    light: ["#9f1239", "#f43f5e", "#fda4af", "#ffe4e6", "#fff1f2"],
    dark: ["#fecdd3", "#fb7185", "#f43f5e", "#be123c", "#4c0519"],
  },
  {
    id: "red",
    label: "Red",
    light: ["#991b1b", "#ef4444", "#fca5a5", "#fee2e2", "#fef2f2"],
    dark: ["#fecaca", "#f87171", "#ef4444", "#b91c1c", "#450a0a"],
  },
  {
    id: "orange",
    label: "Orange",
    light: ["#c2410c", "#f97316", "#fdba74", "#ffedd5", "#fff7ed"],
    dark: ["#fed7aa", "#fb923c", "#f97316", "#c2410c", "#431407"],
  },
  {
    id: "yellow",
    label: "Yellow",
    // The one family whose deep stop is not deep enough: #a16207 measures 4.42:1
    // on its own wash, so a chip labelled in it fails AA by 0.08. The accent takes
    // the scale's next step down and the ramp keeps the rest.
    light: ["#713f12", "#eab308", "#fde68a", "#fef3c7", "#fffbe8"],
    dark: ["#fde68a", "#facc15", "#eab308", "#a16207", "#422006"],
  },
  {
    id: "green",
    label: "Green",
    light: ["#166534", "#22c55e", "#86efac", "#dcfce7", "#f0fdf4"],
    dark: ["#bbf7d0", "#4ade80", "#22c55e", "#15803d", "#052e16"],
  },
  {
    id: "teal",
    label: "Teal",
    light: ["#0f766e", "#14b8a6", "#99f6e4", "#ccfbf1", "#f0fdfa"],
    dark: ["#99f6e4", "#2dd4bf", "#14b8a6", "#0f766e", "#042f2e"],
  },
  {
    id: "cyan",
    label: "Cyan",
    light: ["#155e75", "#06b6d4", "#67e8f9", "#cffafe", "#ecfeff"],
    dark: ["#a5f3fc", "#22d3ee", "#06b6d4", "#0e7490", "#083344"],
  },
];

/**
 * The three tokens one accent writes into one theme's palette.
 *
 * @param {string} primary - The accent hex for that theme.
 * @param {"light"|"dark"} theme - Which end of the pair this is.
 * @param {string[]} [ramp] - The family's stops, when the accent came from one.
 * @returns {{ primary: string, onPrimary: string, primaryBg: string }}
 */
export const accentTokens = (primary, theme, ramp) => ({
  primary,
  onPrimary: onAccent(primary),
  primaryBg: ramp
    ? ramp[STOPS[theme].tint]
    : theme === "dark"
      ? color(primary).darken(WASH_DARKEN).hex()
      : color(primary).lighten(WASH_LIGHTEN).hex(),
});

/**
 * The selectable accents, in the order a picker should show them.
 *
 * `light` and `dark` are the full five-stop ramps of one family, laid out so the
 * accent stop and the wash stop are read off the same list the swatch paints;
 * `accentTokens` is what turns one into the three tokens the theme consumes.
 *
 * @type {Array<{id: string, label: string, light: string[], dark: string[]}>}
 */
export const ACCENT_PRESETS = ACCENT_FAMILIES;

/**
 * The accent stop of a family's ramp — the hex a swatch paints and a label reads.
 *
 * @param {string[]} ramp
 * @param {"light"|"dark"} theme
 * @returns {string}
 */
export const accentStop = (ramp, theme) => ramp[STOPS[theme].primary];

