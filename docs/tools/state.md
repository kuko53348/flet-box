# State, memo & refs

## Overview
Three power-ups for state and performance: `useState`/`useWatchState` for reactive values, `memo`/`memoWithKey`/`clearMemo` for caching expensive results, and `ref` for keeping a live handle to a widget.

## When to use
- Share values between widgets and re-render on change (`useState`).
- Cache an expensive computation (parsing, formatting, mapping) with `memo`.
- Grab a widget instance to update it later (`ref`).

## Import

```javascript
import { useState, useWatchState, memo, ref } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `useState` | `useState(key, initialState, widget?, propName?)` | `[value, setValue, subscribe]` | Reactive state stored under `key`. Optional `widget` + `propName` re-render that widget's prop on change. |
| `useWatchState` | `useWatchState(key, callback)` | `() => void` | Watch a state key; returns an unsubscribe function. |
| `memo` | `memo(fn)` | `T & { cache? }` | Cache a function by its arguments. |
| `memoWithKey` | `memoWithKey(fn, keyFn)` | `T` | Cache using a custom result key. |
| `clearMemo` | `clearMemo(memoizedFn)` | `void` | Drop a memoized function's cache. |
| `ref` | `ref()` | `(widget) => widget & { update }` | Assign to a widget's `ref` prop to get a live handle. |

## Examples

### Everyday example

```javascript
import { useState, Button, Text, Column } from "flet-box";

const [count, setCount] = useState("counter", 0);

Column({
  children: [
    Text({ text: `Count: ${count}` }),
    Button({
      text: "Add one",
      onPress: () => setCount((previous) => previous + 1),
    }),
  ],
});
```

### Full example — live widget updates via `ref`

```javascript
import { Text, Button, ref } from "flet-box";

const label = ref();

Button({
  text: "Rename",
  onPress: () => label.update({ text: "Saved!" }),
  ref: label,
});
```

### Caching with `memo`

```javascript
import { memo } from "flet-box";

const parseData = (raw) => JSON.parse(raw);
const parseMemo = memo(parseData);

const first = parseMemo(jsonText); // runs
const second = parseMemo(jsonText); // cached, fast
```

## Notes

- Read the full [State guide](../guides/state.md) for the complete `useState` rules: stable keys, updater functions, immutability, and widget binding.
- `useState` returns `[value, setValue, subscribe]` — `subscribe(cb)` returns an unsubscribe function.
- `memo` caches by serialized arguments; use `memoWithKey` when you want to control the cache key yourself, and `clearMemo` to free memory when the cache grows too large.
- `ref()` returns a function for a widget's `ref` prop; the handle gives you `update(props)` to push new props into the widget.

## Related pages
- [State guide](../guides/state.md) — full `useState` semantics.
- [Text & time](text-and-time.md) — previous chapter.
- [Async, ids & logging](async-ids-log.md) — next chapter.

---

## Continue reading

- **Previous:** [Text & time](text-and-time.md)
- **Next:** [Async, ids & logging](async-ids-log.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (4 of 12).