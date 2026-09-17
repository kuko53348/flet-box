# Deployment and operations

## Development server

Create a small entry file and run it with Node:

```bash
node server.js
```

For automatic restarts, use the package script or nodemon:

```bash
npm run dev
```

## Environment variables

Use environment variables for secrets and deployment settings:

```bash
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=https://app.example.com
REDIS_URL=redis://localhost:6379
STORAGE_PATH=./storage
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

Do not commit `.env` files containing secrets.

## Production server

Prefer the secure wrapper:

```javascript
import { Api, runSecureServer } from "flet-box-server";

const routes = Api({
  "/health": {
    GET: () => ({ status: "ok" }),
  },
});

runSecureServer(routes, {
  port: Number(process.env.PORT || 3000),
  docs: false,
  rateLimit: { max: 100, windowMs: 60_000 },
});
```

Set `docs: true` only when the generated documentation is safe to expose.

## Health check

Add a simple route for monitoring:

```javascript
"/health": {
  GET: () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
}
```

## Docker

A minimal Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t flet-box-server .
docker run --env-file .env -p 3000:3000 flet-box-server
```

## HTTPS and proxies

Put HTTPS at a trusted reverse proxy such as Nginx, Caddy, or a cloud load balancer. Forward only the headers your proxy controls and configure CORS explicitly.

## Scaling

The default cache, rate limiter, verification store, and security incident list use memory. For multiple server processes, move shared state to Redis or another shared service.

Queues also require Redis to coordinate jobs between workers.

## Production checklist

- Use Node.js 18 or newer.
- Run `npm ci --omit=dev` in deployment.
- Set a strong `JWT_SECRET`.
- Remove hardcoded admin credentials.
- Disable or protect `/docs` when it exposes internal routes.
- Set explicit CORS origins.
- Use HTTPS.
- Enable validation and rate limiting.
- Configure Redis for shared cache, sessions, queues, and verification codes.
- Configure persistent storage and database backups.
- Monitor `/health`, errors, latency, and resource usage.
- Do not log passwords, tokens, or private personal data.
