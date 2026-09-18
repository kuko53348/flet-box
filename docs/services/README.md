# Services: the FletBox data & network book

This directory is a book, just like the [widget book](../widget/README.md) and the [tools book](../tools/README.md). It documents the four services that ship with FletBox — the helpers that connect your app to the **outside world**: browser storage and the network.

Services are plain JavaScript functions and objects. You import them from `flet-box`:

```javascript
import { saveData, getData, httpGet, subscribeRam } from "flet-box";
```

> **Services vs. Tools.** *Services* talk to the outside world (storage, network) and may be async or stateful. *Tools* are pure helpers that turn input into a value. Find tools in the [tools book](../tools/README.md).

For a task-oriented walkthrough of when to use each storage layer, see the [Frontend services guide](../guides/frontend-services.md). This book is the complete API reference.

## How to read this book

- Read **Storage → Session → RamStore** to understand the three storage layers from longest-lived to shortest-lived, then **http** for the network client.
- At the end of every page there is a **Continue reading** block with the previous page, the next page, and a link back to this index.
- Each page has the same shape: an overview, when to use it, the full function API, and copy-paste examples.

> **Security.** Never store passwords, private keys, or security secrets in any of these services. Browser storage is readable by anyone with access to the device, and any token in frontend code is visible to the user. Protect sensitive data with server-side authorization.

## The reading path

### Chapter 1 · Storage layers

Three layers, chosen by how long the data should live.

1. [Storage](Storage.md) — persistent data backed by `localStorage`
2. [Session](Session.md) — tab-scoped data backed by `sessionStorage`
3. [RamStore](RamStore.md) — in-memory reactive state with subscriptions

### Chapter 2 · Network

4. [http](http.md) — a small `fetch`-based client with JSON, params, timeout, and errors

## Index

- [Storage](Storage.md)
- [Session](Session.md)
- [RamStore](RamStore.md)
- [http](http.md)
