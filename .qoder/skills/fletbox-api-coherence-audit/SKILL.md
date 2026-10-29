---
name: fletbox-api-coherence-audit
description: Playbook for auditing FletBox prop/API coherence across the five surfaces (the translateProps registry, widget implementations, src/index.d.ts, the VSCode snippet library, and docs/) and separating real defects from probe artifacts. Use when the user asks whether the docs or snippets match the props, whether a prop is invented/phantom/dead, after changing a widget's public props, or when check-prop-registry reports UNKNOWN=0 but behavior looks wrong. Runs throwaway headless-Chrome probes and scratch negative controls; it audits and reports, it never hand-edits docs/ or the generated snippet JSONs.
---

# FletBox API coherence audit

## Overview

Verify that every prop the framework advertises is a prop the framework implements,
across five surfaces: `src/widget-factory/translateProps.js` (`PROP_MAP`/`ALL_PROPS`), the
widget source, `src/index.d.ts`, `tools/snippets-creator-flet-box/`, and `docs/`. Report a
ranked list of real defects, each confirmed in a browser, never from a static grep alone.

Run the repo checkers from the repo root; run this skill's scripts from anywhere inside the
checkout — they resolve the repo via `--root` or `FLETBOX_ROOT`. Below, `$SK` is this skill's
`scripts/` directory:

```bash
SK="$(git rev-parse --show-toplevel)/.qoder/skills/fletbox-api-coherence-audit/scripts"
```

**This audit reports; it does not repair.** `docs/widget/*.md` and the four snippet JSON files
are build output (regenerate with `python3 scripts/generate_widget_docs.py` /
`python3 tools/snippets-creator-flet-box/build_snippets.py`) — never hand-edit them. The only
phase that writes anything is Phase 5, via the sanctioned generator on a clean tree. Fixing
`src/` belongs to a separate, approved step, not to this skill.

## Phase 0 — run the existing invariants

```bash
node scripts/check-prop-registry.mjs    # UNKNOWN / DROPPED / UNDOCUMENTED / INTERNAL / DEAD / CONFLICT
node scripts/check-docs-props.mjs       # DOC_NOT_DECLARED / DECLARED_NOT_DOC / DEAD / BOOL_STYLE
node scripts/check-snippets.mjs         # SYNTAX / BROKEN_IMPORT / DEAD_SNIPPET / UNKNOWN_PROP / POSITIONAL_ARG / BROKEN_CALL / UNCOVERED_EXPORT / UNCOVERED_PROP
node scripts/check-api-surface.mjs
```

Read their header comments before interpreting them. **Their fixtures only contain the
props those scripts pass**, so `UNKNOWN=0 DROPPED=0` says nothing about a prop nobody
ever passed — that is precisely where phantoms live. Static checks are the floor, not the answer.

## Phase 1 — docs phantom sweep

The repo gate is `node scripts/check-docs-props.mjs` (in `npm test`). This skill adds
`$SK/doc-table-audit.mjs`, which parses every `| \`prop\` |` row in `docs/widget/*.md` and
flags rows whose prop is in none of `PROP_MAP`, `index.d.ts`, or the widget source (`.prop`,
`prop =`, `["prop"]` — bare `prop:` object keys are writes, not reads). Use it for the sweep
**and** for the negative control: `--docs <scratch-dir>` points it at a copy, which the repo
gate cannot do.

For each flag, decide **before** reporting:

1. Is it in `index.d.ts`? If yes and the registry has no entry and no widget reads it, it is a
   **phantom row**: the type lies, the generated table repeats the lie on every page.
2. Is it a `special` registry entry no widget reads? Then it is registry `DEBT/DEAD`, and its
   doc row is a **dead promise**.
3. Is it typed `boolean` but routed to a CSS value? Confirm with Phase 2 — the historical case:
   `Row({ wrap: true })` produced no `flex-wrap`, `Row({ wrap: "wrap" })` produced
   `flex-wrap: wrap`. A boolean type over a keyword-valued style teaches invalid CSS: the defect
   is in the *type* or the registry entry, not the widget. `check-docs-props.mjs` calls this
   `BOOL_STYLE`.

## Phase 2 — confirm in Chrome before writing the word "bug"

`$SK/prop-probe.mjs '<Widget({ ... })>' [--pair '<expr>']` renders the expression in
headless Chrome and prints attributes, inline style, computed style, child counts and console
warnings. `--pair` diffs two expressions and says whether the render differs.

Rules learned the hard way:
- Never report a prop as broken from reading code alone. Historical pairs that settled it:
  `visible:false` did nothing (no attribute, no style) while `hidden:true` set `hidden` +
  `display:none`; `Input({ passwordToggle: true })` rendered 0 buttons; `onEnter` fired on no
  keydown/keypress/keyup. `visible` and `wrap` have since been registered, so re-measure — the
  point is the method, not those results.
- Always measure a control that must do nothing (`opacity:0`) beside the suspect, so a probe that
  silently renders nothing cannot masquerade as a finding.
- If a `Widget()` call throws, check `index.d.ts` first: when the parameter is required,
  the **snippet/example** is wrong, not `src/`.
- Navigations live in `src/navigations/`, not `src/widgets/` (`AppBar`, `BottomNavigation`,
  `Router`, `Scaffold`). Grepping the wrong directory returns "No such file" and tempts a
  false conclusion.

## Phase 3 — snippets: two passes, then compare

`$SK/snippet-probe.mjs` executes every executable body of `FletBox.json` in Chrome
through `new Function("scope", "with (scope) { ... }")` over a Proxy with `has: () => true`,
neutralizing `setInterval`/`fetch` and clearing `document.body` between bodies. It runs twice:

- **strict**: names the examples leave to the app resolve to `undefined`, as they would in
  unfinished app code.
- **seeded**: those names (`users`, `data`, `rows`, `nodes`, `mdSource`, …) resolve to real data
  and leftover callbacks to no-op functions, so only real API problems survive.

Only the **difference** is meaningful. Failures that vanish when seeded are example style;
failures that survive both passes are the report. The first pass alone over-reports: the run
that established this method gave **22 failing of 444** strict and **5** seeded, and only those
5 were real defects. On today's repaired tree the same probe gives 18 strict / 0 seeded — all 18
are placeholder artifacts (`AdMob.full` warning about the absent native plugin is correct
behavior, not a defect). Never conclude from a single pass, and never quote yesterday's counts as
today's.

## Phase 4 — negative control every detector you rely on

A detector that always returns 0 is indistinguishable from a broken detector. Before trusting
any number, prove the detectors bite on scratch copies (nothing in the repo is touched):

```bash
node "$SK/negative-control.mjs"            # prints PASS/FAIL per control, scratch under /tmp
```

It performs the three controls below (plus the clean-docs baseline) and the traps they teach:

1. Scrub one export's examples from **one** category JSON → `AGGREGATE_DRIFT>0` while
   `UNCOVERED_PROP` stays at baseline. The signal is **masked**, not absent: scrub all four files
   (including the aggregate) or the coverage level you wanted never moves.
2. Scrub the same export from all four → a coverage level must rise. It does not always move for
   the reason you expect: `UNCOVERED_EXPORT` matches the name against **all** bodies, so a name
   still mentioned in prose elsewhere stays "covered". Absence of a finding is not evidence.
3. Append a `| \`totallyInventedProp\` |` row to a copy of a docs page and run
   `doc-table-audit.mjs --docs <copy>` → exactly 1 phantom.

## Phase 5 — docs drift

```bash
git status --porcelain docs/               # must be empty before starting
python3 scripts/generate_widget_docs.py && git diff --stat docs/
git checkout -- docs/widget                # restore, unless the user wants the regenerated docs
```

The generator is deterministic: an empty diff means the docs are reproducible from
`index.d.ts` + `scripts/_docdata/`. A non-empty diff is not a docs bug — it means the committed
docs are stale, or the generator is not byte-stable; check which before reporting. This is the
one phase that writes (the generator overwrites `docs/widget/*.md`); it is reversible with
`git checkout -- docs/widget`, so run it only on a clean tree and restore afterwards unless the
user asks for the regenerated docs to stay.

## Reporting

Rank by impact, and label each row as one of:
**phantom row** (documented, nothing reads it) / **dead promise** (registry `special`, no widget)
/ **type narrower or wider than the API** / **invented prop in an example** / **stale generated docs**.
Quote the file:line of the declaration and the measured browser result for each.
State explicitly which levels were negative-controlled, and give the counts as measured
(e.g. `1927 rows / 0 phantom`, `18 strict vs 0 seeded`), not as absolutes.

## Environment traps

See [references/pitfalls.md](references/pitfalls.md) for the shell/JS traps that cost time in
this repo (no `timeout` on macOS/zsh, zsh globbing of `--include=*.js`, nested backticks in
template literals, `file://` ESM/CORS, `$FLETBOX_PUPPETEER` resolution).

## Resources

- `scripts/lib.mjs` — repo root resolution (`--root`/`FLETBOX_ROOT`), static server with
  `/__probe__`, puppeteer + Chrome resolution and skip-with-notice, `withTimeout`.
- `scripts/prop-probe.mjs` — measure what one prop actually does in Chrome (`--pair` to diff).
- `scripts/doc-table-audit.mjs` — phantom rows in `docs/widget/` (`--docs` for scratch copies).
- `scripts/snippet-probe.mjs` — two-pass execution of the whole snippet library.
- `scripts/negative-control.mjs` — the scratch mutations of Phase 4, PASS/FAIL per control.
- `references/pitfalls.md` — environment traps and detector blind spots.
- `references/verified-findings.md` — the findings measured in the source session, with the
  numbers, as examples of the defect classes (they may already be fixed; re-measure).
