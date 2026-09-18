# Storage

## Overview
`Storage` is the **persistent** store, backed by `localStorage`. Data survives browser restarts until it is cleared — this is the layer for preferences, drafts, or saved documents. It works with strings, numbers, booleans, arrays, and objects.

## When to use
- Remember settings and user data between visits.
- Cache what the user has written (drafts, recent items) across reloads.
- Pair with [Session](Session.md) for short-lived data and [RamStore](RamStore.md) for live reactive state.

## Import

```javascript
import { saveData, getData, Storage } from "flet-box";
```

Every function also exists as a method of the exported `Storage` object. The API mirrors [RamStore](RamStore.md) and [Session](Session.md) so you can swap the layer without rewriting your calls.

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `saveData` | `saveData(key, value)` | `boolean` | Persist `value` under `key` in `localStorage`. |
| `getData` | `getData(key)` | `T \| null` | Read the value (async-safe wrapper). |
| `getDataSync` | `getDataSync(key)` | `T \| null` | Read the value synchronously. |
| `updateData` | `updateData(key, value)` | `boolean` | Replace the value. |
| `deleteData` | `deleteData(key)` | `boolean` | Remove one key. |
| `clearAllData` | `clearAllData()` | `boolean` | Remove every key. |
| `hasData` | `hasData(key)` | `boolean` | Is the key present? |
| `getAllKeys` | `getAllKeys()` | `string[]` | All stored keys. |
| `getAllData` | `getAllData()` | `Record<string, any>` | Every key/value pair. |
| `getStorageSize` | `getStorageSize()` | `number` | Approximate size in bytes. |
| `deleteDataByPrefix` | `deleteDataByPrefix(prefix)` | `number` | Delete every key starting with `prefix`; returns the count. |
| `deleteDataBySuffix` | `deleteDataBySuffix(suffix)` | `number` | Delete every key ending with `suffix`; returns the count. |
| `getItemCount` | `getItemCount()` | `number` | How many keys are stored. |
| `isStorageAvailable` | `isStorageAvailable()` | `boolean` | Is `localStorage` available? |

## Examples

### Everyday example

```javascript
import { saveData, getData } from "flet-box";

saveData("settings", { theme: "dark", fontSize: 18 });
const settings = getData("settings");
```

### Full example

```javascript
import { saveData, getDataSync, hasData, deleteDataByPrefix } from "flet-box";

if (!hasData("drafts")) {
  saveData("drafts", []);
}

saveData("drafts.1", "WIP chapter");
saveData("drafts.2", "README draft");

getDataSync("drafts.1"); // "WIP chapter"

// clean up this feature's keys:
deleteDataByPrefix("drafts.");
```

## Notes

- Data survives restarts and new tabs, until you remove it. It is shared across tabs of the same origin.
- Objects and arrays are serialized (and restored) as JSON automatically.
- `localStorage` is limited (about 5 MB per origin) and synchronous — keep the values small.
- Use `getDataSync` when you need the value immediately.
- **Security.** Never store passwords, private keys, or security tokens in browser storage — it is readable by anyone with access to the device. Protect sensitive data with server-side authorization.

## Related pages
- [RamStore](RamStore.md) — the in-memory reactive store.
- [Session](Session.md) — tab-scoped persistence.
- [Frontend services guide](../guides/frontend-services.md) — choosing a storage layer.

---

## Continue reading

- **Previous:** [Session](Session.md)
- **Next:** [HTTP client](http.md)
- **Index:** [Services index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 9 · State, Router & Services** (3 of 4).