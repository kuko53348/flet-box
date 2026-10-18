# Reactivity in FletBox

## Overview

Reactivity in FletBox means **a widget changes when something else changes** — a state
value, the theme, the route, or a prop you assign at runtime. There is no Virtual DOM
layer: each mechanism below writes to a real element in place, and the most efficient one
updates a single widget without re-running any component code.

This page is the **catalogue** of every reactivity path the framework ships. There is no single magic system; there are complementary layers, from the in-memory store up to per-widget DOM accessors.

## The catalogue at a glance

| # | Mechanism | Produced by | Scope of the update |
| --- | --- | --- | --- |
| 1 | Key-based shared state | `useState(key, value)` | Bound widgets patched; app render only when needed |
| 2 | Low-level store | `subscribeRam` / `saveRam` | Any code subscribed to RamStore keys |
| 3 | Registered-widget updates | `useState(key, value, widget, propName)` | A single widget prop |
| 4 | Reactive property setters | `widget.prop = value` | A single widget, no global render |
| 5 | Imperative updates | `widget.update(props)` | One widget's merged props |
| 6 | Live handles | `ref()` | The bound widget (methods + props) |
| 7 | Side-effect watchers | `useWatchState(key, cb)` | A callback, no widget |
| 8 | Theme reactivity | `subscribeTheme(cb)` / `watchSystemTheme()` | Theme subscribers |
| 9 | Router reactivity | `subscribe(cb)` (Router) | Route subscribers (Scaffold, nav bars) |
| 10 | Reactive prop values | `_isReactive` objects/functions | Resolved at apply time **and bound to the key** |

## 1. Key-based shared state — `useState`

The public state hook. Values live in the in-memory store keyed by a string and survive re-renders.

```javascript
const [count, setCount, subscribe] = useState("counter", 0);
setCount((previous) => previous + 1);
```

`setState` writes to RamStore. One shared dispatcher then, in order: patches every
widget bound to that key, runs the `subscribe` / `useWatchState` callbacks for the key,
and **only if necessary** schedules an app render (debounced, so several changes made in
the same tick cost one render). See **The surgical decision**, further down this page.

Read the full rules in [State, memo & refs](state.md) and the [State guide](../guides/state.md).

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

Because the widget is now bound to the key, this form is surgical on its own: `setStatus`
patches `label` and skips the app render, unless the component also *computed* with that
key during its last render (see **The surgical decision**). Prefer passing the state value
straight into a prop — mechanism 10 binds it for you — and use this signature when the
widget already exists.

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

### The surgical decision

The value returned by `useState` is a **live function**. When it reaches a prop, the
factory resolves it *and* records the `(key → widget → prop)` link, so a later change
patches that widget instead of re-running anything. When it is consumed inside the
component, the string or boolean that reaches the prop carries no key left to bind, so the
only way to reflect a change is to re-run the app.

The dispatcher decides **per key, per change**, from exactly two facts:

```javascript
if (handled === 0 || isStructuralRead(changedKey)) triggerRender();
```

- `handled` — how many widgets were patched for this key (mechanisms 3 and 10).
- `isStructuralRead(key)` — whether the component read that value *while rendering*,
  during the last app render pass.

So the app re-renders when the key has no bound widget, or when the component computed
with it. A key can be both: then the widget **is** patched *and* the app re-renders, and
the patch is wasted work on a node the rebuild replaces.

What counts as a structural read:

| Code inside the component | Kind of read | Update |
| --- | --- | --- |
| `Text({ text: count })` | value passed as a prop | surgical |
| `Container({ bgColor: color })` | value passed as a prop | surgical |
| `Text({ text: "Count: " + count })` | concatenation | app render |
| `count > 5 ? A : B` | comparison in the component | app render |
| `getState("items").map(…)` | list shape | app render |
| `onPress: () => setCount(count + 1)` | inside an event handler | surgical |
| `onCount((n) => …)` | inside a subscriber | surgical |

Two properties of that set are worth knowing:

- **It is rebuilt on every render pass.** A structural read that only happens under a
  condition stops costing app renders as soon as the component stops doing it.
- **Changes coalesce.** The render is scheduled with `setTimeout(…, 0)`, so three
  `setCount` calls in one tick cost **one** app render.

Measured on a `Column` whose `Text` children depend on one key:

| component | changes | app renders | `Text` built | node reused |
| --- | --- | --- | --- | --- |
| only `Text({ text: count })` | 3 in one tick | **0** | 1 | yes |
| Concatenation + `text: count` + ternary | 3 in one tick | 1 | 2 | no |
| Only the concatenation | 2 in separate ticks | 2 | 3 | no |

The first row is the surgical path: no component code runs, `count`'s single bound widget
gets `update({ text: … })`. The last row shows the coalescing limit — a render per tick, not
per change.

### Keeping derived text surgical

A derived string does not need an app render if you derive it in the subscriber instead of
in the template:

```javascript
const App = () => {
  const [count, setCount, onCount] = useState("counter", 0);
  const label = Text({ text: "Count: 0" });
  const badge = Text({ text: "poco" });

  onCount((n) => {
    label.update({ text: `Count: ${n}` });
    badge.update({ text: n > 5 ? "MUCHO" : "poco" });
  });

  return Column({ children: [label, badge] });
};
```

`onCount` runs outside a render pass, so its reads are not structural and the key stays
surgical — measured at **0 app renders** for three changes. This is the same reason reading
state inside `onPress` is free.

### What the app render does *not* do

There is no Virtual DOM and no reconciliation: an app render **re-runs the component and
creates new elements**, and the previous ones are dropped. Earlier `widget.prop = value`
writes and any internal state of the replaced subtree are lost (form fields keep what the
user typed, because `value` is never shadowed). A key read structurally is therefore the
one case where the framework does more work than it needs to — which is why the
recommendation is always the same: pass state values straight into props.

## Widget-owned reactivity

Beyond the generic layer, many widgets expose their own imperative APIs and some are reactive setters themselves (`Slider.value`, `Accordion.expanded`, `Dropdown.options`). Each widget page lists them under **Instance methods**. These follow the same rule: they call `update(...)` internally on that widget.

## Lifecycle containment

Every subscriber API returns an unsubscribe function. State bindings are released through
the widget's `onUnmount` hook — fired on both teardown paths — so a detached widget stops
receiving patches and its key entry is dropped once no widget is left bound to it.
`runApp`'s teardown sweeps the whole tree so re-renders do not leak listeners, timers, or
observers.

Note that `_cleanup` is **not** a lifecycle hook the framework calls; it is legacy. Resource
release belongs in `onUnmount`.

## Which one should you use?

| You want to… | Use | Cost |
| --- | --- | --- |
| Update ONE widget from a state value, without touching the app | `useState` + pass the value straight into a prop (`Container({ bgColor: color })`) | surgical — 0 app renders |
| Update ONE widget that already exists | `useState(key, value, widget, propName)` | surgical — 0 app renders |
| Show derived text (`Count: 3`) without an app render | derive inside `subscribe` / `onCount` and call `widget.update(…)` | surgical — 0 app renders |
| Change the structure of the tree from state | `useState` + read it in the component (ternary, `.map()`) | one app render per tick |
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