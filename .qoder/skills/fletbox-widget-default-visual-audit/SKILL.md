---
name: fletbox-widget-default-visual-audit
description: Playbook for auditing every FletBox widget's DEFAULT visual state in one pass — mount a throwaway all-widget gallery outside the repo with no color props, serve the working tree through a ./src symlink, measure contrast and geometry in headless Chrome in both themes, rank real defects against probe artifacts, and fix the ones the user names in src/widgets defaults. Use when the user asks for a screen with all widgets and their default colors ("hasme una pantalla con todos los widgets", "revisar los otros widgets con defaults", "el demo de todos los widgets para ver si los colores se aplicaron bien en los dos modos"), after rebuilding the palettes in src/utils/themes.js, or to re-measure the sweep after a default fix. For a single named widget's pixel/behavior fix use fletbox-widget-default-verification; for prop/API coherence use fletbox-api-coherence-audit.
---

# FletBox widget default visual audit

## Overview

See every widget at once, with nothing but its defaults, and measure what actually paints in
light and dark. The gallery is a throwaway probe **outside the repo**, symlinked to the working
tree, so an edit to a widget default is on screen on the next run without publishing anything.

Division of labour: this skill **finds and ranks**; `fletbox-widget-default-verification`
**fixes one named widget** and lands its regression guard; `fletbox-api-coherence-audit` checks
props, not pixels. Do not sweep-fix widgets the user has not named — the audit is user-driven,
one widget per ask, and an unrequested change makes the diff unreviewable.

`$SK` below is this skill's `scripts/` directory:

```bash
SK="$(git rev-parse --show-toplevel)/.qoder/skills/fletbox-widget-default-visual-audit/scripts"
```

## Phase 0 — preconditions

```bash
node "$SK/build-gallery.mjs"                       # --root / --out overrides
```

It resolves the checkout from `--root`, `FLETBOX_ROOT`, the gallery's own `./src` symlink or the
cwd, and requires `package.json` name `flet-box` — a wrong root silently audits a stale copy.
It refuses an `--out` inside the repo, copies the two gallery files, and replaces any leftover
`src` symlink (one pointing at an old checkout renders code you are not editing).

The browser half needs puppeteer and Chrome, which this repo does not carry: they are found in
`../flet-box-server/node_modules/puppeteer` or via `FLETBOX_PUPPETEER` / `FLETBOX_CHROME`. When
either is missing the scripts print `SKIP: …` and exit 0 — that is not a pass, and it is not a
code defect.

**Never start a server on :8000**: that is the user's own `npm run dev`. Every script here serves
the gallery on a free ephemeral port and closes it in `finally`, so there is nothing left to stop.

## Phase 1 — render with defaults

```bash
node "$SK/shots.mjs" --gallery /tmp/fletbox-defaults-gallery     # both themes, per-group crops
node "$SK/build-gallery.mjs" --serve                             # or just look at it by hand
```

Read the JSON before the images: `cards`, `rendered`, `failures`, `missing`, `consoleErrors`.
A non-empty `failures` is a widget that throws on mount — that is the finding, and it outranks a
contrast row. `missing` means a name in the gallery's `EXPECTED` manifest no longer builds, i.e.
the sweep is stale, not the framework.

Two invariants of `assets/gallery/gallery.js`, keep them when editing it:

- **No card passes a color, `bgColor` or `border`.** One exception is documented in the file
  (ParallaxBox has no paint of its own). A card that styles itself measures the gallery.
- **The widget must be built the way a real app builds it.** `DataTable` takes object rows,
  `TreeView` needs `defaultExpanded`, `Audio` needs `controls: true` or it renders nothing, and
  the icons need `./src/fonts/icons.css` — otherwise ligatures paint as the words `star_border`
  and the reading is meaningless.

## Phase 2 — measure

```bash
node "$SK/audit.mjs" --gallery <dir>          # contrast of every visible ink, both themes
node "$SK/probe.mjs" --gallery <dir> --card Switch --theme both \
     --fn '(el,h)=>({row:h.rect(el.firstElementChild), ink:h.ink(el.querySelector("span"))})'
```

`audit.mjs` composites each ancestor's alpha before taking the WCAG ratio and applies 4.5:1 for
text, 3:1 for large (>=24px, or >=18.66px bold). It walks **text nodes only**: rims, star outlines,
focus rings and chart gridlines are non-text and need `probe.mjs` with `h.ink()` against the card
surface. `probe.mjs` is where geometry lives — `h.rect()` for a row's real height, `h.stackAt()`
for "is it actually covered", `h.press()` (which waits out the 0.2s transition) for hover and
press state.

Always look at the per-group PNGs too. Numbers say what moved; the image says whether it is what
the user saw. Check the PNG's real dimensions before judging a layout from the chat preview, which
is downscaled.

## Phase 3 — classify before reporting

Every row is one of three things, and the difference is the report:

- **real default defect** — the widget's own token choice, reproduced with a ratio or a box.
- **probe artifact** — the measurement is wrong, not the widget (the list is long and each entry
  cost time once: see [references/probe-traps.md](references/probe-traps.md)).
- **gallery/app-layer choice** — the card styled itself, or the slot is decorative (AdSense
  placeholder, an intentionally faint disabled control).

Non-defects that recur: a gradient or `background`-shorthand card reading `1:1`;
`elementFromPoint` returning null because the harness stacks widgets off-screen; a
`:last-of-type` selector silently grabbing the wrong div; a Canvas painted before the font or the
rAF lands; a stale screenshot taken from a cached module graph.

## Phase 4 — fix the named widget

Only after the user names one (or approves the ranked list). The mechanics — widget vs engine,
scale tokens vs literals, the hit-box overhang, the regression guard that must fail before the
fix — belong to `fletbox-widget-default-verification`. What this sweep adds is:

- Fix in `src/widgets/<Widget>.js`, `src/navigations/<X>.js`, `src/animations/<X>.js` or
  `src/utils/themes.js`. The gallery is never the deliverable and `node_modules` is never patched.
- A palette change is usually the cheaper fix: widgets read `colors.*`, so one token moves many
  widgets. Before changing `primary`, grep for hardcoded `#fff`/`#ffffff` ink sitting on it
  (Button, Chip, Checkbox, Radio, Stepper, Pagination, FAB, Tooltip, Badge): that list is exactly
  why a near-white `primary` needs `onPrimary` everywhere rather than a literal.
- Size the fix from the measurement, not from the request: "un pixel a la derecha" was a disc
  clipped by a `overflow: auto` root at 16px, and the honest number was 3.5px.

## Phase 5 — re-measure, then gate

```bash
node "$SK/shots.mjs" --gallery <dir> && node "$SK/audit.mjs" --gallery <dir>   # both themes again
cd <repo> && node --check src/widgets/<Widget>.js && npm test && npm run test:browser
```

Compare the new rows against the old ratios and quote both. Re-run the whole sweep, not just the
fixed card: a section is often three stacked defaults, and the second one only becomes visible
once the first is gone. `npm test` (check-widgets, check-widget-scale, check-prop-registry,
check-docs-props, check-api-surface) and `test:browser` must exit 0.

If the fixed default is a documented value, regenerate its page from the sanctioned generator —
never hand-edit `docs/widget/*.md` — and expect the generator to rewrite all pages, so keep only
the one you meant to change.

## Reporting

Spanish, ranked by impact, one table. For each row: the widget, the theme, the measured ratio or
box, the token or line responsible (`file:line`), and the label from Phase 3. Keep the defects the
user has not been asked about in a separate "abierto, no tocado" block and wait for instruction.
State what was measured versus read from source, and say plainly when the browser half was skipped.

## Resources

- `scripts/build-gallery.mjs` — mount the sweep outside the repo, symlinked to the working tree.
- `scripts/shots.mjs` — both themes, full page plus one crop per section, manifest JSON.
- `scripts/audit.mjs` — alpha-composited WCAG scan of every visible ink, both themes.
- `scripts/probe.mjs` — one card, arbitrary measurement: rect, ink, hit-stack, settled press.
- `assets/gallery/{index.html,gallery.js}` — the gallery itself (62 cards / 64 widgets as of
  2026-10-24, `window.__GALLERY` manifest, `EXPECTED` completeness check).
- `references/probe-traps.md` — false readings, each with what it was mistaken for.
- `references/verified-findings.md` — the defect classes with their numbers; re-measure before use.
