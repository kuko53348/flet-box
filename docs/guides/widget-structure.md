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
12. **A shared helper has one home.** The first time a helper is written it is
    local; the second time it is a module both callers import. Two copies pass
    every test on the day they are written and diverge on the day one is fixed —
    so the home is named and the gate enforces it:

    | Behaviour | Home |
    | --- | --- |
    | Escaping text for HTML | [`src/helpers/html.js`](../../src/helpers/html.js) |
    | The four-side box shorthand | [`src/helpers/boxEdges.js`](../../src/helpers/boxEdges.js), behind `margin()`/`padding()` |
    | Injecting `@keyframes`, naming one | [`src/utils/styleInjector.js`](../../src/utils/styleInjector.js) |
    | A number that becomes a length | [`src/utils/units.js`](../../src/utils/units.js) |

    **`src/helpers/` is the folder for reusable code, and a module there imports
    nothing at all** — no widget, no theme, no engine service. That is what makes
    it safe to import from anywhere: `html.js` has no dependencies on purpose,
    because importing the Markdown parser from a widget would pull six widgets
    into that widget's graph. A helper that needs another module is a service and
    belongs in `utils/`. `node scripts/check-shared-helpers.mjs` fails on a second
    definition, an `@keyframes` rule written outside the injector, a helper that
    grew an import, or a caller that stopped importing the home.
13. **Only the code the widget needs.** No prop nobody passes, no option kept
    "for later", no abstraction with a single caller, no wrapper that only
    forwards its arguments — that last one is code to delete, not to keep. The
    second caller is when a helper appears (rule 12), not before. Three lines
    repeated once reads better than a premature module; the same three lines
    repeated three times do not.

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
- `node scripts/check-shared-helpers.mjs` — the single-home contract from rule
  12: one definition per shared helper, the module named in the rule, and every
  caller importing it. `--root <dir>` checks another checkout, which is how each
  of its five rules was proven to fail when the rule is broken.
- `/tests/widget-contract.html` — runtime contract: every widget instantiates,
  returns an element (or a documented controller), exposes `update()`, and
  reports its real `_widgetName`.
