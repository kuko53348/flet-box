# HTTP client

## Overview
FletBox ships a small `fetch`-based HTTP client. Five shortcuts — `httpGet`, `httpPost`, `httpPut`, `httpPatch`, `httpDelete` — and one generic function, `httpRequest`, handle requests with JSON bodies, query parameters, custom headers, and timeouts. Every call returns a `Promise`.

## When to use
- Talk to a REST API from your FletBox app.
- Stick to one consistent client instead of wrapping `fetch` yourself.

## Import

```javascript
import { httpGet, httpPost, httpRequest } from "flet-box";
```

## Options

`options` is an object (the type is `HttpRequestOptions`) that extends the browser `RequestInit`:

| Option | Type | Description |
| --- | --- | --- |
| `body` | any | Request body. Objects/arrays are JSON-stringified automatically when you pass them (set `Content-Type: application/json`). |
| `headers` | `Record<string, string>` | Extra headers merged with the defaults. |
| `params` | `Record<string, string \| number \| boolean \| null \| undefined>` | Query parameters appended to the URL. |
| `timeout` | number | Abort the request after this many ms. |
| …plus `RequestInit` | — | `method`, `credentials`, `mode`, `signal`, etc. |

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `httpRequest` | `httpRequest(method, url, options?)` | `Promise<T>` | Any HTTP method with full options. |
| `httpGet` | `httpGet(url, options?)` | `Promise<T>` | `GET` shortcut. |
| `httpPost` | `httpPost(url, options?)` | `Promise<T>` | `POST` shortcut. |
| `httpPut` | `httpPut(url, options?)` | `Promise<T>` | `PUT` shortcut. |
| `httpPatch` | `httpPatch(url, options?)` | `Promise<T>` | `PATCH` shortcut. |
| `httpDelete` | `httpDelete(url, options?)` | `Promise<T>` | `DELETE` shortcut. |

## Examples

### Everyday example

```javascript
import { httpGet, httpPost } from "flet-box";

const users = await httpGet("/api/users");
const created = await httpPost("/api/users", {
  body: { name: "Ada" },
  headers: { "Content-Type": "application/json" },
});
```

### Full example

```javascript
import { httpGet } from "flet-box";

const result = await httpGet("https://api.example.com/search", {
  params: { q: "fletbox", page: 1, perPage: 20 },
  timeout: 8000, // give up after 8 seconds
});

console.log(result.items);
```

## Notes

- Responses are parsed as JSON automatically when possible.
- `params` values are appended as query strings; `null`/`undefined` values are skipped.
- A `timeout` aborts the request with an error once the time is reached.
- The client depends only on the browser `fetch` API — no external library.

## Related pages
- [Frontend services guide](../guides/frontend-services.md) — choosing storage vs. network.
- [Frontend services](../services/README.md) — the full services map.
- [Tools](../tools/README.md) — the helper functions (next chapter).

---

## Continue reading

- **Previous:** [Storage](Storage.md)
- **Next:** [Tools index](../tools/README.md) — Chapter 10
- **Index:** [Services index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 9 · State, Router & Services** (4 of 4).