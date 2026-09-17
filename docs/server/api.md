# API and routes

## `Api()`

`Api()` turns a readable route object into the internal route map used by the server.

```javascript
import { Api } from "flet-box-server";

const routes = Api({
  "/products": {
    GET: {
      handler: ({ query }) => ({
        items: [],
        search: query.search || null,
      }),
      tag: "products",
      description: "List products",
    },
  },
});
```

Supported methods are `GET`, `POST`, `PUT`, `DELETE`, and `PATCH`.

## Handler styles

A short handler can be a function:

```javascript
"/health": {
  GET: () => ({ ok: true }),
}
```

A detailed handler can include middleware, metadata, schemas, and examples:

```javascript
"/tasks": {
  POST: {
    handler: ({ title, completed }) => ({
      id: 1,
      title,
      completed,
    }),
    middleware: [],
    tag: "tasks",
    description: "Create a task",
    example: {
      title: "Read the docs",
      completed: false,
    },
    responseExample: {
      id: 1,
      title: "Read the docs",
      completed: false,
    },
  },
}
```

## URL parameters

Use `:name` in a route path:

```javascript
"/users/:id": {
  GET: ({ id }) => ({
    userId: id,
  }),
}
```

The server matches `/users/42` and provides `id: "42"` to the handler.

## Query parameters

Query values are available through `query` or `req.query`:

```javascript
"/search": {
  GET: ({ query }) => ({
    term: query.term || "",
    page: Number(query.page || 1),
  }),
}
```

Request example:

```bash
curl "http://localhost:3000/search?term=widgets&page=2"
```

## Request body

For JSON requests, body fields are spread into the handler context:

```javascript
"/profile": {
  PUT: {
    handler: ({ name, email }) => ({ name, email }),
    example: {
      name: "Ada",
      email: "ada@example.com",
    },
  },
}
```

You can also access the original body through `req.body`.

## Automatic request schemas

When a method has an `example`, the server calls `inferSchema()` and stores the generated schema in the route documentation.

```javascript
example: {
  name: "Ada",
  age: 30,
  active: true,
  tags: ["developer"],
}
```

Use real JavaScript values in examples. For example, `age: 30`, not `age: thirty`.

The inferred schema detects strings, numbers, booleans, arrays, objects, email-like values, and URL-like values.

## Manual schemas

Use `schemas` when the inferred schema is not enough:

```javascript
"/users": {
  POST: {
    handler: ({ body }) => body,
    schemas: {
      CreateUser: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          email: { type: "email" },
        },
        required: ["name", "email"],
      },
    },
  },
}
```

For active validation, use `validate: true` in the server options or add validation middleware explicitly.

## Response examples

`responseExample` creates response documentation and a success response entry:

```javascript
responseExample: {
  id: 1,
  name: "Ada",
}
```

## Middleware

Middleware uses the Express-style `(req, res, next)` shape:

```javascript
const logRequest = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

const routes = Api({
  "/health": {
    GET: {
      handler: () => ({ ok: true }),
      middleware: [logRequest],
    },
  },
});
```

## Generated documentation

Enable docs when starting the server:

```javascript
runServer(routes, { docs: true });
```

The server exposes:

```text
GET /docs
```

The response groups endpoints by tag and includes methods, descriptions, schemas, responses, and generated curl, Python, and JavaScript examples.

## HTTP responses

Returning an object sends a JSON response with status `200`:

```javascript
"/status": {
  GET: () => ({ status: "ok" }),
}
```

For errors inside middleware, use:

```javascript
return res.error("Unauthorized", 401);
```

## Route checklist

- Use a clear path.
- Use the correct HTTP method.
- Add `description` and `tag`.
- Add `example` for body-based methods.
- Add `responseExample` for useful response documentation.
- Add authentication and validation where needed.
- Do not expose secrets in examples or responses.
