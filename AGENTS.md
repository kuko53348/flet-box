# AGENTS.md

FletBox: zero-runtime-dependency vanilla-JS UI framework with a Flet-like declarative API. ESM only (`"type": "module"`), Node >= 20.9. Dev happens on branch `refactory`.

## Commands

- `npm run dev` — static dev server on port 8000 (override with `--port`). Despite the `--hot` flag in package.json, `run` never enables HMR (the CLI only parses `--port`/`--quiet`); use `flet-box run-spa` for hot reload.
- `npm run build` — esbuild-bundles `src/app.js` into `dist/`. Requires `src/app.js` (present at framework root as the demo, so the build works here). Real workflow: `flet-box create <name>` then build inside that project.
- `npm run release -- --patch [--push]` — the ONLY way to bump a version. Requires a clean tree, bumps `package.json` with the odometer scheme (`bin/utils/version.js`: MAJOR unbounded, MINOR/PATCH 0–9 with carry), rebuilds the bundle (`www/config.json` + hash), commits, and tags `vX.Y.Z`. CI publishes that tag to npm; never run `npm publish` by hand. See `docs/guides/online-updates.md`.
- `npm test` — runs static checkers, in order:
  - `node scripts/check-widgets.mjs` — widget-structure contract against `scripts/widget-contract-baseline.json`.
  - `node scripts/check-prop-registry.mjs` — the `ALL_PROPS` registry vs what widgets/navigations actually read.
  - `node scripts/check-docs-props.mjs` — the `docs/widget/*.md` prop tables vs the registry, the implementations and `src/index.d.ts`. Blocks `DEAD` (a documented prop nothing routes or reads) and `BOOL_STYLE` (a documented `boolean` that reaches CSS as `1` because its registry entry has no `boolValues`).
  - `node scripts/check-api-surface.mjs` — API coupling across the three surfaces. It imports `src/index.js` for real, so it also fails when the barrel re-exports a name that no longer exists, or when the package stops being importable in Node (module-scope `window`/`document`).
  - `node scripts/check-router-base.mjs` — deployment base path.
  - `python3 tools/snippets-creator-flet-box/build_snippets.py --check` + `node scripts/check-snippets.mjs` — the VSCode snippet library (see Snippets below).
  Behavioral tests are browser harnesses in `tests/` (below).
- `python3 scripts/generate_widget_docs.py` — regenerates `docs/widget/*.md` from `src/index.d.ts` + the curated examples in `scripts/_docdata/`. Run after changing a widget's public props/types.
- Snippets: the dictionaries in `tools/snippets-creator-flet-box/FletBox_snippets_creator/` are the ONLY source. The four JSON files beside them (including the aggregate `FletBox.json`, which is what the editor loads) are build output — never hand-edit them, run `python3 tools/snippets-creator-flet-box/build_snippets.py`. Prefixes must stay unique across the three dictionaries: one prefix, one snippet, or the aggregate silently keeps the first file's version.
- `flet-box build android [--release [--aab]]` / `flet-box build ios [--archive]` — Capacitor builds, run **inside a generated project**. Both share `bin/utils/capacitor.js`; each owns its toolchain checks (`buildAndroid.js`: SDK + JDK; `buildIOS.js`: full Xcode + CocoaPods + simulator runtimes). Android `--release` leaves the artifact **unsigned on purpose** so it can be signed with the developer's own keystore (`apksigner` for the APK, `jarsigner`/Play App Signing for the AAB).
- `flet-box run-native <android|ios> [--device|--livereload]` — wraps `npx cap run` to compile and launch on an emulator/simulator or device. It reuses the toolchain helpers exported by `buildAndroid.js` (`prepareAndroidEnvironment`) and `buildIOS.js` (`requireAppleToolchain`); keep those exports when editing the build commands.
- No lint/formatter/typecheck config exists. Validate JS with `node --check <file>` and `python3 -m py_compile scripts/generate_widget_docs.py`.
- `flet-box check-api` (alias `flet-box check`) is the anti-hallucination gate: it imports `src/index.js` and reads `translateProps.js` + `src/index.d.ts` of the resolved package and reports invented widgets/props, positional widget calls, foreign-framework imports and broken imports between the app's own modules (`MODULE_NOT_FOUND`, `MISSING_EXPORT` — a name the target file never exports, resolved statically so it works offline and in CI). `--props <Widget>`, `--list`, `--emit-api`, `--json`, `--root <dir>`. Errors exit 1. `flet-box create` wires it into every app as `npm run check` (plus `AGENTS.md`, `.claude/CLAUDE.md`, `.cursor/rules/fletbox.mdc`, `.fletbox/memory/` and `.fletbox/api/cheatsheet.md`), and CI runs it — so a template that uses a non-existent export or prop fails the generated app immediately.

## Generated mobile projects

`flet-box create` writes the Capacitor scaffolding: `capacitor.config.json`, `assets/logo.png`, and one asset script per platform (`scripts/sync-android-icons.mjs`, `scripts/sync-ios-assets.mjs`) wired into the `android:sync` / `ios:sync` npm scripts. All templates are strings in `bin/utils/templates.js`.

Quirks that are easy to break when editing those templates:

- A template literal cannot contain unescaped inner backticks in the generated file. Inside a generated template literal, a nested backtick must be `\\\`` (emits ``\` ``), and a nested `${` must be `\\${`. When in doubt, generate the project and `node --check` the output.
- The iOS asset script reads icon/launch slots from `ios/App/App/Assets.xcassets/*/Contents.json` instead of hardcoding file names, because Capacitor owns those names and can change them between major versions.
- The iOS app icon must be flattened onto an opaque background: App Store validation rejects icons with an alpha channel.
- `LaunchScreen.storyboard` lays the splash image out inside the safe area, so its background color must match the launch image or the notch strip flashes white.


## Testing

Tests are dependency-free JS in `tests/`. They can be run headlessly with `npm run test:browser` (`scripts/run-browser-tests.mjs`: serves the repo, drives the system Chrome through puppeteer, and reads each harness's global). That script is optional — it resolves puppeteer from `$FLETBOX_PUPPETEER` or a sibling checkout and a browser from `$FLETBOX_CHROME` or the usual install paths, and skips with a notice when either is missing, so it never breaks `npm test`. To run one harness interactively: `npm run dev`, then open:

- `/tests/index.html` — widget-factory regression contract. Treats the factory as frozen: fixes belong in widgets, not `src/widget-factory/`.
- `/tests/smoke.html` — instantiates every widget to catch `ReferenceError`s.
- `/tests/regression.html` — guards for the bugs fixed in the widget audit (engine child-wipe, `ListView.updateData`, `DataTable` body rebuild, `SnackBar.close` idempotency, `AnimatedBox` keyframe dedupe, `MatrixRain` loop teardown). Add an assertion here for every bug you fix: each one failed before its fix.
- `/tests/doccheck.html` and `/tests/doccheck-all.html` — assert documented behavior on the real runtime.
- `/tests/propscan.html` — prop scanner.

Each harness writes a global (`window.__TESTS`, `window.__SMOKE`, `window.__REGRESSION`, `window.__DOCCHECK`, `window.__CONTRACT`) for automation. These pages cannot open via `file://` (ESM + CORS); they must be served.

## Architecture

- Public entry `src/index.js`; types in `src/index.d.ts`. A public API is complete only when three surfaces agree: runtime implementation, `src/index.js` export, and `src/index.d.ts` declaration — `scripts/check-api-surface.mjs` enforces this under `npm test`. Two rules follow from it: every `interface`/`type` in `index.d.ts` must be `export`ed (otherwise consumers cannot `import type` it), and the package must stay importable in Node (never touch `window`/`document` at module scope — guard with `typeof window !== "undefined"`).
- `src/widget-factory/` is the ONLY rendering engine — `WidgetFactory` turns props into an `HTMLElement` with style, events, children, lifecycle, and reactivity. Never add a second rendering system.
- `src/create-index.sh` is STALE: it writes to a non-existent `src/widget-builder/`. Do not run it.
- Adding a widget: file in `src/widgets/`, export from `src/widgets/index.js` and `src/index.js`, type + props in `src/index.d.ts`, doc page + `basic`/`normal`/`full` examples in `docs/widget/`.
- Prop aliases are a deliberate feature (e.g. `bgColor` ≡ `backgroundColor`, `onPress` ≡ `onClick`), resolved by the factory; each alias must keep exactly one meaning. Widgets also expose reactive property setters (e.g. `widget.text = ...`).
- State is key-based RAM + subscribers (`useState`); router lives in `src/navigations/Router.js`.
- Widgets that register resources must clean them up: window/document listeners, timers/RAF, observers, router/storage subscriptions.

## Repo layout gotchas

- The backend is a separate package and repo, `flet-box-server` (a sibling checkout, `../flet-box-server`); `docs/server/` documents it from here. It is NOT part of this repo and is not published with the framework — don't wire it in, and don't import it from `src/`.
- `www/` and `dist/` are gitignored build output — regenerate them with `npm run build` or `flet-box release`, never hand-edit them. `www/` is built from the root demo (`src/app.js` + `index.html`) so `flet-box run-bundle` works here; in a generated app it is the OTA source that CI builds and deploys to Pages on `v*` tags, and it stays out of git there too.
- `.github/workflows/npm-publish.yml` is the only workflow: it publishes to npm when `package.json` carries a version npm doesn't have yet. APK/AAB CI belongs to generated apps (`bin/utils/templates.js` writes theirs), not here. No CI runs the tests.
- npm ships all of `bin/`, so a stray `bin/package.json` would be published and shadow module resolution. Keep `bin/` free of package manifests.

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