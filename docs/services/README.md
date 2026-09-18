# Services: FletBox data & network helpers

This directory is the reference index for the services that ship with FletBox — the helpers that connect your app to the **outside world**: browser storage and the network.

Services are plain JavaScript functions and objects. You import them from `flet-box`:

```javascript
import { saveData, getData, httpGet, subscribeRam } from "flet-box";
```

> **Services vs. Tools.** *Services* talk to the outside world (storage, network) and may be async or stateful. *Tools* are pure helpers that turn input into a value. Find tools in the [tools index](../tools/README.md).

For a task-oriented walkthrough of the three storage layers, read the [Frontend services guide](../guides/frontend-services.md). This index lists everything the framework actually exports today, grouped by layer, and **links to a full reference page for each layer** (every function with its signature and return value). The implementation lives in `src/services/` and every name below is present in `src/index.js`.

## The four layers

| Page | Layer | Lifetime |
| --- | --- | --- |
| [RamStore](RamStore.md) | In-memory reactive state (backs `useState`) | While the page runs |
| [Session](Session.md) | `sessionStorage` | The tab session |
| [Storage](Storage.md) | `localStorage` | Until cleared |
| [HTTP client](http.md) | `fetch`-based network calls | Per request |

## RamStore — in-memory reactive state

RAM storage, alive while the page runs. Backs `useState`'s keys.

- `RamStore` — class/instance access.
- `saveRam(key, value)`, `getRam(key)`, `getAllRam()`, `getAllRamKeys()`, `hasRam(key)`, `updateRam(key, value)`, `deleteRam(key)`, `clearAllRam()`, `getRamItemCount()`, `isRamAvailable()`.
- `subscribeRam(callback)` — subscribe to any RAM change; returns an unsubscribe function.

> Full detail, examples, and notes → [RamStore reference](RamStore.md).

## Session — tab-scoped storage

Backed by `sessionStorage`: lives for the tab session, lost when the tab closes.

- `Session` — class/instance access.
- `saveSession(key, value)` (async), `getSession(key)` (async), `getSessionSync(key)`, `updateSession(key, value)`, `deleteSession(key)`, `clearAllSession()`, `hasSession(key)`, `getAllSessionKeys()`, `getAllSessionData()`, `getSessionSize()`, `deleteSessionByPrefix(prefix)`, `deleteSessionBySuffix(suffix)`, `getSessionItemCount()`, `isSessionAvailable()`.

> Full detail, examples, and notes → [Session reference](Session.md).

## Storage — persistent data

Backed by `localStorage`: survives browser restarts until cleared.

- `Storage` — class/instance access.
- `saveData(key, value)` (async), `getData(key)` (async), `getDataSync(key)`, `updateData(key, value)`, `deleteData(key)`, `clearAllData()`, `hasData(key)`, `getAllKeys()`, `getAllData()`, `getStorageSize()`, `deleteDataByPrefix(prefix)`, `deleteDataBySuffix(suffix)`, `getItemCount()`, `isStorageAvailable()`.

> Full detail, examples, and notes → [Storage reference](Storage.md).

## HTTP client

A small `fetch`-based client.

- `httpGet(url, options)`, `httpPost(url, options)`, `httpPut(url, options)`, `httpPatch(url, options)`, `httpDelete(url, options)` — all take a single options object with `body`, `params`, `headers`, and `timeout`.
- `httpRequest(method, url, options)` — generic request; see `HttpRequestOptions` in `src/index.d.ts`.

> Full detail, examples, and notes → [HTTP reference](http.md).

> **Security.** Never store passwords, private keys, or security secrets in any of these services. Browser storage is readable by anyone with access to the device, and any token in frontend code is visible to the user. Protect sensitive data with server-side authorization.

## Where to go next

- [Frontend services guide](../guides/frontend-services.md) — the practical walkthrough for storage and HTTP.
- [Guides index](../guides/README.md) — every FletBox guide in reading order.
- [State guide](../guides/state.md) — `useState` and RAM-backed reactivity.
- [Tools index](../tools/README.md) — the pure helper functions.
- [Widgets](../widget/README.md) — the widget book.

---

## Continue reading

- **Previous:** [Frontend services guide](../guides/frontend-services.md)
- **Next:** [RamStore](RamStore.md)
- **Index:** [Guides index](../guides/README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 9 · State, Router & Services** (chapter opener).