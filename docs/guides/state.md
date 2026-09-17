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
      Text({ text: `Count: ${count}` }),
      Button({
        text: "Add one",
        onPress: () => setCount((previous) => previous + 1),
      }),
    ],
  });
};
```

When `setCount` runs, FletBox updates the stored value and schedules a render.

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

The state system can register a widget and update one of its props:

```javascript
const [label, setLabel] = useState(
  "button-label",
  "Save",
  button,
  "text",
);
```

This advanced form is useful when an existing widget must receive updates without rebuilding the whole screen.

## Persistence during the session

FletBox stores state through its RAM store. The value is available by key while the application is running:

```javascript
import { saveState, getState } from "flet-box";

saveState("language", "en");
const language = getState("language");
```

Use the storage services when you need browser persistence or a different lifetime.

## Important rules

- Call `useState` with a stable key.
- Do not create random keys on every render.
- Use updater functions for values based on previous state.
- Avoid mutating arrays and objects in place.
- Unsubscribe from manual watchers when the feature is destroyed.
- Use `runApp()` when you want global re-render behavior for a complete app.

## TypeScript note

The runtime currently returns `[value, setValue, subscribe]`. Keep the declaration file and this behavior aligned when changing the public API.
