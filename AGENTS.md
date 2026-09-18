# AGENTS.md

FletBox: zero-runtime-dependency vanilla-JS UI framework with a Flet-like declarative API. ESM only (`"type": "module"`), Node >= 18. Dev happens on branch `refactory`.

## Commands

- `npm run dev` — static dev server on port 8000 (override with `--port`). Despite the `--hot` flag in package.json, `run` never enables HMR (the CLI only parses `--port`/`--quiet`); use `flet-box run-spa` for hot reload.
- `npm run build` — esbuild-bundles `src/app.js` into `dist/`. Requires `src/app.js` (present at framework root as the demo, so the build works here). Real workflow: `flet-box create <name>` then build inside that project.
- `npm test` — placeholder `echo "No tests yet"`. Real tests are browser harnesses in `tests/` (below).
- `python3 scripts/generate_widget_docs.py` — regenerates `docs/widget/*.md` from `src/index.d.ts` + snippet library. Run after changing a widget's public props/types.
- No lint/formatter/typecheck config exists. Validate JS with `node --check <file>` and `python3 -m py_compile scripts/generate_widget_docs.py`.

## Testing

Tests are dependency-free JS in `tests/`, run in the browser via the dev server (`npm run dev`), then open:
- `/tests/index.html` — widget-factory regression contract. Treats the factory as frozen: fixes belong in widgets, not `src/widget-factory/`.
- `/tests/smoke.html` — instantiates every widget to catch `ReferenceError`s.
- `/tests/doccheck.html` and `/tests/doccheck-all.html` — assert documented behavior on the real runtime.
- `/tests/propscan.html` — prop scanner.

Each harness writes a global (`window.__TESTS`, `window.__SMOKE`, `window.__DOCCHECK`) for automation. These pages cannot open via `file://` (ESM + CORS); they must be served.

## Architecture

- Public entry `src/index.js`; types in `src/index.d.ts`. A public API is complete only when three surfaces agree: runtime implementation, `src/index.js` export, and `src/index.d.ts` declaration.
- `src/widget-factory/` is the ONLY rendering engine — `WidgetFactory` turns props into an `HTMLElement` with style, events, children, lifecycle, and reactivity. Never add a second rendering system.
- `src/create-index.sh` is STALE: it writes to a non-existent `src/widget-builder/`. Do not run it.
- Adding a widget: file in `src/widgets/`, export from `src/widgets/index.js` and `src/index.js`, type + props in `src/index.d.ts`, doc page + `basic`/`normal`/`full` examples in `docs/widget/`.
- Prop aliases are a deliberate feature (e.g. `bgColor` ≡ `backgroundColor`, `onPress` ≡ `onClick`), resolved by the factory; each alias must keep exactly one meaning. Widgets also expose reactive property setters (e.g. `widget.text = ...`).
- State is key-based RAM + subscribers (`useState`); router lives in `src/navigations/Router.js`.
- Widgets that register resources must clean them up: window/document listeners, timers/RAF, observers, router/storage subscriptions.

## Repo layout gotchas

- `flet-box-server/` is a separate backend toolkit (Express/SQLite/Redis) with its own package.json and its own `node_modules`/`attack.sh` test artifacts. Unrelated to the framework — don't wire it in.
- `dist/` is tracked in git even though `.gitignore` lists it. Don't commit new build output.
- `demo.py` is an unrelated AI-API experiment with a fake bearer token; not part of the framework.
- `.github/workflows/` only builds an APK via Cordova; no CI runs the tests.
- `run.sh` (root and `dist/`) is a raw `python -m http.server 8000`.