# Frontend services

FletBox includes three browser storage layers and a small HTTP client. Choose the layer based on how long the data should live.

## Choose a storage layer

| Service | Lifetime | Best for |
| --- | --- | --- |
| `RamStore` | Until the page is reloaded | Shared reactive UI state. |
| `Session` | Until the browser tab/session ends | Temporary session data. |
| `Storage` | Until the user or app removes it | Small persistent preferences. |

None of these services should be used for passwords, private keys, or security secrets.

## RamStore

`RamStore` keeps values in memory and can notify subscribers:

```javascript
import { getRam, saveRam, subscribeRam } from "flet-box";

saveRam("cart", [{ id: 1, name: "Book" }]);
const cart = getRam("cart");

const unsubscribe = subscribeRam((key, newValue, oldValue) => {
  if (key === "cart") {
    console.log({ newValue, oldValue });
  }
});

unsubscribe();
```

Values disappear when the page reloads.

## Session storage

Use `Session` for data that should survive navigation but not remain as a permanent preference:

```javascript
import { getSession, saveSession, deleteSession } from "flet-box";

saveSession("checkout-step", 2);
const step = getSession("checkout-step");
deleteSession("checkout-step");
```

The data is backed by `sessionStorage`.

## Persistent storage

Use `Storage` for small preferences:

```javascript
import { getData, saveData, deleteData } from "flet-box";

saveData("preferences", {
  theme: "dark",
  language: "en",
});

const preferences = getData("preferences");
deleteData("preferences");
```

The data is backed by `localStorage` and serialized as JSON.

## Storage rules

- Use namespaced keys such as `fletbox:preferences`.
- Store small values only.
- Handle `null` when a key does not exist.
- Do not store credentials or sensitive tokens unless you understand the security tradeoff.
- Do not call `clearAllData()` in a shared page unless you intentionally want to clear every local-storage key for that origin.
- Do not call `clearAllSession()` in a shared page unless you intentionally want to clear every session-storage key for that origin.
- Use a server-side session or secure platform storage for sensitive authentication data.

## Check availability

Storage can be disabled by browser privacy settings, sandboxing, or restricted contexts:

```javascript
import { isStorageAvailable, isSessionAvailable } from "flet-box";

if (isStorageAvailable()) {
  saveData("visited", true);
}

if (isSessionAvailable()) {
  saveSession("step", 1);
}
```

## HTTP requests

The HTTP helpers use `fetch` and return parsed JSON when the response content type is JSON:

```javascript
import { httpGet, httpPost } from "flet-box";

const users = await httpGet("/api/users", {
  params: { page: 1 },
});

const created = await httpPost("/api/users", {
  body: { name: "Ada" },
});
```

Available helpers:

```text
httpGet
httpPost
httpPut
httpPatch
httpDelete
httpRequest
```

## Headers and authentication

```javascript
const data = await httpGet("/api/private", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

Never hardcode a private secret in frontend source code. A bearer token in browser code must be treated as accessible to the user and protected by server-side authorization.

## Timeout and errors

```javascript
try {
  const data = await httpGet("/api/slow", {
    timeout: 5000,
  });
  console.log(data);
} catch (error) {
  console.error("Request failed:", error.message);
}
```

Non-2xx responses throw an error containing `response` and, when available, parsed response data in `error.data`.

## Query parameters

```javascript
const result = await httpGet("/api/search", {
  params: {
    query: "widgets",
    page: 2,
  },
});
```

Use encoded values through the `params` option instead of manually concatenating user input into URLs.

## Service API status

Every storage and HTTP function is declared in `src/index.d.ts`, exported from `src/index.js`, and detailed on the [services reference pages](../services/README.md). The runtime also exports namespace objects (`RamStore`, `Session`, `Storage`) that group each layer.

---

## Continue reading

- **Previous:** [Routing with FletBox](router.md)
- **Next:** [Services index](../services/README.md) — the full reference
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
