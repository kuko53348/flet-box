# Contributing to FletBox

FletBox is a vanilla-JS UI framework: ESM only, zero runtime dependencies, no
build step. This file is the map of the repository for whoever adds code to it.

Two contracts live next to it, and they are not the same document:

| File | It is the contract for |
| --- | --- |
| [AGENTS.md](AGENTS.md) | **maintaining the framework** — the architecture, the rem contract, the widget structure, the gates that guard each of them |
| [AGENTS_FOR_CODE_GEN.md](AGENTS_FOR_CODE_GEN.md) | **producing code with it** — what may be written, what gets rejected, how the work is proved. It ships inside every app `flet-box create` builds |

## The branch, the commits, the release

The work happens on `refactory`. A commit message is one line: a conventional
prefix, a scope, an imperative subject — `feat(theme): …`, `fix(stack): …`,
`docs(widget): …`, `chore(release): …`. The body carries the *why* when the
subject cannot: the measurement that decided a value, the defect a fix closes.

Never publish by hand. `npm run release -- --patch` bumps the version,
rebuilds the bundle, commits and tags; CI publishes the tag. `npm publish` in a
terminal is the one command that must never appear in a handoff.

## The gates

| Command | What it proves | When |
| --- | --- | --- |
| `npm run verify` | one report, one exit code: the anti-hallucination gate, the design gate, the structural gate and the prop contract, run in parallel | after every edit |
| `npm test` | the static checkers: the widget contract, the scale, the shared helpers, accessibility, the error boundary, the API contract, the bundle budget, the docs, the skills, the snippets | before you commit |
| `npm run test:browser` | the behavioural harnesses in `tests/`, driven in a real Chrome | when the change touches runtime behaviour |
| `npm run test:visual` | the gallery measured in light and dark against `scripts/visual-baseline.json` | when the change touches how a widget paints |
| `npm run metrics` | the north metric: the share of generations whose first run was already green | to know whether the rules are landing |

CI runs the first three on every pull request and on every push to `refactory`
and `main`, as three parallel jobs. Nothing is published from a pull request:
the publish workflow reacts to a version tag and to nothing else.

## Prove it twice

Every rule in this repository is proven twice: once by breaking it and once by
obeying it. A check that only proves the happy path proves nothing — a gate
that stopped matching would report a clean repository forever. So a new gate
arrives with a mutation that makes it fail and a case that makes it pass, and
`npm test` is where both live.

The same is true of a baseline. `scripts/visual-baseline.json` and
`scripts/bundle-budget.json` are promises about how the framework paints and
how heavy it is. They move when the framework moves, never to quiet a gate. A
baseline that shrinks is a good day; a baseline that moves because a
measurement was wrong is a defect.

## What gets rejected

The full list is in
[AGENTS_FOR_CODE_GEN.md §6](AGENTS_FOR_CODE_GEN.md#6-what-gets-rejected-and-why),
and it is short: a widget or a prop that does not exist, a positional call, an
import that does not resolve, a hex where a token belongs, a length off the
scale, a tap target under 40, a control with no name, a cycle, markup written
by hand, an API change without a deprecation, a diff wider than the task, and
a claim with no measurement.

## Fix it upstream

When an app cannot do what the contract says, the defect is in the framework.
Fix it here, prove it with a check that fails without the fix, and never patch
`node_modules`.

## Project areas

```text
src/core/           Runtime, mounting, PWA, and HMR
src/widgets/        UI widgets
src/widget-factory/ Widget creation and prop processing
src/navigations/    Scaffold, drawer, tabs, and router
src/services/       Browser storage and HTTP helpers
src/tools/          State and general-purpose tools
src/utils/          Themes, parsing, effects, units, and validation
src/helpers/        Shared helpers — one home per behaviour, and no imports
bin/                CLI and project generators
scripts/            The static checkers and the browser drivers (dev only)
skills/             What the framework knows about designing an app
tests/              The browser harnesses
docs/               User and API documentation
```

## Before changing code

1. Read the owning module and its nearest tests or examples.
2. Check `src/index.js` to understand the public export.
3. Check `src/index.d.ts` when changing public types.
4. Search for existing aliases and related widgets.
5. Keep unrelated refactors out of the change.

## Adding a widget

A widget should normally include:

- A file under `src/widgets/`.
- An export in `src/widgets/index.js`.
- An export in `src/index.js`.
- A prop interface and function declaration in `src/index.d.ts`.
- Basic, everyday, and full examples.
- A documentation page under `docs/widget/`.
- Accessibility notes when it is interactive.
- Cleanup for timers, listeners, observers, and subscriptions.

Use the existing `WidgetFactory` patterns instead of creating a second
rendering system, and follow
[docs/guides/widget-structure.md](docs/guides/widget-structure.md): one factory
root, `widgetName` on it, `composeUpdate()` instead of overwriting
`container.update`, and every resource released through an idempotent
`onUnmount` disposer.

## Adding a prop

When adding a public prop:

1. Implement it in the widget.
2. Add its TypeScript type.
3. Add its default value and behavior documentation.
4. Add an example that proves the behavior.
5. Check whether it should have a friendly alias.
6. Test both the preferred name and aliases when aliases are intentional.

FletBox supports developer-friendly aliases, but each alias must have one
clear meaning. **An alias is a feature, not a duplicate**: never "dedupe" two
names that both work.

## The generated files — never hand-edited

| File | Regenerate it with |
| --- | --- |
| `docs/widget/*.md` | `python3 scripts/generate_widget_docs.py` |
| `tools/snippets-creator-flet-box/*.json` | `python3 tools/snippets-creator-flet-box/build_snippets.py` |
| `.fletbox/api/cheatsheet.md` and `api.json` | `flet-box check-api --emit-api`, `flet-box unpack --all --md` |
| `www/` and `dist/` | `npm run build` |

The shape of a widget page is the generator's, not yours: the page is built
from `src/index.d.ts` and the curated examples in `scripts/_docdata/`.

## Runtime and types must agree

A public API is not complete until these three surfaces agree:

```text
runtime implementation
src/index.js exports
src/index.d.ts declarations
```

If a function is declared but not exported, or exported but not typed, do not
ship it as stable: fix the source of truth. `scripts/check-api-surface.mjs`
enforces it — it imports `src/index.js` for real, so it fails when a runtime
export has no declaration, when a declared value does not exist at runtime,
when an `interface`/`type` is not `export`ed (a consumer could not
`import type` it), or when the barrel re-exports a name that no longer
exists. It also fails when the package stops being importable in Node, so
never touch `window` / `document` at module scope — guard with
`typeof window !== "undefined"`.

## Deprecating a prop

A rename is not a breaking change, and it is not a silent one either. It has
five parts, and they belong in the same change:

1. The new name is declared and documented **first**.
2. The old name keeps working, marked `@deprecated` in `src/index.d.ts`.
3. The old name lands in `src/widget-factory/deprecations.js` — the one table
   the guide, the codemod and the contract test all read.
4. The old name is listed in [the migration guide](docs/guides/migration.md) as
   a "de X a Y" row, under the version that renamed it.
5. The old name is removed in the next **major**, and that major's section says
   so.

`scripts/check-migrations.mjs` proves the four surfaces agree, and
`flet-box release --major` refuses to publish a version the guide does not
cover. The codemod that applies the table is `flet-box audit-fix --only
migrations`: it renames a key only when the widget declares both names and the
call does not already carry the new one, and it removes a key the table marks as
removed. Anything it cannot prove stays untouched, under "Left for you to
decide".

The guide is a chapter of the book, so a rename also touches the book's
indexes and the neighbouring chapter's links.

## Cleanup rules

Components that register resources must release them:

- `window` and `document` listeners.
- Timers and animation frames.
- `ResizeObserver` and `MutationObserver`.
- Router subscriptions.
- Storage subscriptions.
- WebSocket connections.

Use the widget cleanup lifecycle when available.

## Validation checklist

Before you open the pull request:

```bash
npm run verify
npm test
npm run test:browser
node --check path/to/changed-file.js
python3 -m py_compile scripts/generate_widget_docs.py
```

`npm run test:browser` drives the harnesses in `tests/` in a real Chrome:

- `/tests/index.html` — the widget-factory regression contract
- `/tests/smoke.html` — instantiates every widget
- `/tests/motion.html` — the motion contract
- `/tests/a11y.html` — the accessibility contract
- `/tests/regression.html` — a guard for every bug this repository has fixed
- `/tests/errorboundary.html` — a throw never takes the screen with it
- `/tests/doccheck.html` and `/tests/doccheck-all.html` — documented behavior

Each harness writes a global (`window.__TESTS`, `window.__SMOKE`,
`window.__MOTION`, `window.__A11Y`, `window.__REGRESSION`) and must pass with 0
failures. Serve the repo with `npm run dev` to open one by hand.

## Pull request guidance

A good pull request explains:

- What user problem it solves.
- Which files changed.
- Which public API changed.
- Whether types and docs were updated.
- Which commands or tests were run.
- Any remaining compatibility or migration concern.

Avoid committing generated output, secrets, local databases, APKs, logs, or
credentials.
