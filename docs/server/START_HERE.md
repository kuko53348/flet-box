# Start here

This guide teaches the backend in small steps. You only need JavaScript and a terminal.

## 1. Install

Inside `flet-box-server`:

```bash
npm install
```

The server requires Node.js and uses ES modules.

## 2. Create one route

Create `server.js`:

```javascript
import { Api, runServer } from "flet-box-server";

const routes = Api({
  "/hello": {
    GET: () => ({ message: "Hello" }),
  },
});

runServer(routes, { port: 3000, docs: true });
```

Start it:

```bash
node server.js
```

Test it:

```bash
curl http://localhost:3000/hello
```

## 3. Understand the route

```javascript
"/users/:id": {
  GET: ({ id, query, req }) => ({
    id,
    filters: query,
    userAgent: req.headers["user-agent"],
  }),
}
```

- `/users/:id` is the URL pattern.
- `id` comes from the URL.
- `query` contains values such as `?page=2`.
- `req` is the native request object.
- Returning an object sends JSON to the client.

## 4. Accept JSON data

```javascript
const routes = Api({
  "/tasks": {
    POST: {
      handler: ({ title, completed }) => ({
        title,
        completed,
      }),
      example: {
        title: "Learn FletBox Server",
        completed: false,
      },
    },
  },
});
```

The `example` documents the expected body and can be used to generate a schema.

Request it with:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn FletBox Server","completed":false}'
```

## 5. Add protection

For a production-style default, use:

```javascript
import { Api, runSecureServer } from "flet-box-server";

const routes = Api({
  "/private": {
    GET: () => ({ secret: "protected data" }),
  },
});

runSecureServer(routes, {
  port: 3000,
  docs: true,
  rateLimit: { max: 100, windowMs: 60_000 },
});
```

Add authentication to routes that require a logged-in user. See [Authentication and security](security.md).

## 6. Learn the normal workflow

1. Define routes with `Api()`.
2. Add `example` objects for request bodies.
3. Add `responseExample` objects for documented responses.
4. Add middleware such as authentication or roles.
5. Start with `runSecureServer()`.
6. Test with curl or your frontend.
7. Open `/docs` to inspect generated documentation.
8. Move secrets and configuration to environment variables.
