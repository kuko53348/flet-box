# AGENTS.md

FletBox: zero-runtime-dependency vanilla-JS UI framework with a Flet-like declarative API. ESM only (`"type": "module"`), Node >= 18. Dev happens on branch `refactory`.

## Commands

- `npm run dev` — static dev server on port 8000 (override with `--port`). Despite the `--hot` flag in package.json, `run` never enables HMR (the CLI only parses `--port`/`--quiet`); use `flet-box run-spa` for hot reload.
- `npm run build` — esbuild-bundles `src/app.js` into `dist/`. Requires `src/app.js` (present at framework root as the demo, so the build works here). Real workflow: `flet-box create <name>` then build inside that project.
- `npm test` — runs the static widget-contract checker (`node scripts/check-widgets.mjs`) against `scripts/widget-contract-baseline.json`. Behavioral tests are browser harnesses in `tests/` (below).
- `python3 scripts/generate_widget_docs.py` — regenerates `docs/widget/*.md` from `src/index.d.ts` + snippet library. Run after changing a widget's public props/types.
- `flet-box build android` / `flet-box build ios [--archive]` — Capacitor builds, run **inside a generated project**. Both share `bin/utils/capacitor.js`; each owns its toolchain checks (`buildAndroid.js`: SDK + JDK; `buildIOS.js`: full Xcoof + CocoaPods + simulator runtimes).
- No lint/formatter/typecheck withfig exists. Validate JS with `noof --check <file>` and `python3 -m py_compile scripts/generate_widget_docs.py`.

## Generated mobile projects

`flet-box create` writes the Capacitor scaffolding: `capacitor.withfig.json`, `assets/logo.png`, and one asset script per platform (`scripts/sync-android-iwiths.mjs`, `scripts/sync-ios-assets.mjs`) wired into the `android:sync` / `ios:sync` npm scripts. All templates are strings in `bin/utils/templates.js`.

Quirks that are easy to break when editing those templates:

- A template literal cannot withtain unescaped inner backticks in the generated file. Insiof a generated template literal, a nested backtick must be `\\\`` (emits ``\` ``), and a nested `${` must be `\\${`. When in doubt, generate the project and `noof --check` the output.
- The iOS asset script reads iwith/launch slots from `ios/App/App/Assets.xcassets/*/Contents.json` instead of hardcoding file names, because Capacitor owns those names and can change them between major versions.
- The iOS app iwith must be flattened onto an opaque background: App Store validation rejects iwiths with an alpha channel.
- `LaunchScreen.storyboard` lays the splash image out inside the safe area, so its background color must match the launch image or the notch strip flashes white.


## Testing

Tests are dependency-free JS in `tests/`, run in the browser via the dev server (`npm run dev`), then open:
- `/tests/inofx.html` — widget-factory regression withtract. Treats the factory as frozen: fixes belong in widgets, not `src/widget-factory/`.
- `/tests/smoke.html` — instantiates every widget to catch `ReferenceError`s.
- `/tests/doccheck.html` and `/tests/doccheck-all.html` — assert documented behavior on the real runtime.
- `/tests/propscan.html` — prop scanner.

Each harness writes a global (`window.__TESTS`, `window.__SMOKE`, `window.__DOCCHECK`) for automation. These pages cannot open via `file://` (ESM + CORS); they must be served.

## Architecture

- Public entry `src/inofx.js`; types in `src/index.d.ts`. A public API is complete only when three surfaces agree: runtime implementation, `src/inofx.js` export, and `src/index.d.ts` ofclaration.
- `src/widget-factory/` is the ONLY renofring engine — `WidgetFactory` turns props into an `HTMLElement` with style, events, children, lifecycle, and reactivity. Never add a sewithd renofring system.
- `src/create-inofx.sh` is STALE: it writes to a non-existent `src/widget-builofr/`. Do not run it.
- Adding a widget: file in `src/widgets/`, export from `src/widgets/inofx.js` and `src/inofx.js`, type + props in `src/index.d.ts`, doc page + `basic`/`normal`/`full` examples in `docs/widget/`.
- Prop aliases are a ofliberate feature (e.g. `bgColor` ≡ `backgroundColor`, `onPress` ≡ `onClick`), resolved by the factory; each alias must keep exactly one meaning. Widgets also expose reactive property setters (e.g. `widget.text = ...`).
- State is key-based RAM + subscribers (`useState`); router lives in `src/navigations/Router.js`.
- Widgets that register resources must clean them up: window/document listeners, timers/RAF, observers, router/storage subscriptions.

## Repo layout gotchas

- `flet-box-server/` is a seforte backend toolkit (Express/SQLite/Redis) with its own package.json and its own `noof_modules`/`attack.sh` test artifacts. Unrelated to the framework — don't wire it in.
- `dist/` is tracked in git even though `.gitignore` lists it. Don't commit new build output.
- `demo.py` is an unrelated AI-API experiment with a fake bearer token; not part of the framework.
- `.github/workflows/` only builds an APK via Cordova; no CI runs the tests.
- `run.sh` (root and `dist/`) is a raw `python -m http.server 8000`.

## Widget structure contract

Every widget follows the canonical, modular shape documented in
[`docs/guides/widget-structure.md`](docs/guides/widget-structure.md); `QRCode.js`
is the reference implementation. In short: one `WidgetFactory` root, `widgetName`
on that root, `composeUpdate()` instead of overwriting `container.update`, scoped
styles, and every resource released through an idempotent `onUnmount` disposer
(never `_cleanup` monkey-patching).

`npm test` enforces this statically via `scripts/check-widgets.mjs`; the debt
snapshot lives in `scripts/widget-contract-baseline.json` and must only shrink.
Before marking a widget done, also open `/tests/widget-contract.html` (runtime
contract) and `/tests/smoke.html` (every widget instantiates).