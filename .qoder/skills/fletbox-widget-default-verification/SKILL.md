---
name: fletbox-widget-default-verification
description: Playbook for diagnosing and fixing a visual or behavioral defect in a FletBox widget's DEFAULTS (bad alignment in a Row, an invisible unselected ring, a control that scales its whole row when pressed, a hover that lifts a button too far, low contrast text or rims) and carrying that fix through every surface it touches — src/widgets defaults, the regression guard, src/index.d.ts, the generated doc page and the snippet dictionaries. Use when the user sends a screenshot and names one widget — "mejorale el color por defecto", "cuando presionas hace el efecto de presionado todo el contenido", "el boton se eleva demasiado", "la alineacion deberia ser center" — i.e. a framework-default fix in src/widgets/, not an app-level workaround. Measures real numbers with a headless-Chrome probe in both themes before deciding, fixes with scale tokens instead of literals, lands a regression guard that provably failed before the fix, and reports the before/after numbers.
---

# FletBox widget default verification

## Overview

Turn "this widget looks wrong by default" into a measured defect, a scoped fix in
the widget (or, rarely, the shared engine), and a browser regression guard that
re-breaks the real bug. Every number here comes from the live runtime; the report
is never "I think the padding is off".

Fix the framework, not the app: an installed app that looks wrong is usually a
version mismatch or an unpatched default in `src/widgets/<Widget>.js`. Never edit
`node_modules`, and never "fix" it by editing the demo page.

## Scope rule

The user names ONE widget per request. Fix that widget's defaults only. Other
widgets with the same shape are *offered*, not changed — the audit is
user-driven, and touching a second widget in the same pass makes the diff
unreviewable. Same-family reuse (Radio → Checkbox → Switch) is three separate
asks, each with its own guard.

## The loop

1. **Reproduce with numbers.** Mount the widget the way the user mounts it and
   measure it in both themes:
   ```
   node scripts/measure-defaults.mjs --root <flet-box checkout> --widget Switch \
     --props '{"label":"Notifications","value":true}' --row "Option A"
   node scripts/measure-interaction.mjs --root <flet-box checkout> --widget Button --event both
   ```
   Both start and stop their own static server on an ephemeral port, so no
   leftover `npm run dev` process. Read the PNGs they write — the numbers say
   *what* moved, the image says whether it is what the user saw.
2. **Read the widget source** (`src/widgets/<Widget>.js`) and the props it routes
   (`fletbox-api-coherence-audit` covers prop-level coherence; this skill is
   about defaults).
3. **Decide widget vs engine.** See the table below before editing.
4. **Fix with tokens**, never literals (see "Fix rules").
5. **Add a guard to `tests/regression.test.js`** that fails before the fix and
   passes after. Prove it: revert the widget edit in a scratch copy, or check the
   guard's assertion against the old source by hand — a guard that cannot fail is
   decoration.
6. **Propagate what moved** — the interface, the doc page, the snippets. A pure
   default change moves none of them; see "Propagate the change".
7. **Verify:** `node --check` the touched files, then `npm test`, then
   `npm run test:browser`. Both must exit 0. Then re-run the probe and look at
   the new screenshots in both themes.
8. **Report and checkpoint** with the before/after numbers, on explicit paths only
   (see "Reporting and checkpoint").

## Widget vs shared engine

| Symptom | Where the fix belongs |
| --- | --- |
| One widget's default color, rim, size, gap, radius, alignment | `src/widgets/<Widget>.js` (or `src/navigations/<X>.js`) |
| Every clickable widget lifts two shadow steps / loses the lift after `update()` | `src/widget-factory/effects.js` — shared press/hover surface |
| A prop reaches CSS as `1`, or a number paints as px | `src/widget-factory/translateProps.js` registry + `src/utils/units.js` |
| Text invisible in one theme | `src/utils/themes.js` tokens, then the widgets that hardcoded a hex |

`src/widget-factory/` is the only rendering engine: never add a second rendering
system, and treat the factory as frozen (`tests/index.html` guards it). An engine
edit must be justified by a cross-widget measurement, not by one widget's look.

## Fix rules

- **Scale tokens only.** Sizes from `src/tools/scale.js` (`SPACING_SCALE`,
  `RADIUS_SCALE`, `TAP_MINIMUM = 40`), depth from `SHADOW_LEVELS` in
  `src/tools/shadow.js`, colour from `colors` in `src/utils/themes.js`. Hover
  raises *one* elevation step; a literal like `0 8px 16px` is off-scale.
- **Contrast is measured, not felt.** A control rim needs ≥3:1 against the card;
  text needs ≥4.5:1. `colors.border` is a hairline (1.2:1 on a dark card, 1.3:1
  on white) and is wrong for a rim — `colors.gray500` measured 4.83:1 light /
  3.67:1 dark. Fills under white text use the deep accent variants.
- **A hit box must not stretch the layout.** A `TAP_MINIMUM` box around a 20-unit
  ring keeps the finger target and gives the overhang back:
  `const overhang = Math.max(0, (TAP_MINIMUM - size) / 2)` + `margin: -overhang`,
  plus `verticalAlign: "middle"` for inline use. The Row of bare controls then
  measures 20, the ring centres on the label, and the requested `gap` is the real
  gap. A *labelled* control is the other case: the label wrapper owns the 40-unit
  height and the margin stays 0 (`src/widgets/Radio.js:98` —
  `margin: isLabelled ? 0 : -overhang`), so a 40-tall labelled row is the touch
  target doing its job, not a defect.
- **Press must not scale a row control.** A labelled `Switch`/`Checkbox`/`Radio`
  scales its track, not its root — otherwise the label jumps too.
- **Every length is a framework unit.** Route lengths through the rem props; keep
  px only where px is honest (canvas backing stores, `borderWidth` hairlines,
  values measured from the DOM, `SHADOW_LEVELS` depth).
- Text tokens stay white in dark UIs; hierarchy comes from white opacity.

## Regression guard rules

Guards live in `tests/regression.test.js` and run in the off-screen
(`left:-9999px`) host. Four consequences:

- `elementFromPoint`/`elementsFromPoint` are useless there — lift the element
  under test into the viewport for the assertion, then move it back.
- Read settled values: the shadow transition is `0.2s`, so `await wait(320)`
  after `mouseenter`, `mouseleave` and `update()`; `60ms` returns an
  interpolating number such as `0px 4.22556px 8.45113px`.
- Compare geometry, never strings: the scale writes `0 3px 6px`, the browser
  serialises `rgba(0, 0, 0, 0.16) 0px 3px 6px 0px`. Strip the colour and parse
  the three numbers (the same trick `shadowGeometry()` in `effects.js` uses).
- Name the guard after the bug ("Button: hover raises the shadow one elevation
  step, not two") and comment the old numbers, so a future reader knows what it
  bites. Real ones to imitate: `tests/regression.test.js:464` "Radio: the 40-unit
  hit box does not push the ring off the label", `:496` "Radio: the unselected
  ring is visible in both themes", `:594` for the hover step.

## Propagate the change

First decide whether the public surface moved at all. **A default-value fix
usually moves nothing**: the `docs/widget/*.md` prop tables carry type + blurb
only — there is no default column — so `src/index.d.ts` and the tables stay as
they are. What teaches a default is the example code, and that lives in
`scripts/_docdata/group*.py` (the curated `basic` / `normal` / `full` blocks).
Update the group file for the widget you fixed so the documented example shows
the new behaviour, and validate it with `python3 -m py_compile`.

When the fix *does* change the API — a new or renamed prop, a new type, a value
that a caller must pass — propagate in this order or `npm test` fails on you:

1. `src/index.d.ts` — declare it on the widget's props interface, and route it in
   the `ALL_PROPS` registry in `src/widget-factory/translateProps.js`.
   `scripts/check-prop-registry.mjs` compares the registry with what widgets
   actually read; `scripts/check-docs-props.mjs` compares the doc tables with the
   registry, the implementation and `index.d.ts`, and exits 1 on `DEAD`
   (documented, routed by nothing, read by nothing) and `BOOL_STYLE`.
2. The docs page — regenerate, never hand-edit:
   `python3 scripts/generate_widget_docs.py`. It rewrites **every** page it owns
   (the 56 files in `docs/widget/` carrying the banner "The prop table is
   generated from `src/index.d.ts`", plus its `README.md` and `_template.md`) —
   not just yours. So after running it check `git status`, keep only the page you
   meant to change, and stage explicit paths: a second session may be editing
   other pages in this same worktree. The prose pages with no banner —
   `COMMON_PROPS.md`, `START_HERE.md` and the navigations (`AppBar`, `Scaffold`,
   `Tabs`, `Drawer`) — are hand-written and stay that way.
   A new prop's blurb goes in the generator's flat `DESC` map, which is keyed by
   prop name **alone**: if the name already means something on another widget
   (`markers` = map pins vs arc ticks), put it in `WIDGET_DESC[Widget][prop]`
   instead, or you rewrite those pages too. Docs are English.
3. The snippet library — `npm test` runs
   `python3 tools/snippets-creator-flet-box/build_snippets.py --check` and
   `node scripts/check-snippets.mjs`, so a prop with no snippet breaks the gate.
   Edit the dictionaries in `tools/snippets-creator-flet-box/FletBox_snippets_creator/`
   and rebuild; the four JSON files beside them (including the `FletBox.json` the
   editor loads) are build output. Keep prefixes unique across the three
   dictionaries or the aggregate silently keeps the first file's version. For a
   sweep of the library use `fletbox-snippet-library-audit`.

Then cross-check all four surfaces at once with `node bin/cli.js unpack <Widget>`:
it reads `src/index.d.ts`, the `ALL_PROPS` registry, the widget's own source and
its doc page and labels every disagreement (`DEAD`, `INVENTED`, `UNDOCUMENTED`,
`DOC-ONLY`, `CODE-ONLY`). `--example` prints a call built only from verified
props, which is also a good last look at what you just shipped.

## Verification

```
node --check src/widgets/<Widget>.js && node --check tests/regression.test.js
npm test                # static contracts, exit 0
npm run test:browser    # 7 harnesses incl. regression guards, exit 0
```

`scripts/check-docs-props.mjs` is zero-tolerance as of 2026-10-24 — the live run
is `DOC_NOT_DECLARED=0 DECLARED_NOT_DOC=0 DEAD=0 BOOL_STYLE=0` over 64 pages, so
anything it prints came from this change. The two baseline gates
(`check-widgets.mjs`, `check-widget-scale.mjs`) compare against
`scripts/*-baseline.json` and those snapshots must only **shrink**: a new line
there is debt you introduced. (`BROKEN_CALL` is not part of `npm test` — it is
`flet-box check-api` counting placeholders inside an *app*, e.g. the examples
app's 72; do not treat it as this repo's noise.) If `test:browser` reports
`Browser tests SKIPPED`, resolve puppeteer/Chrome with `$FLETBOX_PUPPETEER` /
`$FLETBOX_CHROME` — the probes in `scripts/` need the same two things.

## Reporting and checkpoint

Report in Spanish, with the **same probe** quoted before and after, per theme —
`rowHeight 40 → 20`, `rim 1.27:1 → 4.83:1`, `L2 → L3 hover lift`. Separate what
was measured from what was read from source, and say plainly when the browser
half was skipped: a `SKIP` is not a pass. Leave the defects the user did not name
in a separate "abierto, no tocado" block and wait.

Then, and only then, checkpoint:

- `git status` first. This worktree is often shared with another session editing
  the same widgets, so stage **explicit paths** — `src/widgets/<Widget>.js`,
  `tests/regression.test.js`, the `scripts/_docdata/groupN.py`, its doc page and
  `src/index.d.ts` — never `git add -A`.
- One commit for the fix + its guard + its propagation, message describing the
  defect and the measured number. Do not push unless asked.
- Version bumps go through `npm run release -- --patch [--push]` and need a clean
  tree; that is a separate ask, never a side effect of a default fix.
- Servers: the bundled probes serve on an ephemeral port and self-close, so there
  is nothing to stop. If you started `npm run dev` (:8000 is the user's own) or
  any other page server to look at a widget, report its port and PID and stop it
  when the user asks.

## Resources

- `scripts/measure-defaults.mjs` — mount one widget, dump per-element computed
  geometry/paint plus text contrast in both themes, write a clipped PNG per theme.
- `scripts/measure-interaction.mjs` — rest → synthetic hover → real pointer →
  press, each read after the transition settles; maps live shadows back to
  `SHADOW_LEVELS` (`L2 → L3`) and lists descendant boxes the root's scale drags.
- `scripts/lib.mjs` — server + puppeteer/Chrome resolution (same order as
  `scripts/run-browser-tests.mjs`) and `shadowGeometry()`.
- `references/pitfalls.md` — the measured traps (serialization, transition timing,
  `update()` cancelling hover, `#root` vs `#app`, hairline rims, hit-box
  overhang) with the numbers each one was checked against.

To find a defect before the user names one, use `fletbox-widget-default-visual-audit`
(it sweeps every widget's defaults and ranks); for prop/API coherence use
`fletbox-api-coherence-audit`; for the snippet library use
`fletbox-snippet-library-audit`; for the demo app in `../flet-box-widgets-exemples`
use `fletbox-examples-app-verify`. This skill is about defaults and pixels, one
named widget at a time.
