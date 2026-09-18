# Async, ids & logging

## Overview
Handy one-liners for async work, unique identifiers, and pleasant logging.

## When to use
- Pause code with `delay`/`sleep`, enforce a minimum loading time, or retry a flaky network call.
- Generate unique keys for lists and data (`uuid`, `shortId`, `numericId`, `timestampId`).
- Replace `console.log` with a colored, labeled `print`.

## Import

```javascript
import { delay, withMinDelay, retry, uuid, shortId, print } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `delay` | `delay(ms)` | `Promise<void>` | Resolve after `ms` milliseconds. |
| `sleep` | `sleep(ms)` | `Promise<void>` | Alias-style async sleep. |
| `withMinDelay` | `withMinDelay(promise, minMs?)` | `Promise<T>` | Resolve only after both the promise and `minMs` complete. |
| `retry` | `retry(fn, retries?, delayMs?)` | `Promise<T>` | Call `fn` again on rejection, up to `retries` times, waiting `delayMs` between attempts. |
| `uuid` | `uuid()` | `string` | A version-4 style UUID. |
| `shortId` | `shortId()` | `string` | A short unique id. |
| `numericId` | `numericId(length?)` | `string` | A numeric id of `length` digits. |
| `timestampId` | `timestampId()` | `string` | A time-based unique id. |
| `print` | `print(message, type?, options?)` | `void` | Log with styling and [types](#the-print-signature). |

### The `print` signature

`print(message, type = "log", options = {})`

- `type`: `"log" | "warn" | "error" | "info" | "success" | "debug"`.
- `options`: `{ timestamp?: boolean, label?: string, prefix?: boolean }`.
- Objects are pretty-printed as JSON.

## Examples

### Everyday example

```javascript
import { delay } from "flet-box";

await delay(500); // wait half a second
```

### Full example

```javascript
import { withMinDelay, retry, uuid, print } from "flet-box";

const data = await withMinDelay(fetchData(), 600);
const saved = await retry(saveData, 3, 300);

print("User created", "success", { timestamp: true });
console.log(uuid()); // e.g. "f47ac10b..."
```

## Notes

- `retry` re-runs the **whole** promise factory on each failure, so it is safe to retry lazy calls like `() => fetch(...)`.
- `withMinDelay` is perfect for loading spinners: the UI stays visible for at least `minMs`.
- `print` uses the correct console method per type and is safe to remove later without touching logic.

## Related pages
- [State, memo & refs](state.md) — previous chapter.
- [Device & environment](device.md) — next chapter.
- [HTTP client](../services/http.md) — network calls you may want to retry.

---

## Continue reading

- **Previous:** [State, memo & refs](state.md)
- **Next:** [Device & environment](device.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (5 of 12).