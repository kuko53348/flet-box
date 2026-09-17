# Authentication and security

## Start securely

Use `runSecureServer()` as the default starting point for a real API:

```javascript
import { Api, runSecureServer } from "flet-box-server";

const routes = Api({
  "/health": { GET: () => ({ ok: true }) },
});

runSecureServer(routes, {
  port: 3000,
  docs: true,
  rateLimit: { max: 100, windowMs: 60_000 },
});
```

This enables security middleware, input cleaning, validation, malicious-content blocking, and rate limiting according to the server options.

## JWT login

The security database supports a password grant through a token handler. A development login request looks like this:

```javascript
const response = await fetch("http://localhost:3000/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "password",
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  }),
});

const { access_token } = await response.json();
```

Send the token with protected requests:

```javascript
fetch("http://localhost:3000/private", {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});
```

## Protect a route

```javascript
import { authenticate } from "flet-box-server";

const routes = Api({
  "/private": {
    GET: {
      handler: ({ req }) => ({
        user: req.user,
        secret: "private data",
      }),
      middleware: [authenticate],
    },
  },
});
```

`authenticate` rejects missing or invalid bearer tokens with status `401` and adds the verified payload to `req.user`.

## Roles

Use `hasRole()` after authentication:

```javascript
import { authenticate, hasRole } from "flet-box-server";

const routes = Api({
  "/admin": {
    GET: {
      handler: () => ({ area: "admin" }),
      middleware: [authenticate, hasRole("admin")],
    },
  },
});
```

A user must be authenticated before roles can be checked.

## Optional authentication

Use `optionalAuth` when a route works for visitors but can provide extra data to logged-in users:

```javascript
import { optionalAuth } from "flet-box-server";

middleware: [optionalAuth]
```

## Input sanitization

`securityCheck` can:

- Check blocked IPs, paths, and user agents.
- Sanitize request body, query, and path parameters.
- Apply security headers.
- Apply CORS rules.

Do not treat sanitization as a replacement for validation. Validate the expected type and business rules too.

## Malicious-content blocking

`blockMalicious` checks body, params, and query values against known suspicious patterns and returns `403` when a pattern is detected.

Use it as route middleware when appropriate:

```javascript
middleware: [authenticate, blockMalicious, securityCheck]
```

False positives are possible. Review the accepted input for your application instead of blindly allowing all content.

## Schema validation

Use `SchemaValidator` for explicit validation:

```javascript
import { SchemaValidator } from "flet-box-server";

const validator = new SchemaValidator({
  name: { type: "string", required: true, minLength: 2 },
  age: { type: "number", min: 0 },
  email: { type: "email", required: true },
});

const result = validator.validate({
  name: "Ada",
  age: 36,
  email: "ada@example.com",
});

if (!result.valid) {
  console.log(result.errors);
}
```

Supported validation concepts include strings, numbers, booleans, email, URL, date, UUID, arrays, objects, required fields, ranges, lengths, enums, defaults, and custom patterns.

## Rate limiting

Create a route limiter:

```javascript
import { rateLimit } from "flet-box-server";

const limiter = rateLimit({
  max: 10,
  windowMs: 60_000,
  message: "Too many requests",
});

const routes = Api({
  "/login": {
    POST: {
      handler: login,
      middleware: [limiter],
    },
  },
});
```

For multiple server instances, use a shared store such as Redis rather than only an in-memory map.

## Security headers and CORS

`securityCheck` applies headers such as content-type protection, frame protection, referrer policy, and content security policy.

CORS origins can be configured with the environment variable:

```bash
CORS_ORIGINS=https://my-app.example.com,https://admin.example.com
```

Avoid `*` with credentials in production. Use an explicit allowlist.

## Production checklist

- Set a long random `JWT_SECRET`.
- Remove hardcoded admin users and passwords.
- Never commit SMTP, Twilio, Redis, or cloud credentials.
- Use HTTPS.
- Restrict CORS origins.
- Enable validation and rate limiting.
- Review sanitization false positives.
- Store verification codes and sessions in a shared store when scaling.
- Log security events without logging passwords or tokens.
