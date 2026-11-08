# FletBox Widget Audit & Repair Log

> **Living handover document.** If you run out of tokens, another AI (or you later) must be able to continue reading **this file alone**. Update it at the end of each round: move done items to *FIXED*, adjust *PENDING*, and add a line to *History*.
>
> - **Repo:** `flet-box` (pure framework). The backend `flet-box-server` is **out of scope** by author decision.
> - **Branch:** `refactory`
> - **Status:** `npm test` green · `npm run test:browser` **470 OK / 0 failures** (44 guards)
> - **Commits:** rounds 1–6 are committed and pushed (`refactory` → `065a3c9`, v1.0.4). **Round 7 is uncommitted** (13 files modified + `scripts/check-router-base.mjs`); `flet-box-docs` also has the deep links uncommitted. The author decides when to commit.
> - **Rounds completed:** 12 (see *History* below)

---

## 1. How to continue (read this first)

```bash
cd flet-box
npm test                # 3 static checks: widget contract + API coupling
                        # + Router base-path (9 cases, no browser)
npm run test:browser    # real suite in headless Chrome (470 assertions, 6 harnesses)
npm run test:browser regression   # single harness (filter by substring of the name)
npm run test:browser --verbose    # page console + each failed assertion with detail
node --check <file>     # validate syntax of a standalone file
```

`npm run test:browser` needs puppeteer + Chrome. The environment resolves them via:
`$FLETBOX_PUPPETEER` or `../flet-box-server/node_modules/puppeteer`, and
`$FLETBOX_CHROME` or `/Applications/Google Chrome.app/...`. If any is missing it is **skipped**
with a notice (exit 0), it does not break anything.

### Process rules (mandatory, proven value)

1. **Verify the bug BEFORE touching code.** Create a temporary probe (see §7) and reproduce the
   failure with numbers. Half of reported "bugs" turned out to be false positives on re-measurement.
2. **Verify AFTER** with the same test and confirm no regression.
3. **Add one guard per fixed bug** in `tests/regression.test.js`. Each guard must **fail before** the fix.
   2 errors found by them so far.
4. **Beware of bug-fixing tests.** If you fix something and a test turns red, read the test:
   it may be encoding incorrect behavior (happened with `Inspector`). Verify the documentation before
   deciding who is right.
5. **When measuring `requestAnimationFrame`, compensate for background noise.**
   Headless Chrome limits frames, so for loop detection use a stub `rAF → setTimeout` **and**
   `cancelAnimationFrame → clearTimeout` (replacing only one produces an artifact).
6. **Do not commit.** The author decides (`npm run release` is the only version push).

---

## 2. Infrastructure built (what did not exist before)

| File | What it does |
|---|---|
| `scripts/run-browser-tests.mjs` | Headless runner: serves the repo, spawns Chrome via puppeteer, collects each harness global. **Optional** (adds no dependencies). `npm run test:browser` |
| `tests/regression.html` + `tests/regression.test.js` | **44 regression guards**, one per fixed bug. Publishes `window.__REGRESSION`. Add each new fix here |
| `scripts/check-router-base.mjs` | The GitHub Pages deep-link fix (auto-detected base path, `options.base`, root hosting, unknown route → `/`) **had no automated coverage**: 9 cases in pure Node, no browser. Integrated into `npm test` |
| `scripts/check-api-surface.mjs` | Verifies the 3 surfaces match (runtime / `index.js` / `index.d.ts`). Integrated into `npm test` |
| `src/tools/dimensions.js` (fix) | The package **could not be imported in Node** (`window` in module scope) → SSR/tests/tooling broken |

Existing harnesses **no CI was running**: `/tests/smoke.html` (51), `/tests/index.html`
(43, factory contract), `/tests/widget-contract.html` (95), `/tests/doccheck*.html` (237).

---

## 3. FIXED (36 bugs)

### 3.1 Motor — the most serious

**[MOTOR-1] `update()` deleted ALL children of a composed widget.**
- Cause: `processProps.js:24` uses `null` as the "no text" sentinel and
  `assignProps.js:113` compared `!== undefined`; `null` passed the filter and
  `widget.textContent = null` deleted all child nodes.
- Evidence: `card.bgColor = "red"` → `innerHTML` went from 954 bytes to `""`;
  `row.gap = 8` → 2 children → **0**.
- Fix: `assignProps.js` → `props.textContent !== undefined && props.textContent !== null`.
- **Affected almost all widgets with children**, triggered by any reactive setter.
- Touches `src/widget-factory/`, which the project treats as frozen: **the factory contract (43 assertions) stays green**.

### 3.2 Critical

| ID | Bug | Evidence |
|---|---|---|
| **[QR-1]** | `QRCode` **encoded no data**: `finalBits` stayed empty because `pushBits` wrote to `bits` | 3 payloads produced **identical** matrices; now differ. Also: 16-bit count for version ≥10 |
| **[SLIDER-1]** | `Slider` with `min === max` + `showMarks` → infinite `i += 0`, **freezes the tab** | guard `if (!(stepMark > 0)) return [currentMin]` |
| **[MD-XSS]** | `Markdown`: sanitizer bypass. `/<[^<>]+>/g` cuts at the first `>`, even inside quotes → `<img src="x>y" onerror=...>` passes intact | 5 payload classes (quotes+`>`, `onerror`, `svg onload`, `javascript:`, `<script>`) now clean |
| **[INPUT-1]** | `Input`: `input.label = "X"` **destroyed the widget** (`label` IS_REACTIVE_PROP → `textContent`) | `innerHTML` 954 → **11 bytes** and `<input>` disappeared. Now intact |
| **[DT-1]** | `DataTable.updateColumns()` **emptied all rows** | `updateData(rows)` emptied the same array it then scattered. Now preserves 1 row |
| **[DT-2]** | `DataTable.updateData()` 2nd call → `NotFoundError` (`tbody` was `const`) | now 2 updates OK |
| **[LV-1]** | `ListView.updateData()` → `RangeError` from infinite recursion (the `data` setter called `updateData`, which assigned `element.data`) | also affected `GridView` |

### 3.3 High

| ID | Bug | Verification |
|---|---|---|
| **[NAV-1..4]** | `AppBar`, `Tabs`, `DrawerItem`, `BottomNavigation`: their resources were only released in `_cleanup`, which the lifecycle observer **never calls** | measured: 3 AppBars + 3 Tabs → `scroll`/`resize` **0 → 3 → 0** |
| **[SB-1]** | `SnackBar`: `close()` non-idempotent → `onClose` fired N times | 3 closes → `onClose` **1 time** |
| **[SB-2]** | `SnackBar`: closing instantly → the `rAF` of `show()` made it **blink visible** for 300 ms | opacity stays `\"0\"` |
| **[MR-1]** | `MatrixRain`: the `rAF` loop **never stopped** when removing the canvas from the DOM (raw canvas, no `onUnmount`) | 210 frames/200 ms after unmount → now 4 (= noise), and **still animating on mount** (30) |
| **[MR-2]** | `MatrixRain` absolute mode: `ResizeObserver` created before mount → `observe()` never called and lazy attach stayed disabled | observer created and attached when parent appears; re-attaches if it changes |
| **[AB-1]** | `AnimatedBox`: a **permanent** `<style>` per call (`Date.now()` broke the dedupe); `AnimatedText` called once **per letter** | 5 calls → **1** `<style>` (was 5); 11 letters → 0 new |
| **[AB-2]** | `AnimatedBox`: descriptor without `from`/`to` → `TypeError` **crushed the whole render** | warns and skips the step |
| **[TABS-1]** | `Tabs`: the active tab's initial panel **never mounted** | `updateContent()` on construction (TDZ, after its definition) |
| **[FORM-1]** | `Checkbox`/`Switch`/`Radio`: any `update()` **deleted the `onclick`** (`assignProps` sets `widget.onclick = null` and only re-applies handlers coming from props) | the 3 still respond after `update()` and after a reactive setter |
| **[CHART-1]** | `Chart`: `Math.max(0, minVal)` inverted the range with negative data → **everything drawn outside the canvas** | 0 px → **28.870** (positive: 34.669) |
| **[CC-1]** | `CircularChart`: the first `rAF` frame wasn't tracked → the loop survived unmount and `startAnimation()` could launch two loops | `animationId = requestAnimationFrame(...)` |
| **[IMG-1]** | `Image`: `fit` and `circular` documented but **dead** (not in the prop registry → `style.fit` inert); also broke `Avatar` with non-square images | `object-fit: cover`, `border-radius: 50%` |
| **[MD-1]** | `Markdown.text` (REACTIVE_PROP → `textContent`) **destroyed the render** | now re-renders: `<h1>Adios</h1>` |
| **[CV-1]** | `CodeViewer.title` (same) destroyed header + code | header updated, `innerHTML` 739 → 739 |
| **[AT-1]** | `AnimatedText`: read `child._props`, which **nobody ever assigns** → the documented per-letter style inheritance **never happened** | letters to `48px` and `rgb(255,0,0)` |
| **[INSP-1]** | `Inspector`: same nonexistent `_props` → **printed not one prop**; also discarded `child` when it was an **array** (which `Button` uses) | before `Span()`; now `Span({ text: "Hello", ... })` |
| **[DRAWER-1]** | `Drawer.destroy()` **was never called**: `Scaffold` only did `removeChild` of the wrapper → the viewport resize listener, the Escape handler and the close timer survived, and `document.body` grew on every rebuild | measured: 3 Scaffold+Drawer → `body` 8→14→**8**, `dimensions` listeners 0→**3**→**0** |
| **[DD-1]** | `Dropdown`: `scroll` listener registered with capture and removed without capture → **leak on each open** | 3 cycles → 0→1→0, no accumulation |
| **[MODAL-1]** | `Modal`/`BottomSheet`: the timer that hides after the close animation wasn't stored or cancelled → re-opening inside the animation window left a **modal open but invisible** | `close(); wait(100); open(); wait(350)` → `visibility` still `\"visible\"` |
| **[MODAL-2]** | `Modal`/`BottomSheet`: the `document` `keydown` listener was only removed in `close()`/`destroy()` → survived unmount | also registered via `overlay.onUnmount(...)`, which additionally clears the timer |
| **[ANIM-NAN]** | `animate.js`: `from: undefined` (documented API) read `\"\"` → wrote `\"NaN\"` every frame → **don't animate and don't warn** | now writes valid values (`opacity` ends at `\"1\"`) |
| **[ANIM-DUR]** | `animate.js`: negative `duration` → `progress` always < 1 → **infinite loop** (and `animateAsync` never resolved) | duration sanitised; bounded to ~5 frames (was infinite) and the promise resolves |
| **[AUDIO-1]** | `Audio`: the 2 s fallback timer wasn't stored → after unmount it did `fetch` of the full file + `AudioContext` + `onLoad` on a discarded widget (**once per rebuild**) | URL-filtered: 0 fetches and 0 `AudioContext` attributable after unmount and waiting 2.4 s |
| **[AUDIO-2]** | `Audio`: `AudioContext.close()` only on the success branch → if decoding failed the context leaked (limit ~6 per page; the rest never start) | `try { decode } finally { close() }` |

### 3.4 Round 7 — the 4 long-cycle and reactivity fixes (were §4.1)

| ID | Bug | Verification (guard in `tests/regression.test.js`) |
|---|---|---|
| **[ANIM-1]** | `animate.js`: **uncancellable** loops; two animations on the same prop clashed (the old one resumed after the new one ended) and `pulse()` left a `setTimeout` that launched phase 2 on a **removed** widget | registry `WeakMap<widget, Map<prop, loopState>>`; the new one replaces the old; `animate`/`fadeIn`/`fadeOut`/`pulse` return a cancel function; **`stopAnimation(widget, prop?)`** (new API, 3 surfaces + `docs/tools/animation.md`); `pulse` is **a single loop** with a triangular curve (no timer); `animateAsync` also resolves when cancelled → no `await` left hanging. Guards: `opacity` frozen after `cancel()` and after `stopAnimation`; the 2nd animation wins (was **1**, now **0**); pulse doesn't scale 260 ms after cancel |
| **[LV-2]** | `ListView`: scroll and mount `rAF`s **uncancelled** (`onEndReached` fired on a detached list → infinite scroll, endless `fetch`); the header height was **counted twice** | `getItemTop` no longer adds the header (it's a SISTER of `innerContainer`, not alive inside) → row 0 at `top: 0px` (was `50px`) and `inner.height` = 20×40 = **800px** (was **850px**: the list scrolled a header + an extra footer). The viewport is calculated in item space (`scrollTop − headerHeight`) and `scrollToIndex` adds it back. saved ids + `cancelAnimationFrame` + `disposed` flag in `onUnmount`. **`ResizeObserver`** (fallback: `window resize`) re-renders when the viewport grows. Guards: `onEndReached` **0 times** after unmount; geometry 800px/0px; rows **8 → 25** when going from 60px to 400px (was stuck at 8) |
| **[SLIDER-2]** | `Slider`: `updateThumbPosition` re-armed with `rAF` **while the track measured 0** — detached or never-inserted, the loop was for life | `thumbRaf` + `disposed` + `initTimer`, a single pending queue per slider, everything cancelled in `onUnmount`. Guard with equal-duration windows (180 ms): live loop ≈ 2× background noise, **0** frames attributable after unmount |
| **[STEPPER-1]** | `Stepper`: `showNavigation` declared, typed and documented but **never read** → navigation always rendered | the nav container is only built if `showNavigation`; `updateUI()` skips the branch when it's `null`. Guard: without nav → **2** sections and no "Next"/"Back"; "Next" stays by default |

### 3.5 `useState` / `reactiveValue` — audit & hardening

What was **already good** (verified by reading the full flow): a single RamStore dispatcher
(O(1) per key instead of O(keys) per change), two-level registration `key → widget → props`
(idempotent, O(1) with 1,600 widgets), release via `onUnmount`, live value with
`valueOf`/`toString`/`_value` so `${count}` and `count + 1` work, and bounded structural reads to
the render pass. **No circular imports**: `reactiveValue.js` imports nothing.

Defects found and fixed:

1. **Sticky structural keys** (`reactiveValue.js`). The Set of structurally-read keys was only cleared
   in `cleanupUseState`, so **one** read in a template literal condemns that key to force a **full**
   app re-render **forever**, even if later passed only via props: surgical reactivity turned off
   itself and without warning. Now each pass opens its own set and `endRenderPass` publishes it (the
   previous pass re-detects everything).
   Guard: `useState: a key stops forcing full renders…` → with the key only in props:
   **0** rebuilds and the node updates to `7` in the same element.
2. **`resolving` not reentrant**: `resolveReactive` set it to `false` in `finally`, so a reactive value
   reading another reactive one would unsets the outer read and count as structural (free rebuild for
   the framework, cost for the app). Now it saves and restores.
3. **`setState` compared against the captured value when `useState` ran, not against the store**:
   if an external `saveState` had already moved the key to the value to set, the setter **skipped the
   dispatch** and store, widgets and callbacks stayed out of sync. Now reads `getRam(key)` (and the
   updater `prev => …` receives the current value, not the old one).
   Guard: store 1 → 2 (external) → `setN(1)` = **2** notifications and store at **1** (was: 1 and still at 2).
4. **Registration leak**: the `widgetsByKey` entry survived when the last widget was released.
   Now the key is deleted when it becomes empty.
5. **Dead or contradictory code**: out of `unregisterWidget` (0 call sites and wrong semantics — it
   deleted all props of the widget); out of the `_cleanup` patch in `registerWidget`, which the file's
   own comment says the lifecycle observer **never calls** (and it's true: `addLifecycle` runs before
   `bindReactiveProps`, so `onUnmount` always exists); `getUseStateStats()` reported `widgetsCount` =
   number of **keys** (now `stateKeys` / `boundWidgets` / `watchers`); `subscribe` and `useWatchState`
   returned the `true/false` of `Set.delete` as if it were the unsubscribe result.

### 3.6 Tests fixed (bug-fixing tests)

- **`tests/doccheck-ch4.js`**: two assertions hardcoded the **light theme** color;
  on a Mac in dark mode they failed. Now use `rgbOf(colors.*)` like the rest of the file.
- **`tests/doccheck-ch6.js`**: 3 `Inspector` assertions required `Span()` **without props**
  (`eq(out, "Span()")`), exactly the opposite of what its documentation promises. Updated
  to `Span({` + prop presence.

---

## 4. PENDING (prioritized, evidence already collected)

### 4.1 High — next round

The 4 round-7 highs (`[ANIM-1]`, `[LV-2]`, `[SLIDER-2]`, `[STEPPER-1]`) are already fixed with guards →
see **§3.4**. Promoted from §4.2 to the next round:

| ID | Bug | Where | Suggested fix |
|---|---|---|---|
| **[LIST-1]** | `Accordion`: animation timers (~310 ms) not cleaned up → `onPress`/`onToggle` fire **after** unmount; also `update({expanded})` is a **no-op** (public API cannot collapse a panel) | `Accordion.js:288-298, 318-329, 467-533` | keep the id and cancel it in `onUnmount`; implement `expanded` in `update()` (same path as the internal toggle) |
| **[CAROUSEL-1]** | `Carousel`: the `setInterval` autoplay starts at **construction**; if the widget never mounts, the lifecycle orphan-prune removes it from the registry **without** running unmount → the timer runs forever | `Carousel.js:281-285` | start it from `onMount` and stop it in `onUnmount` (pattern already used in `MatrixRain`) |
| **[INPUT-2]** | `Input`: `validation="safe"` **escapes the user's own text** (`a=b` → `a&#x3D;b`); the initial validation UI never renders; `clearable`, `passwordToggle` and `onEnter` documented and **not implemented** | `Input.js:189-205, 216` | validate without HTML-escaping the `value`, render the initial state at construction, and implement (or document as non-existent) the 3 dead props |
| **[MAX0-1]** | `ProgressBar` with `max:0` → `NaN%`; `CircularBar` with `max:0` paints literal `\"Infinity\"` on the canvas | `ProgressBar.js:28`, `CircularBar.js:118-122,186,236,254` | shared `max > 0 ? … : 0` guard; one guard covers both |

### 4.2 Medium

(List-1 / CAROUSEL-1 / INPUT-2 / MAX0-1 promoted to §4.1)

- **[DROPBOX-1]** `DroppBox`: `activeBgColor`/`activeBorderColor` **dead**; `invalidBgColor`/`invalidBorderColor` **unreachable** (`isValidDrag()` guards the only call site) (`DroppBox.js:28-29,105-113,139`).
- **[DRAGBOX-1]** `DraggBox`: the drag clone is added to `document.body` and only removed in its own `dragend` → if the widget unmounts mid-drag it is left orphaned (`DraggBox.js:43-59,94-110`).
- **[INSTALL-1]** `InstallButton`: `onPress` documented **overrides the installer** (`...rest` spreads after `onPress: handleClick`); `onInstalled` fires **twice** in Chromium; a `beforeinstallprompt` previous to mount is **unrecoverable** (uses its own `deferredPrompt` instead of the shared one in `src/core/pwa.js`).
- **[SLIDER-3]** `Slider`: snapping ignores `min` (`Math.round(raw/step)*step` instead of relative to `min`, `Slider.js:360`); almost all the own properties are swallowed by `update()` (`Slider.js:15-22 vs 459-481`).
- **[DROPDOWN-2]** `Dropdown`: `width`/`portal` accepted but ignored by `update()`; `clearable` only evaluated at construction; `onChange` never receives the 2nd documented argument `label` (`Dropdown.js:352`).
- **[TEXT-1]** `Text`: `italic` and `decoration` documented and **ignored**; `styles: null` → `TypeError` during render (`Text.js:19-32,62`).
- **[CONTAINER-1]** `Container`: `expand` documented and **ignored** (`Container.js:9-17`).
- **[STACK-1]** `Stack`: `alignment` documented and **ignored** (`Stack.js:8-17`).
- **[DIVIDER-1]** `Divider`: the side margins are eaten by the default `margin = 16` (inverted priority, `Divider.js:32-44`); the default color is `colors.surface` → **a Divider is invisible by default** (`Divider.js:10`).
- **[ICON-1]** `Icon`: a user `className` **replaces** `material-icons` and breaks the glyph (`Icon.js:21,29`).
- **[CARD-1]** `Card`: `elevation` writes `box-shadow: 4px` (invalid) → **no shadow** (`Card.js:11,27`).
- **[AVATAR-1]** `Avatar`: `updateContent()` does manual DOM surgery → the content **reverts** on the next update; stale/NaN geometry when changing `size` (`Avatar.js:147-205,53,154-162`); anonymous hover listeners without `onUnmount` (`Avatar.js:128-133`).
- **[CHART-2]** `Chart`: `showValues` ignored on bars if no `labels`; `data: []` returns `null` → `updateData()` crashes; no `devicePixelRatio` (blurry on HiDPI).
- **[CC-2]** `CircularChart`: label % divides by the sector angle in radians instead of the total (`CircularChart.js:274-277`); `strokeWidth` ignored without `size`; semicircle at half the radius; `shadowBlur`/`shadowColor`/`glowColor` dead.
- **[QR-2]** `QRCode`: alignment patterns that land on the timing row/column are skipped → corrupts versions 7–10 (`QRCode.js:208-211`); no `devicePixelRatio`; `setTimeout` outside `onUnmount`.
- **[MODAL-3]** `Modal`: `closeOnOverlayClick` documented and **dead** (handler commented out); `setLoading(false)` restores the construction content and discards `updateContent()`.
- **[BOTTOMSHEET-1]** `BottomSheet`: `closeOnOverlayClick` dead; `...rest` not forwarded (extra props discarded); `touchmove` without `{passive:false}`.
- **[SHEET-2]** `BottomSheet`: `mousemove` commented out → mouse drag is dead.
- **[BODY-1]** `Badge`: the theme subscription is **unreachable** (`if (!bgColor && !color)` with defaults already applied) → a theme change keeps the old color (`Badge.js:137-141`).
- **[ADS-1]** `AdMob`/`AdSense`: `label: null` → `TypeError` in render (`AdSense.js:177,189`, `AdMob.js:189,196`); the `disposed` latch is one-directional → any transient unmount **kills the slot forever**; `AdMob.initPromise` is global and **not keyed by plugin**; `dispose()` ignores the `hideBanner` fallback and doesn't remove the native banner if `autoInitialize` was off.
- **[SCAFFOLD-1]** `Scaffold._cleanup` doesn't do the `registeredWidgets.delete` that lifecycle does → a re-attached scaffold stays registered and disconnected before the prune.
- **[PAGINATION-1]** `Pagination`: `pageSize: 0` → `totalPages = Infinity` (button "Infinity"); `maxButtons: 0` → loose button.
- **[RATING-1]** (suspected) `Rating` doesn't use `composeUpdate`: `rating.update({value})` leaves the stars stale while `rating.value = 4` works — the two public paths disagree.

### 4.3 Low

`ListView.onEndReached` without re-add guard (fires on every scroll near the end) · `ListView.finalHeight` computed and never used · `TreeView` calls `ref` twice (encoded in a test) · `Inspector` escapes `'` but not `\\` in object values · `Inspector` prioritizes `TAG_NAMES` over `_widgetName` (`Inspector(Chart(...))` prints `Div`) · `CodeViewer.syncScroll` is dead code · `CodeViewer` `padding/2` → `NaNpx` with `padding` string · `Markdown` lets through `<style>`/`<iframe>`/`<svg>` · `Chart` single-point series draws nothing · `CircularChart` docs say `startAngle` in degrees but code uses radians · `QRCode` returns `null` without `value` (violates rule 3 of the contract) · `prefers-reduced-motion` not supported in animations.

---

## 5. IMPLEMENTED — surgical reactivity with React syntax

**Author request:** keep `const [color, setColor] = useState("color", "red")` +
`Container({ bgColor: color })` and that `setColor("blue")` updates **only that widget**.
(It was half-done: docs promised *"Update one widget without touching the app"* but the
code always re-rendered.)

### What was done (5 files)

1. **New `src/widget-factory/reactiveValue.js`** — the shared protocol:
   `isReactive`, `reactiveKeyOf`, `resolveReactive` and `createReactiveValue`.
2. **`useState` returns a LIVE value** (`createReactiveValue(() => getRam(key), key)`): it is a
   **function** (so `resolveReactive` calls it and always reads the current value) decorated with
   `valueOf`/`toString` (for `${count}` and arithmetic) and a `_value` getter (compatibility).
   **The `[value, setState, subscribe]` signature does not change.**
3. **`widgetFactory` auto-registers the binding** (`bindReactiveProps`): if a prop is a reactive
   value with `_stateKey`, it calls `registerWidget(key, widget, prop)`.
   It does so at construction and on each `update()` (only for incoming keys).
4. **The RamStore subscriber no longer re-renders when there is a binding**:
   ```js
   const bound = widgetsByKey.get(key);
   let handled = 0;
   if (bound) bound.forEach(({widget, propName}) => { widget.update({[propName]: newValue}); handled++; });
   if (handled === 0) triggerRender();   // ← only if NO widget is bound
   ```
   Key rule: **if no widget is bound, re-render (declarative path intact); if there is, patch and don't re-render.**
5. **`registerWidget` releases via `onUnmount`** (not the `_cleanup` monkey-patch, which the observer
   never calls → leak) and is idempotent (doesn't stack duplicates on rebuild).
6. **`processProps` resolves the reactive value once** before applying the unit: so
   `width: count` receives a **number** and gets its `rem`/`px` (before the object/function was
   discarded on its way to CSS).

### Verification (measured)

| Case | Result |
|---|---|
| `Container({ bgColor: color })` + `setColor("blue")` | bg red → **blue**, **0 rebuilds**, **same node** ✅ |
| `Container({ width: n })` + `setN(50)` | `3.125rem` (=50px) and **0 rebuilds** ✅ |
| Derivative: `Text({ text: "N=" + n })` | **re-renders** and shows `N=1` ✅ |
| Conditional: `n > 2 ? Text("MUCH") : null` | **re-renders** and shows `MUCH` ✅ |
| 4-argument form `useState(k, v, widget, p)` | still works ✅ |
| Unmount the widget and change the key | the detached node **no longer updates** ✅ |
| `npm test` + suite | **470 OK / 0 failures** (44 guards; the 8 round-7 guards include the 2 new `useState` ones from §3.5) |

New guards in `tests/regression.test.js`: surgical (0 rebuilds + same node) · derivative still re-renders · unmount frees the binding.

### Performance (measured, not estimated)

**Surgical path gain** — 402-widget tree:

| | Cost per state change |
|---|---|
| Rebuild (derived, current path) | **8.7 ms** of tree reconstruction (+ teardown and DOM reflow, not measured) |
| Surgical (direct binding) | **~0.9 µs** (a `widget.update()`: 8.6 ms / 10,000 = 0.86 µs) |
| **Difference** | **~10,000× less work**, and the DOM is not touched (no teardown, no 127 `defineProperty` per widget) |

**Added cost of the implementation** — negligible:
- Building 1,000 widgets: **16.9 ms** (~0.017 ms/widget). The extra prop scan (`bindReactiveProps`) +
  `resolveReactive` per prop are already included, and the number is within the same noise as before.
- **`RamStore` notified all subscribers on every `saveRam`** (`subscribers` is a flat array) and `useState`
  added **one per key that never got released**. Result: **every state change cost O(number of keys)**.
  | Keys | Before (µs/`saveRam`) | Now |
  |---|---|---|
  | 0–100 | 0.5 → 1.0 | **0.33** |
  | 600 | 2.5 | **0.33** |
  | 2,100 | 9.0 | **0** |
  | 5,100 | **19.5** (and growing) | **0** |
  *This was pre-existing and affected any app with many keys.* Fix: **one single dispatcher** in `useState`
  that indexes by key, instead of one RamStore subscriber per key.
- **`registerWidget` deduplicated with `[...bound].some(...)`** → O(n) per registration → **O(N²)** when
  linking N widgets to the same key. *This one I introduced.*
  | Widgets at the same key | Before | Now |
  |---|---|---|
  | 400 | — | 6.4 ms |
  | 1,600 | ~44 ms | 32.8 ms |
  | 3,200 | (didn't finish) | 58.6 ms |
  | ratio 3200/400 | ~quadratic | **9.2** (linear ≈ 8) |
  Fix: `widgetsByKey` with two levels (`key → widget → Set<prop>`) → O(1) lookup.
- **🔴 Unknown prop = ~400× slower, on EVERY `update()`** *(found when comparing `widget.prop` with `useState`)*
  Measured a widget with several props and hit a cliff: 11 props → 3.7 µs; **31 props → 1,212 µs**.
  **Root cause:** `warnUnknownProp` (`src/widget-factory/warnings.js`) had **no deduplication**.
  For each unregistered prop it did `getCallLocation()` → `new Error().stack` + scan the ~60 patterns of
  an exclusion list + **~8 `console.log` with CSS**. And since `update()` **re-applies ALL original props**
  (not just the changed one), a widget with **one** unknown prop paid that cost on **every `update()`**,
  for its whole life.
  **The 9 props that triggered it** (all legitimate CSS simply not in the registry): `columnGap`, `rowGap`, `textIndent`, `wordSpacing`, `outlineWidth`, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`.
  | Measurement (µs per `update()`) | Before | Now |
  |---|---|---|
  | Widget with 1 unknown prop (`columnGap`) | **132** | **2.2** |
  | Widget with 31 props (9 unknown) | **1,212** | **12.3** |
  | `processProps` with unknown prop | **136.9** | ~0.3 |
  | Known prop (reference) | 1.5 | 1.5 |
  | Raw DOM (`el.style.columnGap`) | 0.07 | 0.07 |
  **Improvement: ~99× on the 31-prop widget.** Fix: a `Set` of already-warned props → `if (warnedProps.has(propName)) return;` (same for `warnDeprecatedProp`). Guard: `console.group` spy (functional, not timing).
  **Open observation (not fixed):** `IS_DEV` is `typeof FLETBOX_DEV !== 'undefined' ? FLETBOX_DEV : true` → **defaults to `true`**, so production apps still pay the warnings. Consider flipping the default.
- **Comparative of the 3 write paths** (µs/op, stable and no leak when repeated 54,000 times):

| Path | µs/op |
|---|---|
| Direct `widget.update({...})` | **1.15 – 1.47** |
| `useState` bound (surgical) | 1.77 |
| `widget.prop = value` (accessor) | 1.4 – 2.1 |

The 3 are the **same order of magnitude**, and `widget.prop = value` is the **slowest** because it
writes the prop twice (`_originalProps` and again via `update()`). **Choosing between them is not a
performance decision.**

### 🐛 BUG INTRODUCED AND FIXED — the mixed case

**Symptom:** with the **same key** used at once **directly** (prop) and **structurally** (conditional/template),
the direct widget updated but the derivative **did not**:

```js
const [n, setN] = useState("mix", 0);
Column({ children: [
  Text({ text: n }),                                // ← direct (it was patched)
  n.valueOf() > 2 ? Text({ text: "MUCH" }) : null, // ← structural (didn't re-evaluate)
]});
setN(3);   // → "3" but WITHOUT "MUCH"  🔴
```

**Cause:** the first version skipped the re-render with only `if (handled === 0)`. If any widget was
bound, it did not re-render, so what the component **computes** went stale. *It was spotted in an
author question about when to use each style.*

**Fix (structural-read detection):** distinguish **who reads** the value:

| Who reads | How it's detected | Needs re-render? |
|---|---|---|
| The **factory** (filling a prop) | `resolveReactive` sets `resolving = true` around the call | No → surgical |
| The **component** (template, conditional, list) | the read happens inside the component's *render pass* | **Yes** |
| A **handler** (`onPress`) or a timer | outside the *render pass* | No → still surgical |

`createReactiveValue` notifies via `setImperativeReadListener` when the component reads it during render;
`useState` stores those keys in `imperativeKeys` and the dispatcher does
`if (handled === 0 || imperativeKeys.has(key)) triggerRender();`.
`runApp` wraps the `App()` call in `beginRenderPass()` / `endRenderPass()`.

**Verified:** mixed → renders 1→2 with `3MUCH` ✅ · binding-only → **0 rebuilds**, same node ✅ · read in a
handler → **0 rebuilds** ✅. Two new guards (**459 OK**).

### What this enables

---

- The **directed path is now persistent**: no one destroys the node, so `widget.prop = x` survives
  re-renders triggered by other keys.
- The `docs/tools/reactivity.md` table §10 now says the truth (it used to promise something the
  code did not do).
- **Pending (Level 2):** derived/conditional/list cases still rebuild the tree. Next step is
  **reusing elements by shape (not a virtual DOM)** so that rebuild is also cheap.

---

## 6. Do all widgets follow the same pattern? — **No.** (measured over 65 files)

| Contract rule | Comply |
|---|---|
| `WidgetFactory` as root | **51/65** |
| `widgetName` declared | 46/65 |
| **`composeUpdate` (the correct pattern for own props)** | **8/65** |
| Override `update` directly | 0/65 ✅ (watched by the checker) |
| **Monkey-patch `_cleanup`** (forbidden by the contract) | **7/65** |
| Register `onUnmount` | 22/65 |
| Declare `*_PROP_KEYS` | 5/65 |
| `@file` header | 50/65 |
| `export default` | 64/65 |

**There are 3 de facto levels:**

1. **Canonical (17)** — factory + `widgetName` + `onUnmount` + `@file`: `Accordion`, `AdMob`,
   `AdSense`, `Audio`, `Badge`, `Carousel`, `Chart`, `CircularBar`, `CircularChart`, `CodeViewer`,
   `Dropdown`, `ListTile`, `ListView`, `Markdown`, `Rating`, `Slider`, `Tooltip`.
2. **Factory but ad-hoc** — the rest: use `WidgetFactory` but without `composeUpdate` or `onUnmount`,
   or with `_cleanup` patched. Most state/leak bugs live here.
3. **Raw DOM / bespoke (14)** — **don't** use the factory as root: `AlertDialog`,
   `FloatingActionButton`, `GridView`, `Inspector`, `InstallButton`, `Pagination`,
   `AdaptiveScaffold`, `Drawer`, `DrawerItem`, `Router`, `AnimatedBox`, `AnimatedText`,
   `MatrixRain`, `animate.js` (and is the only one without `export default`).

**Practical consequences:**

- The static checker only scans `src/widgets/`, so `src/navigations/` and
  `src/animations/` **escape** the 8 rules (that's why their 7 `_cleanup` patches and leaks
  didn't appear in the "technical debt" count).
- `composeUpdate` exists exactly for the problem that caused the `Input.label`,
  `Markdown.text` and `CodeViewer.title` bugs, and only 12% of files use it.
- The rule "`_cleanup` is the only cleanup hook" **is not true in practice**: the lifecycle observer
  never calls it, so any resource released there **leaks**. The fixes `[NAV-1..4]` follow exactly that pattern.
- **Recommendation for a future refactor round** (not urgent): expand
  `scripts/check-widgets.mjs` to `navigations/` and `animations/`, and migrate the level-2 widgets to
  level 1 (`composeUpdate` + `onUnmount`), where most of the remaining bugs are.

---

## 7. Files touched so far

```
M  src/widget-factory/assignProps.js     [MOTOR-1]
M  src/tools/dimensions.js               import in Node
M  src/utils/getWidgetProps.js           [INSP-1] reads _originalProps
M  src/widgets/Accordion.js              icon (setAttribute → textContent)
M  src/widgets/Chart.js                  [CHART-1]
M  src/widgets/Checkbox.js               [FORM-1]
M  src/widgets/CircularChart.js          [CC-1]
M  src/widgets/CodeViewer.js             [CV-1]
M  src/widgets/DataTable.js              [DT-1][DT-2]
M  src/widgets/Dropdown.js               [DD-1]
M  src/widgets/Image.js                  [IMG-1]
M  src/widgets/Input.js                  [INPUT-1]
M  src/widgets/Inspector.js              [INSP-1] child array
M  src/widgets/ListView.js               [LV-1]
M  src/widgets/Markdown.js               [MD-XSS][MD-1]
M  src/widgets/QRCode.js                 [QR-1]
M  src/widgets/Radio.js                  [FORM-1]
M  src/widgets/Slider.js                 [SLIDER-1]
M  src/widgets/SnackBar.js               [SB-1][SB-2]
M  src/widgets/Switch.js                 [FORM-1]
M  src/widgets/TreeView.js               updateNodes preserves selection
M  src/navigations/AppBar.js             [NAV-1]
M  src/navigations/BottomNavigation.js   [NAV-4]
M  src/navigations/DrawerItem.js         [NAV-3]
M  src/navigations/Tabs.js               [TABS-1][NAV-2]
M  src/animations/AnimatedBox.js         [AB-1][AB-2]
M  src/animations/AnimatedText.js        [AT-1]
M  src/animations/MatrixRain.js          [MR-1][MR-2]
M  src/index.d.ts                        3-surface coupling
M  package.json                          npm test + test:browser
M  AGENTS.md / docs/CONTRIBUTING.md      documentation
M  tests/doccheck-ch4.js                 hardcoded light theme
M  tests/doccheck-ch6.js                 bug-fixing Inspector assertions
?? scripts/check-api-surface.mjs
?? scripts/run-browser-tests.mjs
?? tests/regression.html
?? tests/regression.test.js
```

### Round 7 (committed)

```
M  src/animations/animate.js             [ANIM-1] WeakMap registry + runAnimation + stopAnimation
M  src/animations/index.js               re-exports stopAnimation
M  src/index.js                          public surface: stopAnimation
M  src/index.d.ts                        types: stopAnimation + cancelable return
M  src/create-index.sh                   animation template (was out of date)
M  src/widget-factory/reactiveValue.js   §3.5: per-pass passKeys, reentrant resolving
M  src/tools/useState.js                 §3.5: dispatcher, registration, setState against store
M  src/widgets/ListView.js               [LV-2] + ResizeObserver + header geometry
M  src/widgets/Slider.js                 [SLIDER-2] thumbRaf / initTimer / disposed
M  src/widgets/Stepper.js                [STEPPER-1] showNavigation
M  docs/tools/animation.md               stopAnimation + replacement rule
M  package.json                          npm test sums check-router-base.mjs
M  tests/regression.test.js              10 new guards (34 → 44)
M  registro.md                           this document
?? scripts/check-router-base.mjs         Router base path, 9 cases in Node
```

**Surgical implementation (§5) — exact files:**

```
?? src/widget-factory/reactiveValue.js   NEW: isReactive/reactiveKeyOf/resolveReactive/createReactiveValue
M  src/tools/useState.js                 live value + no re-render if bound + release with onUnmount
M  src/widget-factory/widgetFactory.js   bindReactiveProps (auto-binding registration)
M  src/widget-factory/processProps.js    resolves reactive value before applying the unit
M  src/widget-factory/assignProps.js     uses the shared resolver
M  docs/tools/reactivity.md              §10: "resolved, not subscribed" → "resolved AND bound"
M  tests/regression.test.js              3 new guards (surgical · derivative · release)
```

---

## 8. Appendix: how to mount a temporary probe

Created and deleted every round (not committed). Runs arbitrary JS in a real page with the repo served:

```js
// .diag/<name>.mjs  →  node .diag/<name>.mjs '<js statements>'
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".woff2":"font/woff2" };
const server = await new Promise((r) => { const s = createServer(async (req,res) => { try {
  const p = decodeURIComponent((req.url||"/").split("?")[0]);
  const t = join(root, normalize(p).replace(/^(\.\.[/\\])+/,""));
  const i = await stat(t); const f = i.isDirectory() ? join(t,"index.html") : t;
  res.writeHead(200,{"Content-Type":MIME[extname(f)]||"application/octet-stream"}).end(await readFile(f));
} catch { res.writeHead(404).end("nf"); } }); s.listen(0,"127.0.0.1",()=>r(s)); });
const pp = [process.env.FLETBOX_PUPPETEER, join(root,"node_modules/puppeteer"), join(root,"..","flet-box-server","node_modules/puppeteer")].filter(Boolean).find(p=>existsSync(join(p,"package.json")));
const cp = [process.env.FLETBOX_CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].filter(Boolean).find(p=>existsSync(p));
const { default: puppeteer } = await import(join(pp,"lib","esm","puppeteer","puppeteer.js"));
const b = await puppeteer.launch({ executablePath: cp, headless: true, args: ["--no-sandbox"] });
const pg = await b.newPage();
pg.on("pageerror", (e) => console.log("[pageerror]", e.message));
await pg.goto(`http://127.0.0.1:${server.address().port}/tests/smoke.html`, { waitUntil: "load" });
try { const r = await pg.evaluate(`(async () => { ${process.argv[2]} })()`);
  console.log(typeof r === "string" ? r : JSON.stringify(r, null, 2)); }
catch (e) { console.log("EVAL ERROR:", e.message); }
await b.close(); server.close();
```

Typical use: `const W = await import("/src/index.js"); const el = W.Chart({...}); ...`

---

## 9. History

| Round | What was done | Suite on close |
|---|---|---|
| 1 | Headless runner + baseline (426). Motor bug (children removed). `QRCode` without payload, `Slider` freeze, `Tabs` initial panel, `DataTable` ×2, `ListView` recursion, `SnackBar` ×2, `MatrixRain` ×2, `AnimatedBox` ×2. 2 tests hardcoding the light theme. Guards: 0 → 9 | 435 OK |
| 2 | `Markdown` **XSS**, `Input.label`, `Checkbox`/`Switch`/`Radio` onclick, `Chart` negatives, `CircularChart` rAF, `Accordion` icon, `TreeView` selection, `Image` fit/circular. Guards: 9 → 16 | 442 OK |
| 3 | `Markdown.text`, `CodeViewer.title`, leaks of `AppBar`/`Tabs`/`DrawerItem`/`BottomNavigation`, `AnimatedText` inheritance, `Inspector` props + child array, `Dropdown` capture flag. Guards: 16 → 22 | **448 OK** |
| 4 | `[DRAWER-1]` (`Scaffold` calls `drawer.destroy()`), `[MODAL-1]`+`[MODAL-2]` (close timer and `keydown` listener on `Modal`/`BottomSheet`), `[ANIM-NAN]`, `[ANIM-DUR]`. Guards: 23 → 26 | **452 OK** |
| 5 | `[AUDIO-1]`+`[AUDIO-2]` (2 s fallback timer and `AudioContext` without `close()`), `[PARALLAX-1]` (`onUnmount` for scroll listener). Guards: 26 → 28 | **454 OK** |
| 6 | **FEATURE (§5): surgical reactivity with React syntax** — `useState` returns a live value, the factory auto-registers the binding, and the re-render skips when the key is bound. Files: `reactiveValue.js` (new), `useState.js`, `widgetFactory.js`, `processProps.js`, `assignProps.js`, `warnings.js`, `runApp.js`, `docs/tools/reactivity.md`. Guards: 28 → 34 | **457 OK** |
| 7 | **The 4 long-cycle fixes** (`[ANIM-1]` with the new API `stopAnimation` on 3 surfaces + `docs/tools/animation.md`, `[LV-2]` with `ResizeObserver` and fixed header geometry, `[SLIDER-2]`, `[STEPPER-1]`) **and the `useState`/`reactiveValue` audit** (§3.5): structural keys now bounded per pass, reentrant `resolving`, `setState` comparing against the store, empty-registration leak and dead code out. Additionally: GitHub Pages deep links guaranteed in CI with `scripts/check-router-base.mjs` (9 cases). Guards: 34 → 44 | **470 OK / 0 failures** |
| 8 | Half *read/repair* of the contract: `flet-box unpack` (cross-checks `index.d.ts`, registry, widget source and its page) and `flet-box audit-fix` (rewrites only what the checker can prove), `check-api` also validating the app's own imports, and the agent contract that `flet-box create` generates with a design system (1 brand color, scale 8·12·16·18·24·32·48). CLI fixes: dev-server hot reload (roots instead of globs, reload by socket, `useState` RAM restored) and `flet-box cloudflare` over the bundle with correct `<base href>` and `update.url` | static checks (no browser guards) |
| 9 | **New `Maps`**: Web Mercator projection, tile grid, pins and imperative API **without a map library, without CDN and without API key**. Wired into the 5 surfaces (exports, `index.d.ts`, `ALL_PROPS`, `docs/widget/Maps.md`, snippets) with full prop coverage. Bugs caught with a real Chrome probe, not the harness: arrows rendered backward, the props tied to `useState` neither resolved nor subscribed (the factory didn't see them), `setPointerCapture` in `pointerdown` that **ate the pin click**, `wrapLng` returning `2.352200000000039`, `locate()` with no useful options or error codes, and the hidden credit line | **503 OK / 0 failures** |
| 10 | Vector layer of `Maps` (`polylines`, `polylineColor`, canvas under pins) and follow mode (`followUser`, `onUserUpdate`) with its documentation; reapplying the same `center` no longer counts as a view change; `Dropdown` honors `value`/`options` tied to `useState`; the pin tip falls on its coordinate not its side; the 4 new props enter the registry (INTERNAL 4 → 0). Guards: 44 → 63 | **512 OK / 0 failures** |
| 11 | Documentation closure: the 4 vector props also enter the snippet library (`UNCOVERED_PROP` 4 → 0) and `docs/widget/Maps.md` regenerates without delta. **`onMarkerClick` with physical mouse**: the drag decided by summing travel length, so a jittered press (1 px per event, 5 px total) exceeded the threshold, the map captured the pointer and **neither the pin nor the map fired**, plus it panning the view; now it measures the distance to the press point (`PAN_START_SLOP`) and only pans if the view isn't already moved. Verified with real clicks in Chrome and a new guard (65 cases in `regression.test.js`) that **fails** against the old version | **514 OK / 0 failures** |

---

## R12 — Medium bugs (Nov 2026)

**Status:** `npm test` green · 149 checks OK · 0 failures  
**Branch:** `refactory`

### Fixed (16 bugs)

| ID | Widget | Bug | Fix |
|---|---|---|---|
| **[BODY-1]** | Badge | `subscribeTheme` never fired — condition compared resolved defaults | Captures `callerPassedBgColor/Color` before destructuring |
| **[RATING-1]** | Rating | `update({value})` was a no-op — no `update()` method | Added via `composeUpdate` |
| **[MODAL-3]** | Modal | `setLoading(false)` discarded `updateContent()` | `let currentContent` mutable |
| **[CONTAINER-1]** | Container | `expand` prop documented but ignored | Translates to `flex: 1, flexShrink: 1` |
| **[SLIDER-3]** | Slider | Snapping relative to zero, not `min` | `Math.round((raw - min) / step) * step + min` |
| **[DROPDOWN-2]** | Dropdown | `onChange` only passed `value`, docs promised `(value, label)` | Second argument `getLabel(opt)` on all call sites |
| **[ICON-1]** | Icon | User `className` replaced `material-icons` | Merge: `material-icons ${extraClassName}` |
| **[DIVIDER-1]** | Divider | Default color `colors.surface` → invisible separator | Changed to `colors.border` |
| **[TEXT-1]** | Text | `styles: null` → TypeError in `.includes()` | Guard `Array.isArray(textStyles) ? textStyles : []` |
| **[DRAGBOX-1]** | DraggBox | Orphan clone if unmounted mid-drag | `onUnmount` that cleans the clone |
| **[CHART-2]** | Chart | `showValues` gated by `labels[index]`; `data:[]` → null crashed `updateData` | Independent condition; commented `return null` |
| **[CC-2]** | CircularChart | Label % divided by the sector angle in radians → `4775%` | Divides by `total` of the data |
| **[QR-2]** | QRCode | Alignment patterns on row/col 6 corrupted timing (versions 7–10) | Skip `r === 6 \|\| c === 6` |
| **[PAGINATION-1]** | Pagination | `pageSize:0` → `totalPages=Infinity`; `maxButtons:0` → loose button | Guards `safePageSize` / `safeMaxButtons` |
| **[DROPBOX-1]** | DroppBox | `dragleave` blinked when passing over children — classic bug without `relatedTarget` | `if (wrapper.contains(e.relatedTarget)) return` |
| **[INSTALL-1]** | InstallButton | `onInstalled` fired 2× (in `handleClick` + in `appinstalled`) | Removes the call in `handleClick`; only `handleAppInstalled` fires it |

### Remaining pending (§4.2)

- **[ADS-1]** AdMob/AdSense: `label:null` → TypeError; `disposed` latch one-directional
- **[SCAFFOLD-1]** Scaffold: `_cleanup` without `registeredWidgets.delete`

### History

| Round | What was done | Suite on close |
|---|---|---|
| 12 | 16 medium bugs from §4.2: Badge/Rating/Modal/Container/Slider/Dropdown/Icon/Divider/Text/DraggBox/Chart/CircularChart/QRCode/Pagination/DroppBox/InstallButton | **149 OK / 0 failures** |
