# Reactivity in FletBox

## Overview

Reactivity in FletBox means **a widget changes when something else changes** — a state value, the theme, the route, or a prop you assign at runtime. Unlike a Virtual DOM that diff shapes, FletBox targets the real DOM: each mechanism below updates an actual element in place.

This page is the **catalogue** of every reactivity path the framework ships. There is no single magic system; there are complementary layers, from the in-memory store up to per-widget DOM accessors.

## The catalogue at a glance

| # | Mechanism | Produced by | Scope of the update |
| --- | --- | --- | --- |
| 1 | Key-based shared state | `useState(key, value)` | Notifies every subscriber for the key, then the app |
| 2 | Low-level store | `subscribeRam` / `saveRam` | Any code subscribed to RamStore keys |
| 3 | Registered-widget updates | `useState(key, value, widget, propName)` | A single widget prop |
| 4 | Reactive property setters | `widget.prop = value` | A single widget, no global render |
| 5 | Imperative updates | `widget.update(props)` | One widget's merged props |
| 6 | Live handles | `ref()` | The bound widget (methods + props) |
| 7 | Side-effect watchers | `useWatchState(key, cb)` | A callback, no widget |
| 8 | Theme reactivity | `subscribeTheme(cb)` / `watchSystemTheme()` | Theme subscribers |
| 9 | Router reactivity | `subscribe(cb)` (Router) | Route subscribers (Scaffold, nav bars) |
| 10 | Reactive prop values | `_isReactive` objects/functions | Resolved at apply time |

## 1. Key-based shared state — `useState`

The public state hook. Values live in the in-memory store keyed by a string and survive re-renders.

```javascript
const [count, setCount, subscribe] = useState("counter", 0);
setCount((previous) => previous + 1);
```

`setState` saves to RamStore, which notifies every `useState` subscriber for that key, pushes new values to registered widgets, and schedules a (debounced) app render. Read the full rules in [State, memo & refs](state.md) and the [State guide](../guides/state.md).

## 2. The low-level store — `RamStore`

The raw reactive map behind `useState`. You can talk to it directly when you want one store shared by several subsystems.

```javascript
import { saveRam, getRam, subscribeRam } from "flet-box";

subscribeRam((key, newValue, oldValue) => {
  if (key === "user") renderProfile(newValue);
});
saveRam("user", { name: "Ada" });
```

`saveRam`, `updateRam`, and `deleteRam` all notify subscribers with `(key, newValue, oldValue)`; `clearAllRam` notifies with `null`s.

## 3. Registered-widget updates — `useState(key, value, widget, propName)`

The optional `widget` and `propName` arguments register a specific widget so a state change pushes the new value straight into it via `widget.update({ [propName]: newValue })` — the machinery that powers targeted updates.

```javascript
const label = Text({ text: "waiting…" });
const [status, setStatus] = useState("status", "idle", label, "text");

setStatus("done"); // calls label.update({ text: "done" })
```

Note: today the app also schedules its global render as part of the same flow.

## 4. Reactive property setters — `widget.prop = value`

Every style, spacing, colour, typography, and text prop installed by the widget factory becomes a live accessor: reading `widget.prop` returns the current value, assigning calls `widget.update({ prop })` and patches **that element only**. No app render, no subscribers involved.

```javascript
header.text = "New title";        // element.textContent updates in place
panel.update({ bgColor: "#e11d48" });
```

Two protections, by design:

- `value` is never shadowed on form elements so the browser keeps live input state (use `setValue` or `widget.value` on inputs).
- `width` / `height` are not shadowed on replaced elements (`img`, `canvas`, `video`, `iframe`, `embed`, `object`, `source`) to preserve their native intrinsic-size behaviour.

## 5. Imperative updates — `widget.update(props)`

The factory-level update method on every widget. It merges the new props into the stored props and re-applies styles, attributes, events, children, and effects through the same pipeline used at construction. A recursion guard (`MAX_UPDATE_DEPTH`) prevents runaway loops, and `child` / `children` are normalised so only one wins.

```javascript
card.update({ padding: 24, borderRadius: 16 });
```

## 6. Live handles — `ref()`

A `ref` is a function bound to a widget's `ref` prop. The handle mirrors the widget's methods and property accessors, so you can read and write live:

```javascript
const label = ref();
Text({ text: "Hi", ref: label });

label.update({ text: "Saved!" }); // same as widget.update
label.text = "Also works";        // forwarded to the widget
```

## 7. Side-effect watchers — `useWatchState`

Like `useState`'s `subscribe`, but for side effects that should not touch widgets. Returns an unsubscribe function.

```javascript
const unsubscribe = useWatchState("counter", (newValue) => {
  console.log("Counter hit", newValue);
});
```

## 8. Theme reactivity — `subscribeTheme`

Theme changes re-render subscribers. `runApp` subscribes itself so the whole app recolors on `setTheme` / `toggleTheme`, and some widgets (`ListTile`, `Rating`, `Badge`) subscribe individually to stay themed. `watchSystemTheme()` follows OS light/dark preference.

```javascript
const unsubscribeTheme = subscribeTheme((palette) => {
  root.style.backgroundColor = palette.background;
});
```

## 9. Router reactivity — `subscribe`

The router notifies subscribers on navigation. Layout shells and navigation widgets (`Scaffold`, `BottomNavigation`, `DrawerItem`) subscribe so highlighting and route content stay in sync; they unsubscribe automatically when removed from the DOM.

```javascript
subscribe((route, params, query) => setBreadcrumb(route.path));
```

## 10. Reactive prop values — resolved **and bound when passed directly**

A prop value can be a function or object flagged as reactive (`_isReactive`). The
factory resolves it to its current value when the prop is applied — and when the
value carries a state key (what `useState` returns), the factory **binds the widget
to that key automatically**.

```javascript
const [color, setColor] = useState("color", "red");

const box = Container({ bgColor: color });   // ← the binding is created here
setColor("blue");                            // ← only `box` is patched
```

A directly-passed reactive prop gives you a **surgical** update: the change patches
that one widget. The app does **not** re-render — not even once — and the DOM node
is reused, so `widget.prop = value` writes made earlier are not thrown away.

The binding is released automatically when the widget is removed (`onUnmount`), so
detached widgets stop receiving updates.

### When it falls back to the app render

A reactive value that is **computed** before it reaches a prop has no prop to bind:

```javascript
Text({ text: `N=${count}` });          // resolved to a plain string at build time
count > 3 ? Text({ text: "mucho" }) : null;   // the value drives *structure*
items.map((i) => Row({ child: Text({ text: i }) }));
```

Here the value is only read inside the component function, so the only way to
reflect a change is to re-run the app. FletBox detects this per key: **if no widget
is bound to the key, it re-renders the app; if widgets are bound, it patches them
and skips the app render.** Both styles work side by side in the same component.

## Widget-owned reactivity

Beyond the generic layer, many widgets expose their own imperative APIs and some are reactive setters themselves (`Slider.value`, `Accordion.expanded`, `Dropdown.options`). Each widget page lists them under **Instance methods**. These follow the same rule: they call `update(...)` internally on that widget.

## Lifecycle containment

Every subscriber API returns an unsubscribe function, and widget registration is automatically cleaned up when a widget is destroyed (`_cleanup`) or pruned by the MutationObserver. `runApp`'s teardown sweeps the whole tree so re-renders do not leak listeners, timers, or observers.

## Which one should you use?

| You want to… | Use | Cost |
| --- | --- | --- |
| Update ONE widget from a state value, without touching the app | `useState` + pass the value straight into a prop (`Container({ bgColor: color })`) | surgical — 0 app renders |
| Re-render whatever reads the key inside the component function | `useState` + `setState` (the value is computed, not passed) | one app render |
| Update one widget without state at all | `widget.prop = value`, `widget.update(props)`, `ref().update` | surgical — 0 app renders |
| React to any RamStore change | `subscribeRam` | surgical |
| Run a side effect on a key | `useWatchState` / `subscribe` | none |
| Follow the theme or the route | `subscribeTheme` / router `subscribe` | theme re-renders the app |
| Update a widget's whole prop set | `widget.update(props)` | surgical |

## Related pages

- [State, memo & refs](state.md) — the `useState` / `ref` / `memo` reference (previous chapter).
- [State guide](../guides/state.md) — full `useState` semantics for app state.
- [Async, ids & logging](async-ids-log.md) — next chapter.
- [Themes](theme.md) — theme tokens and theme control.

---

## Continue reading

- **Previous:** [State, memo & refs](state.md)
- **Next:** [Async, ids & logging](async-ids-log.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (4.5 of 12).