# Findings measured in the source audit (session `81ad1bf1-fd8f-4a46-ad88-315aa0d77998`, 2026-10-18)

Reference cases for the **defect classes**, with the numbers as measured. Several were then
fixed in the working tree (`src/widget-factory/{translateProps,processProps,assignProps}.js`,
`src/widgets/Input.js`) in the follow-up turn, so **re-measure every one before repeating it as
a current finding**. The repo now also ships `scripts/check-docs-props.mjs` (in `npm test`),
which gates classes 1, 3 and 4 statically — on the current tree it reports
`DOC_NOT_DECLARED=0 DECLARED_NOT_DOC=0 DEAD=0 BOOL_STYLE=0`. Useful as calibration: they show
what each class looks like in the output.

## Baseline that was healthy (measured, do not report as bugs)

- `python3 scripts/generate_widget_docs.py` → empty `git diff docs/`: the 65 widget pages are
  reproducible byte-for-byte from `src/index.d.ts` + `scripts/_docdata/`.
- 1926 prop-table rows across 64 pages; filler descriptions: 0.
- `check-prop-registry`: `UNKNOWN=0 DROPPED=0 UNDOCUMENTED=0`.
- A sweep of 110 doc pages found 51 identifiers unknown to the framework — **all** explainable:
  backend props of the separate `flet-box-server` package (`port`, `rateLimit`, `windowMs`,
  `middleware`, `secret`, `minLength`), file extensions (`jpg`, `mjs`, `apk`, `aab`, `mp3`), and
  prose placeholders (`myapp`, `allTasks`, `ReportsScreen`). `minNativeVersion` is real
  (`bin/ota/loader.js:245`). Triage each hit before calling it a phantom.

## Class 1 — phantom row (declared in types, read by nothing)

`CommonProps.visible?: boolean` (`src/index.d.ts:48`) with no registry entry and no widget read.
It was the only phantom among 1926 rows, yet appeared as 39 per-widget rows plus the common table
on ~50 pages. Measured in Chrome: `Text({ text:"x", visible:false })` produced no attribute and
no style; the control `opacity:0` applied correctly. The sibling `hidden` **does** work
(registry `{ type: "attribute" }`, sets the `hidden` attribute and `display:none`), so the docs
page carried one live and one dead prop for the same job.
Now fixed: the registry carries `visible` as a `special`.

## Class 2 — type narrower than the routed value

`wrap?: boolean` on `ContainerProps` (`index.d.ts:206`) and `RowProps` (`:223`), routed to
`style.flexWrap` with `unit: none`. Measured: `Row({ wrap: true })` → `flex-wrap` absent
(computed `nowrap`); `Row({ wrap: "wrap" })` → `flex-wrap: wrap`. The generated table therefore
instructed readers to write a value that produces nothing. Now fixed via `boolValues` on the
registry entry.
Also `CircularChart.rounded?: boolean` (`:1616`) routed to `borderRadius` (rem): the widget does
consume `rounded` (`src/widgets/CircularChart.js:14`) so it works, but it collides in name with
the registry's CSS `rounded` — the same class of problem, quieter.

## Class 3 — dead promise (registry/docs entry nothing implements)

`Input.passwordToggle` and `Input.onEnter`, both documented in `docs/widget/Input.md`.
Measured: `Input({ passwordToggle: true })` rendered `buttons=0, inputs=1`; no Enter handler
fired across `keydown`/`keypress`/`keyup` with `key: "Enter"`. They were 2 of the registry's 10
`DEAD` entries — here the docs really did lie, which is why class 3 must be cross-checked against
the registry's DEAD list.

## Class 4 — type narrower than the implementation

`shadow?: boolean` on `AppBarProps` (`:928`) and `BottomNavigationProps` (`:997`) while
`CommonProps` declares it `string`. Measured on the real widgets: default and `true` →
`rgba(0,0,0,.16) 0 3px 6px`, `"0 0 4px #000"` → applied, `false` → `none`. Behavior is fine;
the honest type is `boolean | string`, as the JSDoc at `src/navigations/AppBar.js:38` already said.

## Class 5 — one prop name, two meanings

`placeholder` is `boolean` on `AdMob`/`AdSense` (`:468`, `:496`, the dashed box — measured working:
`border-width` `1px` → `0px`) and a string HTML attribute on `Input`/`Button` in the registry.
Against AGENTS.md's "each alias must keep exactly one meaning", but harmless in practice because
those widgets destructure it before the engine sees it. Report as a documented exception, not a bug.

## Class 6 — registry entries with no doc and no example

`badgeColor`, `downloadable`, `downloadFileName`, `online`, `onLongPress`, `searchable`,
`searchPlaceholder`, `tooltipDelay` appear in no doc page (correct) but stay in `ALL_PROPS`, so the
registry silently accepts them instead of warning. Probe note: `Tooltip({ tooltipDelay: 5000 })`
left only `["class","style"]` on the root; `Image({ downloadable })` only `["src","style"]`.
This is registry debt (`DEAD`), and it is also why invented props never warn.

## Snippets, class by class

- Two-pass probe: **22 of 444** executable bodies failed the strict pass; seeding the
  example-local placeholders (`users`, `data`, `rows`, `nodes`, `mdSource`, `code`, …) cut it to
  **5**, and only those 5 were reportable (`clipboard.copyWithFeedback` given a props object
  instead of the `HTMLElement` its signature demands, `SnackBar.full` calling a bare `analytics.log`,
  `Inspector.full` passing a raw container, `InstallButton()` missing its required props, `AdMob.full`
  warning about the absent native plugin, which is correct behavior).
- `check-prop-registry` with `--json` plus the free-call detector reported 73 `BROKEN_CALL`, all
  example-local callbacks (`loadMore`, `refreshData`, `Header`) — a style fact about hand-written
  examples, not an API defect. Do not paste that list into a report as failures.
- Coverage floors added to `scripts/check-snippets.mjs`: `UNCOVERED_EXPORT` (every package export
  has an example) and `UNCOVERED_PROP` (every *live* registry prop appears in an example). Final
  state: 1170 snippets, all levels 0 except the 72 stylistic `BROKEN_CALL`.
- Positional-arg bug class: `Text("Hola")` builds an **empty** widget instead of throwing, because
  the widget destructures `props`. Guarding it needs the `.d.ts` signature, since
  `WidgetFactory("div", ...)` is legitimately positional.
