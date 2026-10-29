---
name: fletbox-examples-app-verify
description: Verification pipeline for the flet-box-widgets-exemples demo app. Use after changing any screen, component or example module in ../flet-box-widgets-exemples — runs the two gates (npm run check, npm run ui), serves the app with the SPA fallback, measures the real layout and behavior with puppeteer, captures both themes, crawls every catalog page, and closes by writing the Verified section and the must-not-be-undone bullet in .fletbox/memory/notes/bitacora.md. Do not use for the framework repo itself, for snippet audits, or for prop-coherence checks.
argument-hint: "[route-or-widget]"
---

# FletBox examples app — measured verification

## Overview

Close any change in the widget-examples demo only with numbers from a real browser, then record them in the app's bitácora. The demo is the framework's public face, so a green static gate is not evidence: every claim is measured.

App root: `<flet-box>/../flet-box-widgets-exemples`, resolved from this skill's own location (override with `FLETBOX_EXAMPLES_APP`). It is a sibling of the framework repo and imports `flet-box` through `node_modules/flet-box` → `../../flet-box`.

`$APP` below is that path; `$SKILL` is this skill's own directory (`<flet-box>/.qoder/skills/fletbox-examples-app-verify`), where the probes live. Run them with absolute paths — they import nothing from the app.

## The rule that orders this whole pipeline

**Neither gate reads scope and neither measures layout.** `npm run check` validates that a name is a real export; `npm run ui` parses source statically. A module that calls `Container(...)` without importing it passes both and only throws `ReferenceError` in the browser, surfacing as `[data-example-error]`. A column that is flush left on desktop passes both too. So a green gate never closes work — steps 3 to 5 are the proof.

## 1. Gates

```bash
cd "$APP" && npm run check   # expect: No invented APIs. <N> widgets, <M> engine props
cd "$APP" && npm run ui      # expect: 0 error(s), then the warning/review counts
```

Compare the warning counts against the `Gates` section of the bitácora. Warnings already argued there (`LOW_CONTRAST_UI`, `MULTIPLE_PRIMARY_ACTIONS`, `SMALL_PRESET`, `CROWDED_FORM`) are the lab talking; only a *new* code or a changed count needs attention. Never "fix" a documented warning by deleting the example that causes it.

## 2. Server — SPA mode, and check the port first

```bash
lsof -nP -iTCP:9130 -sTCP:LISTEN | tail -1        # a previous session usually left it running
node ../flet-box/bin/cli.js run-spa --port 9130 --quiet   # only if the port is free
```

**9130, and never a port assumed to be free.** A probe that reuses "whatever is listening" can
measure another app's shell, which has no example stages, and call it a pass. The probes now
refuse the wrong app by checking that the served page names `flet-box-widgets-exemples` (once
per process, in `gotoAndWait`), so a wrong port fails loudly instead of measuring something else.

Always `run-spa`, never `run` or `run.sh`: the router pushes `/widget/Button` and only the SPA fallback rewrites that extension-less URL to `index.html` and injects `<base href="/">`. Without it every deep link is a 404 or resolves its modules against the wrong base.

Reuse a live server instead of starting a second one. Report port and PID at the end and stop anything this session started; do not kill a process you did not launch without saying so.

## 3–5. Measured probes (bundled scripts)

`$SKILL/scripts/` resolves puppeteer and Chrome without hardcoding a path; pass `--port` (default 9130) and `--width`. They print one JSON summary and exit 1 on any failure. They only attach to a server, so they are parallel-safe: several can run at once, and so can the other skills' scripts.

```bash
node $SKILL/scripts/layout.mjs                       # per-viewport centering + horizontal overflow
node $SKILL/scripts/shots.mjs --route /widget/Row    # /tmp/shots/<app>-<port>/<theme>-<route>.png, light and dark
node $SKILL/scripts/crawl.mjs                        # every catalog page, both themes
```

What each one asserts, and why:

- **layout.mjs** finds the content column (the `div` whose inline style carries `max-width`), reports `left` / `right` against the viewport and the parent's flex properties, and compares `scrollWidth` to `clientWidth`. Symmetry (`200/200` at 1600 px) is the pass condition; narrow viewports must stay `0/0`.
- **shots.mjs** sets the theme with `evaluateOnNewDocument(() => localStorage.setItem("fletbox-theme", t))` before navigation — a toggle clicked after load rebuilds the tree and is slower to settle — and creates its output directory (`/tmp/shots/<app>-<port>`) first.
- **crawl.mjs** imports `ALL_WIDGETS` from `src/database/catalog.js`, so the route list is the app's own source of truth, never a hand-written list. Per page it counts `[data-example]` cards, `[data-example-error]` nodes, stages with no painted child, console errors, page errors and responses ≥ 400.

To probe something these do not cover (a click, a computed style on one element), write a one-off in `/tmp` that imports `lib.mjs` — `withBrowser(async (browser) => …)` and `openPage(browser, { theme, width })` return `{ page, problems }`, and `gotoAndWait(page, route)` settles it. `problems` collects page errors, console errors and responses ≥ 400, so a probe that ignores it reports a green run over a broken page. Keep the harness in `/tmp`, never in the app.

## 6. Facts measured in this repo that a new probe must respect

- A pill is not findable by `style.includes("border-radius: 999px")`: the framework rewrites the length to rem (`62.4375rem`). Match a `chevron_left` ligature instead and walk up to the first `cursor: pointer` ancestor.
- `hoverBgColor` and `hoverable` are declared `type: "special"` in `translateProps.js` but only `TreeView.js` and `DataTable.js` read them. On any other widget a hover fill is dead markup that `check-api` still approves.
- `decoration: "underline"` is routed (`translateProps.js`, reactive) — cheaper and more honest than `Text.styles: ["underline"]`.
- Centering a capped column in a flex column takes `margin: "0 auto"`. `alignSelf` is not in the prop registry, so it is not an option.
- A pixel-level match on rem-based styling is impossible; assert within 1–2 px, not exactly.
- Lengths on rem-routed props scale with the root font size, so a viewport-specific measurement is only valid at that viewport — measure wide *and* narrow.

## 7. Behavior, not just pixels

When the change involves interaction, drive it: click the element and read the resulting route, or click by the control's exact label rather than by position (positional indexing counts a map's pins as buttons and invents wrong numbers). Verify the change did not leak: a shared helper (`tag()`, `banner()`) that gained an option must be re-checked on every page that uses it, since the demo's Home reuses the same components.

## 8. Close in the bitácora

`$APP/.fletbox/memory/notes/bitacora.md` is the answer to "where were we?" and the only hand-maintained log.

- Append `## Verified — <what changed> (<YYYY-MM-DD>)` with the measurements: gate counts, per-viewport numbers, page and card totals, error counts, the screenshot paths, and the probe file names.
- If the change fixes an invariant, add one bullet under `Decisions that must not be undone` saying what must stay and **why** — a later session undoes what it cannot justify.
- If a deletion removed a code path, say so (`banner()` no longer takes `actions`; `tag()` is back to `tag(text)`), otherwise the parameter comes back with the next caller.
- If the user overrode a first attempt, record the final state, not the intermediate one.
- Update the `Gates` counts and the `Status` table only if they actually moved.

## 9. Hand over

Summarize: gate output, the measured numbers before and after, screenshot paths, server port and PID. Do not commit unless asked; the bitácora and the source stay dirty for the user to review screen by screen.

## Resources

- `scripts/lib.mjs` — shared bootstrap: app path, catalog import, puppeteer/Chrome resolution, `openPage()`.
- `scripts/layout.mjs` — centering and horizontal overflow across viewports.
- `scripts/shots.mjs` — both-theme screenshots of one or more routes.
- `scripts/crawl.mjs` — full catalog sweep, both themes.
- `$APP/.fletbox/memory/notes/bitacora.md` — the log to read first and write last.
