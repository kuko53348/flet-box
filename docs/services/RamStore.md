# RamStore

## Overview
`RamStore` is the **in-memory** reactive store. It keeps data in a JavaScript `Map` while the page is open, notifies subscribers when any key changes, and powers `useState` under the hood. Everything is lost when the page reloads — that is its job.

## When to use
- Share live values between widgets (the state engine behind `useState`).
- Keep temporary UI data — form steps, current filters, draft objects — that must disappear on reload.

## Import

```javascript
import { saveRam, getRam, subscribeRam, RamStore } from "flet-box";
```

Every function also exists as a method of the exported `RamStore` object, for an object-style API.

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `saveRam` | `saveRam(key, value)` | `boolean` | Store or replace `value` under `key` and notify subscribers. |
| `getRam` | `getRam(key)` | `T \| null` | Read the value, or `null` if the key does not exist. |
| `getAllRam` | `getAllRam()` | `Record<string, any>` | Every stored key/value pair. |
| `getAllRamKeys` | `getAllRamKeys()` | `string[]` | All stored keys. |
| `hasRam` | `hasRam(key)` | `boolean` | Is the key present? |
| `updateRam` | `updateRam(key, value)` | `boolean` | Replace the value (same as `saveRam`). |
| `deleteRam` | `deleteRam(key)` | `boolean` | Remove a key. |
| `clearAllRam` | `clearAllRam()` | `boolean` | Remove everything. |
| `subscribeRam` | `subscribeRam(callback)` | `() => void` | Subscribe to changes, returns an unsubscribe function. |
| `getRamItemCount` | `getRamItemCount()` | `number` | How many keys are stored. |
| `isRamAvailable` | `isRamAvailable()` | `boolean` | Always `true` in a browser; kept for API symmetry with the other stores. |

The subscribe callback receives `(key, newValue, oldValue)`. Use your stored key as the first argument to filter.

## Examples

### Everyday example

```javascript
import { saveRam, getRam } from "flet-box";

saveRam("cart", [{ id: 1 }, { id: 2 }]);
const cart = getRam("cart");
```

### Full example

```javascript
import { saveRam, subscribeRam, deleteRam } from "flet-box";

const unsubscribe = subscribeRam((key, newValue, oldValue) => {
  console.log(`${key}: ${oldValue} → ${newValue}`);
});

saveRam("theme", "dark"); // logs: theme: null → dark
deleteRam("theme");       // logs: theme: dark → null

// stop listening:
unsubscribe();
```

## Notes

- This is the store behind `useState`. When you call `setCount(...)`, FletBox saves through `RamStore` and re-renders registered widgets.
- Values can be any JSON-safe data: strings, numbers, booleans, arrays, objects.
- There is no expiration and no persistence. For data that survives a reload, use [Storage](Storage.md).
- Synchronous and dependency-free: subscribe handlers run in order and errors in one handler never break the others.

## Related pages
- [Session](Session.md) — tab-scoped persistence.
- [Storage](Storage.md) — persistent storage.
- [Frontend services guide](../guides/frontend-services.md) — choosing a storage layer.
- [State guide](../guides/state.md) — `useState` and reactivity.

---

## Continue reading

- **Previous:** [Services index](README.md)
- **Next:** [Session](Session.md)
- **Index:** [Services index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 9 · State, Router & Services** (1 of 4).