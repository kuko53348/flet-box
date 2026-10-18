# State with `useState`

FletBox state lets widgets share values and update the interface when those values change.

## The simple idea

A state value is a named value stored by a key:

```javascript
const [count, setCount] = useState("counter", 0);
```

- `"counter"` is the shared key.
- `0` is the initial value.
- `count` is the current reactive value.
- `setCount` changes the value.

## Small counter example

```javascript
import { Button, Column, Text, useState } from "flet-box";

const Counter = () => {
  const [count, setCount] = useState("counter", 0);

  return Column({
    gap: 12,
    children: [
      Text({ text: `Count: ${count}` }),   // derived text → app render (see below)
      Button({
        text: "Add one",
        onPress: () => setCount((previous) => previous + 1),
      }),
    ],
  });
};
```

When `setCount` runs, FletBox writes the new value to the store and then decides how much
of the UI has to change. That decision is the subject of the next section, and it is worth
getting right: one style of using the value updates a single element, the other re-runs
your whole component.

## Surgical updates vs. app renders

A state value is a **live** value. If you hand it to a prop, the framework remembers that
link and, on change, patches only that widget:

```javascript
const [count, setCount] = useState("counter", 0);

Text({ text: count });                 // surgical: this element is patched
Container({ bgColor: theme });         // surgical
```

If you *compute with it inside the component*, the value is consumed before it ever
reaches a prop, so there is nothing left to patch — the only way to reflect the change is
to re-run the app:

```javascript
Text({ text: `Count: ${count}` });     // app render
Text({ text: count > 5 ? "MUCHO" : "poco" });   // app render
items.map((item) => Row({ child: Text({ text: item }) }));  // app render
```

Measured on the same screen, three changes to one key:

| How the key is used | App re-renders | Widgets patched |
| --- | --- | --- |
| `Text({ text: count })` only | **0** | the one `Text` |
| mixed with a template literal | 1 | patched, then replaced |
| template literal only | 1 | — |

Two details that make this easier to live with:

- **Reads outside the render are free.** Reading the value inside `onPress`, or inside a
  `subscribe` callback, does **not** force an app render — only reads that happen while the
  component is building its tree do.
- **Renders coalesce.** Several `setState` calls in the same tick produce **one** app
  render, not one per call.

If you need derived text but want to stay surgical, derive it in the subscriber:

```javascript
const App = () => {
  const [count, setCount, onCount] = useState("counter", 0);
  const label = Text({ text: "Count: 0" });

  onCount((n) => label.update({ text: `Count: ${n}` }));

  return Column({ children: [label] });
};
```

The app render has no Virtual DOM diff behind it: it re-runs the component and **creates
new elements**, discarding the old ones. That is why passing the value straight into a prop
is worth the small change in style. See
[Reactivity in FletBox](../tools/reactivity.md) for the full decision rule.

## Set a direct value

```javascript
const [theme, setTheme] = useState("theme", "light");

setTheme("dark");
```

## Use an updater function

Use an updater when the new value depends on the previous value:

```javascript
setCount((previous) => previous + 1);
```

This is useful for counters, arrays, and objects.

## Store an object

```javascript
const [user, setUser] = useState("user", {
  name: "Ada",
  online: false,
});

setUser((previous) => ({
  ...previous,
  online: true,
}));
```

Create a new object or array when updating nested data. This makes the change clear and prevents accidental mutation.

## Store an array

```javascript
const [items, setItems] = useState("items", []);

setItems((previous) => [
  ...previous,
  { id: Date.now(), title: "New item" },
]);
```

## Shared state between widgets

Two widgets using the same key can read and update the same stored value:

```javascript
const Status = () => {
  const [enabled] = useState("feature-enabled", false);
  return Text({ text: enabled ? "Enabled" : "Disabled" });
};

const ToggleFeature = () => {
  const [enabled, setEnabled] = useState("feature-enabled", false);
  return Button({
    text: enabled ? "Turn off" : "Turn on",
    onPress: () => setEnabled((value) => !value),
  });
};
```

Use descriptive, unique keys. A key is global within the state store, so reusing a key accidentally can connect unrelated widgets.

## Watch a state key

`useWatchState` subscribes to changes without creating a state value:

```javascript
import { useWatchState } from "flet-box";

const stopWatching = useWatchState("counter", (newValue, oldValue) => {
  console.log({ newValue, oldValue });
});

// Later:
stopWatching();
```

## Subscribe from `useState`

The current implementation returns a third value for subscriptions:

```javascript
const [value, setValue, subscribe] = useState("status", "idle");

const unsubscribe = subscribe((newValue, oldValue) => {
  console.log(newValue, oldValue);
});

// Later:
unsubscribe();
```

## State and widgets

Normally you do not register anything: pass the state value into a prop and the widget
factory binds it to the key for you, releasing the binding when the widget is removed.

```javascript
const [theme, setTheme] = useState("theme", "light");

const panel = Container({ bgColor: theme });  // bound automatically
setTheme("dark");                             // patches `panel` only
```

There is an explicit form for the case where the widget already exists and you want one of
its props driven by a key:

```javascript
const [label, setLabel] = useState(
  "button-label",
  "Save",
  button,
  "text",
);
```

Both push the new value through `widget.update({ prop: value })`, so the update touches one
element instead of rebuilding the screen.

## Reading the value

The value returned by `useState` behaves like the current state in most expressions —
`${count}` and `count + 1` work — but under the hood it is a live function, and that shows
up in two places:

```javascript
typeof count;          // "function", not "number"
count.valueOf();       // the current value, explicitly
```

For objects and arrays, **property access does not go through the state**:

```javascript
const [user, setUser] = useState("user", { name: "Ada", online: false });

user.name;             // ✗ "live" — the function's own name, not the state's
user.online;           // ✗ undefined
user().name;           // ✓ "Ada"  — call it, or pass it straight into a prop
```

So for object state, prefer letting a widget resolve it (pass the value itself as the prop,
not a field of it) or read it by calling the value inside a handler, where reads are free.

## Persistence during the session

FletBox stores state through its RAM store. The value is available by key while the application is running:

```javascript
import { saveRam, getRam } from "flet-box";

saveRam("language", "en");
const language = getRam("language");
```

Use the storage services when you need browser persistence or a different lifetime.

## Important rules

- Call `useState` with a stable key.
- Do not create random keys on every render.
- Use updater functions for values based on previous state.
- Avoid mutating arrays and objects in place.
- Pass the state value straight into a prop when you can: that is what keeps the update
  surgical instead of re-running the app.
- Do not read object state with `user.name`; call the value (`user()`) or let a widget
  resolve it.
- Unsubscribe from manual watchers when the feature is destroyed.
- Use `runApp()` when you want global re-render behavior for a complete app.

## TypeScript note

The runtime currently returns `[value, setValue, subscribe]`. Keep the declaration file and this behavior aligned when changing the public API.

---

## Continue reading

- **Previous:** [CollapsibleSideBar](../widget/CollapsibleSideBar.md) — end of the widget book.
- **Next:** [Routing with FletBox](router.md) — Chapter 9 · State, Router & Services
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
