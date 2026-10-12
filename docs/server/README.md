# FletBox Server

FletBox Server is the backend toolkit for building APIs with Node.js. It gives you a simple route definition, automatic schemas, validation, authentication, security middleware, data tools, and generated API documentation.

It is a **separate package with its own repository** — [kuko53348/flet-box-server](https://github.com/kuko53348/flet-box-server) — because the frontend and the backend release independently. Nothing here is required to build a FletBox app; the docs live in this book so the whole stack is documented in one place.

```bash
npm install flet-box-server
```

Import the core from the package root, and each tool from its own module. The tools are deliberately not re-exported at the root: `pdf.js` pulls puppeteer, `sms.js` pulls twilio, `csv.js` pulls xlsx, and the speech modules need optional Google Cloud packages, so a single root import would force all of them to load.

```javascript
import { Api, runServer } from "flet-box-server";                        // core
import { SQLite } from "flet-box-server/tools/betterSqlite.js";           // one tool
```

## Start here

If this is your first backend, read [Start here](START_HERE.md).

## Documentation map

- [Start here](START_HERE.md): create your first API step by step.
- [API and routes](api.md): define endpoints, handlers, parameters, and schemas.
- [Authentication and security](security.md): JWT, roles, sanitization, blocking, headers, and rate limits.
- [Database and services](data-services.md): where data lives (browser vs server), a dedicated SQLite API server example, cache, files, email, PDF, CSV, queues, and more.
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
