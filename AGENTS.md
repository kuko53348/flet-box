# AGENTS.md

FletBox: zero-runtime-dependency vanilla-JS UI framework with a Flet-like declarative API. ESM only (`"type": "module"`), Node >= 20.9. Dev happens on branch `refactory`.

## Commands

- `npm run dev` — `flet-box run --hot`: static dev server on port 8000 with hot reload (`--port` overrides; `--quiet` silences request logs). `flet-box run-spa` is the same server with the SPA fallback (extension-less URLs rewrite to `index.html`).
- Hot reload contract (`bin/commands/runServer.js` + `src/core/hmr-client.js`): chokidar watches the **roots** `src/` and `index.html` and filters by extension in the handlers — chokidar 4 dropped glob support, so `src/**/*.js` is a literal path that never fires. `.css` is hot-swapped by cloning the matching `<link>` with a cache-busting `?t=`; any other change reloads the page **and restores the `useState` RAM**, which `initHMR` snapshots to `sessionStorage` before reloading. Reloads are triggered by the socket, never by a timer: a dropped socket retries once a second and reloads only when the connection *re*-establishes, so a server restart or a tunnel closing an idle socket does not produce an error page or a reload loop. Responses are sent with `Cache-Control: no-store` — a cached module makes a reload look like "nothing detected changes".
- `flet-box cloudflare` (aliases `cf`, `demo`, `tunnel`) — **builds the bundle first, then tunnels `www/`**: `createBundle(target)` → `process.chdir(target)` → `runDevServer({ spaMode: true, hotReload: false })` → `cloudflared tunnel`. It never serves `src/` publicly: `index.html` maps the bare `flet-box` specifier to `./node_modules/...`, so a source-tree tunnel shows a module-resolution error to anyone without that machine's `node_modules`. Two things it depends on that are easy to undo by accident: the SPA fallback injects `<base href="/">` (otherwise a deep link like `/demo/forms/Input` resolves `./loader.js` against `/demo/forms/` and the page comes up blank), and it rewrites `www/config.json`'s `update.url` to `/` (a tunnel is not the Pages origin, so the OTA check was a cross-origin fetch and every visitor's console showed a CORS error). Requires `cloudflared` on PATH; it probes for it *before* building.
- `npm run build` — esbuild-bundles `src/app.js` into `dist/`. Requires `src/app.js` (present at framework root as the demo, so the build works here). Real workflow: `flet-box create <name>` then build inside that project.
- `npm run release -- --patch [--push]` — the ONLY way to bump a version. Requires a clean tree, bumps `package.json` with the odometer scheme (`bin/utils/version.js`: MAJOR unbounded, MINOR/PATCH 0–9 with carry), rebuilds the bundle (`www/config.json` + hash), commits, and tags `vX.Y.Z`. CI publishes that tag to npm; never run `npm publish` by hand. See `docs/guides/online-updates.md`.
- `npm test` — runs static checkers, in order:
  - `node scripts/check-widgets.mjs` — widget-structure contract against `scripts/widget-contract-baseline.json`.
  - `node scripts/check-prop-registry.mjs` — the `ALL_PROPS` registry vs what widgets/navigations actually read.
  - `node scripts/check-docs-props.mjs` — the `docs/widget/*.md` prop tables vs the registry, the implementations and `src/index.d.ts`. Blocks `DEAD` (a documented prop nothing routes or reads) and `BOOL_STYLE` (a documented `boolean` that reaches CSS as `1` because its registry entry has no `boolValues`).
  - `node scripts/check-api-surface.mjs` — API coupling across the three surfaces. It imports `src/index.js` for real, so it also fails when the barrel re-exports a name that no longer exists, or when the package stops being importable in Node (module-scope `window`/`document`).
  - `node scripts/check-router-base.mjs` — deployment base path.
  - `node scripts/check-cli-install.mjs` — the shape of the **published** package: it `npm pack`s the repo, extracts the tarball and runs `bin/cli.js` from it with no `node_modules` in scope, which is the only place where a `bin/` module reaching for a devDependency at import time shows up (it used to break every CLI command for consumers, since the checkout always has `ws`/`chokidar`). It also asserts `docs/widget/` shipped.
  - `python3 tools/snippets-creator-flet-box/build_snippets.py --check` + `node scripts/check-snippets.mjs` — the VSCode snippet library (see Snippets below).
  Behavioral tests are browser harnesses in `tests/` (below).
- `python3 scripts/generate_widget_docs.py` — regenerates `docs/widget/*.md` from `src/index.d.ts` + the curated examples in `scripts/_docdata/`. Run after changing a widget's public props/types.
- Snippets: the dictionaries in `tools/snippets-creator-flet-box/FletBox_snippets_creator/` are the ONLY source. The four JSON files beside them (including the aggregate `FletBox.json`, which is what the editor loads) are build output — never hand-edit them, run `python3 tools/snippets-creator-flet-box/build_snippets.py`. Prefixes must stay unique across the three dictionaries: one prefix, one snippet, or the aggregate silently keeps the first file's version.
- `flet-box build android [--release [--aab]]` / `flet-box build ios [--archive]` — Capacitor builds, run **inside a generated project**. Both share `bin/utils/capacitor.js`; each owns its toolchain checks (`buildAndroid.js`: SDK + JDK; `buildIOS.js`: full Xcode + CocoaPods + simulator runtimes). Android `--release` leaves the artifact **unsigned on purpose** so it can be signed with the developer's own keystore (`apksigner` for the APK, `jarsigner`/Play App Signing for the AAB).
- `flet-box run-native <android|ios> [--device|--livereload]` — wraps `npx cap run` to compile and launch on an emulator/simulator or device. It reuses the toolchain helpers exported by `buildAndroid.js` (`prepareAndroidEnvironment`) and `buildIOS.js` (`requireAppleToolchain`); keep those exports when editing the build commands.
- No lint/formatter/typecheck config exists. Validate JS with `node --check <file>` and `python3 -m py_compile scripts/generate_widget_docs.py`.
- `flet-box audit-fix` (aliases `fix-imports`, `fix-path-imports`, `auditFix`) is the *repair* half of that gate: it rewrites what `check-api` can prove — a wrong relative path, a default import of a named-only widget, a missing `import` line for a bare identifier (merged into the existing flet-box import when there is one), and a mistyped prop key — and prints everything ambiguous under "Left for you to decide" untouched. `--only imports|props`, `--root <dir>`. It writes files directly, so the rule is strict: rewrite only when **exactly one** candidate is within a length-gated edit distance (`strictMatch` in `bin/commands/auditFix.js`: 0 for names < 4 chars, 1 up to 8, 2 from 9) and a tie means no edit. Prop keys are only touched when the identifier is a known flet-box import and the key is in neither `PROP_MAP` nor `STRUCTURAL_PROPS`. `flet-box create` wires it as `npm run fix`. Reuses `loadApi`/`nearest`/`collectSources`/`STRUCTURAL_PROPS` exported from `checkApi.js` — keep those exports.
- `flet-box check-api` (alias `flet-box check`) is the anti-hallucination gate: it imports `src/index.js` and reads `translateProps.js` + `src/index.d.ts` of the resolved package and reports invented widgets/props, positional widget calls, foreign-framework imports and broken imports between the app's own modules (`MODULE_NOT_FOUND`, `MISSING_EXPORT` — a name the target file never exports, resolved statically so it works offline and in CI). `--props <Widget>`, `--list`, `--emit-api`, `--json`, `--root <dir>`. Errors exit 1. `flet-box create` wires it into every app as `npm run check` (plus `AGENTS.md`, `.claude/CLAUDE.md`, `.cursor/rules/fletbox.mdc`, `.fletbox/memory/` and `.fletbox/api/cheatsheet.md`), and CI runs it — so a template that uses a non-existent export or prop fails the generated app immediately.
- `flet-box unpack <Widget>` (`bin/commands/unpack.js`) is the *read* half: it cross-checks the four places a prop lives — `src/index.d.ts`, the `ALL_PROPS` registry, the widget's own source, its doc page — and labels every disagreement `DEAD` (typed, routed by nothing, read by nothing), `INVENTED` (read by the widget, declared nowhere), `UNDOCUMENTED` (the engine routes it, the interface hides it), `DOC-ONLY`, `CODE-ONLY`. Flags: `--example` (a paste-ready call built only from verified props, and it never drops a required one), `--diff`, `--all`, `--json`, `--md`, `--root <dir>`. `unpack --all` writes `.fletbox/api/api.json` + `api.md`; `flet-box create` generates them at scaffold time and wires `npm run api` to regenerate. Two invariants to keep: the widget filter is `exported && propsSource()` (a singleton API like `initRouter` has no props interface and must not appear), and `readProps()` reads structure from the **neutralised** source (`bin/utils/neutralise.js`) while slicing values out of the raw text at the same offsets — splitting a destructuring pattern on raw commas invents props, which is exactly how `Consolas/Menlo/Monaco` became props of `Markdown`. Shared parsing lives in `bin/utils/dtsProps.js` (`parseSignatures`, `membersOf`, `resolveInterfaceProps`) and is reused by `check-api`; keep those exports and `loadApi`/`nearest`/`STRUCTURAL_PROPS` in `checkApi.js`.

- The generated app's agent contract is `templates.agentsMd()` in `bin/utils/templates.js`, mirrored by `claudeMd()` and `cursorRules()` — all three are arrays of single-quoted lines joined with `\n`, so an apostrophe inside a line must be escaped or the template stops compiling. Its numbered sections are load-bearing and cross-referenced by number ("the design system in section 4", "the checker in section 5"): inserting or removing a section means renumbering the rest and that prose. §4 is the design system (one brand color per screen from the `colors` tokens, no hex literals; spacing/radius/type only from the 8-based scale 4·8·12·16·18·24·32·48) and every token name in it was read off the real `colors` export — do not "tidy" one into a name that does not exist.
- `flet-box create <name> --template <basic|adaptive|blank|full|sidebar>` (and `--template=<name>`) is equivalent to the `--blank`-style flags. The **first** positional is always the project name; a later one is treated as an unclaimed flag value and is ignored, because a value that leaked past the parser used to rename the project (`create myapp --template blank` built a folder called `blank`).

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
- `bin/` may not import a devDependency at module scope. `ws` and `chokidar` exist only for the dev server, so `bin/cli.js` loads `runServer.js`/`runBundle.js`/`runCloudflare.js` with `await import()` inside their command branches; keep them lazy or `flet-box` crashes on every command for anyone who installs it from npm. `check-cli-install.mjs` (above) is the tripwire.

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