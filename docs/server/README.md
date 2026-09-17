# FletBox Server

FletBox Server is the backend toolkit for building APIs with Node.js. It gives you a simple route definition, automatic schemas, validation, authentication, security middleware, data tools, and generated API documentation.

## Start here

If this is your first backend, read [Start here](START_HERE.md).

## Documentation map

- [Start here](START_HERE.md): create your first API step by step.
- [API and routes](api.md): define endpoints, handlers, parameters, and schemas.
- [Authentication and security](security.md): JWT, roles, sanitization, blocking, headers, and rate limits.
- [Database and services](data-services.md): SQLite, cache, files, email, PDF, CSV, queues, and more.
- [Deployment](deployment.md): environment variables, production settings, Docker, and operational checks.

## What the server does

- Defines routes with `Api()`.
- Runs on the native Node.js HTTP server or an Express adapter.
- Creates JSON responses automatically for returned objects.
- Generates schemas from request examples.
- Validates request bodies with `SchemaValidator`.
- Serves generated API documentation at `/docs`.
- Supports JWT authentication and role checks.
- Provides security headers, sanitization, malicious-input blocking, and rate limiting.
- Includes modules for SQLite, Redis, files, email, SMS, PDF, CSV/XLSX, WebSockets, queues, speech, translation, and logging.

## Important production rule

The example server in `flet-box-server/app.js` is a test server. It disables some protections and contains a development admin account. Do not copy those values into production. Use `runSecureServer`, environment variables, a real database, a strong `JWT_SECRET`, and explicit CORS origins.

## Minimal server

```javascript
import { Api, runServer } from "flet-box-server";

const routes = Api({
  "/": {
    GET: () => ({ message: "Hello from FletBox Server" }),
  },
});

runServer(routes, {
  port: 3000,
  docs: true,
});
```

Then open:

```text
http://localhost:3000/
http://localhost:3000/docs
```
