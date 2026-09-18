# Session

## Overview
`Session` is the **tab-scoped** store, backed by `sessionStorage`. Data lives while the tab is open and disappears when the tab or the browser closes. It works with strings, numbers, booleans, arrays, and objects.

## When to use
- Remember something for "this visit only": a cart while the user is on the page, a wizard step, a temporary token (see the security note).
- Keep data between multiple widgets that must not survive a full page reload more than once.

## Import

```javascript
import { saveSession, getSession, Session } from "flet-box";
```

Every function also exists as a method of the exported `Session` object. The API mirrors [RamStore](RamStore.md) and [Storage](Storage.md) so you can swap the layer without rewriting your calls.

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `saveSession` | `saveSession(key, value)` | `boolean` | Store `value` under `key` in `sessionStorage`. |
| `getSession` | `getSession(key)` | `T \| null` | Read the value (async-safe wrapper). |
| `getSessionSync` | `getSessionSync(key)` | `T \| null` | Read the value synchronously. |
| `updateSession` | `updateSession(key, value)` | `boolean` | Replace the value. |
| `deleteSession` | `deleteSession(key)` | `boolean` | Remove one key. |
| `clearAllSession` | `clearAllSession()` | `boolean` | Remove every key for this tab session. |
| `hasSession` | `hasSession(key)` | `boolean` | Is the key present? |
| `getAllSessionKeys` | `getAllSessionKeys()` | `string[]` | All stored keys. |
| `getAllSessionData` | `getAllSessionData()` | `Record<string, any>` | Every key/value pair. |
| `getSessionSize` | `getSessionSize()` | `number` | Approximate size in bytes. |
| `deleteSessionByPrefix` | `deleteSessionByPrefix(prefix)` | `number` | Delete every key starting with `prefix`; returns the count. |
| `deleteSessionBySuffix` | `deleteSessionBySuffix(suffix)` | `number` | Delete every key ending with `suffix`; returns the count. |
| `getSessionItemCount` | `getSessionItemCount()` | `number` | How many keys are stored. |
| `isSessionAvailable` | `isSessionAvailable()` | `boolean` | Is `sessionStorage` available? |

## Examples

### Everyday example

```javascript
import { saveSession, getSession } from "flet-box";

saveSession("wizard-step", 3);
const step = getSession("wizard-step");
```

### Full example

```javascript
import { saveSession, getSessionSync, deleteSessionByPrefix } from "flet-box";

saveSession("form.name", "Ada");
saveSession("form.age", 36);
saveSession("draft-note", "hello");

getSessionSync("form.name"); // "Ada"

// remove all dashboard form keys at once:
const removed = deleteSessionByPrefix("form.");
console.log(removed); // 2
```

## Notes

- `sessionStorage` survives a *refresh* (F5) but not a new tab or a closed browser.
- Objects and arrays are serialized (and restored) as JSON automatically.
- Use `getSessionSync` inside hot paths where you cannot wait for a promise.
- **Security.** Never store passwords, private keys, or security tokens in browser storage — it is readable by anyone with access to the device. Protect sensitive data with server-side authorization.

## Related pages
- [RamStore](RamStore.md) — the in-memory reactive store.
- [Storage](Storage.md) — persistent storage.
- [Frontend services guide](../guides/frontend-services.md) — choosing a storage layer.

---

## Continue reading

- **Previous:** [RamStore](RamStore.md)
- **Next:** [Storage](Storage.md)
- **Index:** [Services index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 9 · State, Router & Services** (2 of 4).