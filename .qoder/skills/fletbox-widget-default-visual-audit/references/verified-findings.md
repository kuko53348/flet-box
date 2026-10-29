# Findings measured through this gallery

These are the defect *classes* the sweep produced, with the numbers each one was decided on.
They came from the 2026-10-22/23 audit of every widget default and were re-measured on
2026-10-24 with `scripts/audit.mjs` against the current tree. **Treat the open rows as
candidates, not truth: re-run the audit before reporting any of them.**

## Closed — default fixed in the widget after measuring

| Widget | Before (measured) | After | Where |
| --- | --- | --- | --- |
| Dropdown | root painted `colors.surface` behind the label; an `outlined` field looked filled | root `bgColor: "transparent"`, filled variant keeps 80% surface | `src/widgets/Dropdown.js` (`Container({ ..., bgColor: "transparent" })`) |
| Accordion | expanded title in `colors.primary` over a 6% primary wash = **2.41:1** | title always `titleColor` (`colors.text`): **16.07:1** light / **12.21:1** dark | `src/widgets/Accordion.js` |
| Tabs | active label used `colors.background` (invisible in both themes); `underline` had no indicator | active `colors.text`, inactive `textSecondary`; underline is a 2px `colors.color` bar; slider thumb carries `color` with `onPrimary` ink (**6.65:1** light / **6.68:1** dark, was 4.23 with `secondary`) | `src/navigations/Tabs.js` |
| TreeView | every row **56px**: `minHeight: TAP_MINIMUM` added on top of 8+8 padding on a content-box div | `boxSizing: "border-box"` → rows **40px**, panel **370 → 290px** | `src/widgets/TreeView.js` |
| Chart (bar) | domain started at the smallest value, so `getYPosition(0)` fell below the axis and bars ran past the baseline; x labels were gated behind `showValues`; 70/30 band left gaps 43% of bar width | zero-anchored domain for `type: "bar"`, labels under `showLabels`, 80/20 band (**141px** bars / **34px** gaps on a 974px canvas) | `src/widgets/Chart.js` |
| Radio | unselected rim `colors.border` = **1.27:1** light / **1.19:1** dark; the 40-unit hit box stretched the sibling label so the gap doubled | rim `colors.gray500` (**4.83:1** / **3.67:1**), dot `onPrimary`, overhang returned with `margin: -overhang` | `src/widgets/Radio.js` |
| Switch | the engine's press effect scaled the whole labelled row (84 → 82.32px of text) | labelled root sets `disableTransform: true`; feedback stays in the knob | `src/widgets/Switch.js` |
| Button | hover lifted two elevation steps (a hardcoded `0 8px 16px`) | one `SHADOW_LEVELS` step | `src/widget-factory/effects.js` |
| Markdown list marker | the disc painted at 14.5–18.25px while the root clipped at 16 (`overflow: auto`) — half the glyph was gone; the user asked for "1px a la derecha" | `listPadding` `1em → 1.25em`, sized from the clip plane, not from the requested nudge | `src/widgets/Markdown.js` |
| Dark/light palettes | slate/cyan leftovers; several widgets hardcoded `#fff` ink on `colors.primary` | neutral zinc scale (light `#18181b` primary, dark page `#09090b` with `#fafafa` primary); ink on a fill reads `colors.onPrimary` / `onSecondary`, never a literal | `src/utils/themes.js` |

## Open as of 2026-10-24 — from `node scripts/audit.mjs`

Light theme, 8 distinct runs:

| Card | Ratio | Reading |
| --- | --- | --- |
| Rating | **1.27:1** | `star_border` (the empty star). Probably intentional as an "empty" state — ask before touching |
| Rating | **2.15:1** | `star` fill as an icon on white; non-text needs 3:1, this is the real tail |
| Maps | **2.43:1** | the `copyright` link uses `colors.primary` as ink on the dark attribution chip |
| AdSense / AdMob | **2.54:1** | `ADVERTISEMENT` placeholder in an empty slot — decorative, do not count as a defect |
| Markdown | **3.42:1** | inline `code` uses `colors.danger` on `gray100` |
| AlertDialog | **3.61:1** | danger variant: `colors.danger` as the Cancel ink on surface |
| ParallaxBox | 1:1 | **artifact** — the gallery paints that card itself, see `references/probe-traps.md` |

Dark theme, 2 distinct runs:

| Card | Ratio | Reading |
| --- | --- | --- |
| Rating | **1.19:1** | empty star, same question as light |
| AlertDialog | **2.65:1** | `colors.text` (near-white) on the `danger` plate — needs `onPrimary`-style ink for the fill |

Not text, so the scanner cannot see them; each needs `probe.mjs`: CodeViewer syntax and gutter
ink, Charts' gridline weight, Stepper's inactive number (measured 4.07:1 in the dark pass),
Tooltip bubble, Checkbox's rim (it still carries the Radio defect — offered, not applied), and
every UI glyph at 3:1.

## Not defaults, found in the same sweep

- `Scaffold` / `AdaptiveScaffold` in static (non-router) mode ignore `appBar`, `bottomBar` and
  `fab`: the slots stay empty. The gallery notes it on the card so nobody reads it as a color bug.
- `Audio` defaults to `controls: false`, so it renders nothing until the caller asks for chrome.
- `Divider` defaults to `colors.surface`: invisible on a white page.

## The rule the user gave, twice

> "todo lo que te vaya pidiendo es a cada widget por defecto en el framework"
> "pero esta modificación es para el widget dropdown"

Every correction above is in `src/`. The gallery never received a compensating color prop, and no
fix was ever written into `node_modules` or a demo screen.
