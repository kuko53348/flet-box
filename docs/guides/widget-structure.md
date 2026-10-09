# Widget structure: one shape for every widget

Every widget in FletBox is a plain function that returns an `HTMLElement`, built
on top of the single rendering engine: [`src/widget-factory/`](../../src/widget-factory/).
This page is the **canonical structure** all widgets follow — existing and future —
so the library stays modular, predictable, and easy to review.

Reference implementation: [`src/widgets/QRCode.js`](../../src/widgets/QRCode.js).

## The shape

```javascript
/**
 * @file MyWidget.js
 * @description One paragraph: what the widget renders and how it behaves.
 */

import { WidgetFactory } from "../widget-factory/index.js";
// import shared helpers (theme, composeUpdate, ...) — never a second engine.

// ---------------------------------------------------------------------------
// Module-level constants and pure helpers (no DOM, no side effects)
// ---------------------------------------------------------------------------

const WIDGET_PROP_KEYS = ["value", "onPress", /* ... */];

const normalize = (value) => /* pure transform */;

// ---------------------------------------------------------------------------
// Widget
// ---------------------------------------------------------------------------

/**
 * JSDoc for every prop, its type and default.
 * @returns {HTMLElement}
 */
export const MyWidget = (props) => {
  // 1. Destructure with defaults; keep the rest for the factory.
  const { value = "", onPress, size = 200, ...rest } = props;

  // 2. Early guards. Never leave a half-built element.
  if (!value) return WidgetFactory({ widgetName: "MyWidget", ...rest });

  // 3. Closure state / refs (private, mutable).
  let currentValue = value;
  let ref = null;

  // 4. Exactly ONE factory root.
  const container = WidgetFactory({
    widgetName: "MyWidget",
    ...defaults,
    ...rest,
  });

  // 5. Children via the factory (`child`/`children`) or `appendChild`.
  //    Raw `createElement` only for what the factory cannot express (canvas...).

  // 6. Public, reactive surface. Compose — never overwrite — `container.update`.
  container.setValue = (v) => { currentValue = v; render(); };
  container.getValue = () => currentValue;

  // 7. Resources: every listener/timer/rAF/observer/subscription goes through
  //    onUnmount, and the disposer must be idempotent.
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    // removeEventListener / clearTimeout / disconnect ...
  };
  container.onUnmount(dispose);

  return container;
};

export default MyWidget;
```

## The rules

1. **One root, one engine.** A widget returns a single element created by
   `WidgetFactory`. Never hand-roll a parallel rendering path.
2. **Module scope is pure.** Constants and helpers at the top of the file do no
   DOM work and register no side effects.
3. **Props in, element out.** Destructure with defaults, forward `...rest` to the
   factory, guard early. A widget with no data returns a valid element (or a
   documented controller object — see below).
4. **`widgetName` labels the widget.** Pass `widgetName: "<Name>"` to the root
   factory call so `Inspector`, `printWidgetCode`, and navigation helpers see the
   real name instead of the capitalised HTML tag. (`name` is *not* reserved — it
   is a public prop of `Icon`/`Avatar`.)
5. **Compose `update`.** Keep widget state in the closure and route updates
   through [`composeUpdate()`](../../src/utils/composeUpdate.js). Overwriting
   `container.update` silently disables the factory's style/event reactivity.
6. **No ad-hoc global styles.** Scope injected CSS with
   `<style data-widget="<Name>">` or a per-instance adopted stylesheet
   (`markdown-scope-N` pattern) and remove it on unmount. Never inject an
   unscoped `<style>` tag into `document.head` yourself — `@keyframes` cannot be
   scoped, so the only sanctioned global injection is the shared, idempotent
   [`injectKeyframes()`](../../src/utils/styleInjector.js) helper.
7. **Portals clean up after themselves.** Widgets that append to
   `document.body` (dialogs, dropdowns, tooltips) must remove their node and
   close over the parent's lifecycle via `onUnmount`.
8. **`onUnmount` is the single cleanup hook.** Register disposers there; they can
   run from more than one teardown path, so make them idempotent. Do not
   monkey-patch `_cleanup`.
9. **Public API is additive.** Expose behavior through named methods
   (`updateValue`, `getValue`, ...) and reactive accessors. Never mutate
   `container.update` or `container._cleanup`.
10. **Complete the three surfaces.** Runtime file, export from
    `src/widgets/index.js` **and** `src/index.js`, types in `src/index.d.ts`,
    plus a doc page in `docs/widget/<Name>.md` with `basic`/`normal`/`full`
    examples.
11. **Flat, aliased CSS props — never `style:`.** FletBox has no `style` object:
    pass CSS props directly (`backgroundColor`, `padding`, `flexDirection`,
    `whiteSpace`, …) with aliases resolved by the factory. `style: { ... }` is
    rejected with a warning (`processProps`), so it never silently half-applies.

## Controller widgets

A few widgets manage transient UI that lives outside the tree (modals, sheets,
snackbars). They may return a **controller object** instead of an element, but
the exception is explicit and typed:

| Widget | Returns |
| --- | --- |
| `AlertDialog` | `{ open, close, modal }` |
| `SnackBar` | `{ close, show, getElement }` |
| `BottomSheet` | `{ open, close, toggle, destroy }` |
| `Modal` | controller instance (`open`/`close`/`updateContent`) |

Everything else returns an `HTMLElement`.

## Adding a widget — checklist

1. Copy the shape above into `src/widgets/<Name>.js`.
2. Implement props with defaults and JSDoc; forward `...rest`.
3. Pass `widgetName: "<Name>"` to the root factory call.
4. Register every resource with an idempotent `onUnmount` disposer.
5. Export from `src/widgets/index.js` and `src/index.js`.
6. Add types and props to `src/index.d.ts` (regenerate docs with
   `python3 scripts/generate_widget_docs.py`).
7. Add `docs/widget/<Name>.md` with `basic`/`normal`/`full` examples.
8. Verify:
   ```bash
   node --check src/widgets/<Name>.js
   node scripts/check-widgets.mjs          # static contract (no new violations)
   npm run dev                             # then open the test harnesses:
   #   /tests/widget-contract.html  — runtime contract
   #   /tests/smoke.html            — instantiates every widget
   #   /tests/widget-factory.html   — frozen engine regression suite
   ```

## Tooling

- `node scripts/check-widgets.mjs` — static contract checker. It compares the
  code against `scripts/widget-contract-baseline.json`; the baseline records
  pre-existing debt and must shrink as widgets are refactored. Adding a widget
  to the baseline is never the fix.
- `node scripts/check-widgets.mjs --write-baseline` — re-snapshot after a batch
  of fixes (only to *remove* entries in practice).
- `/tests/widget-contract.html` — runtime contract: every widget instantiates,
  returns an element (or a documented controller), exposes `update()`, and
  reports its real `_widgetName`.
