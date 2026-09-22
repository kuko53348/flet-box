# Database and services

## Where should your data live?

A browser cannot run every database engine. The Node `better-sqlite3` library used by the server tools is a **native module** — it only runs on the server. Before choosing storage, decide where the data lives.

### Option 1 — Browser only (no API)

Data stays on the visitor's device. No server and no network calls.

- **localStorage** — ships with the framework as `src/services/Storage.js` (`saveData`, `getData`, `updateData`, `deleteData`, ...). Synchronous, ~5 MB per origin, string values; the helpers serialize objects for you.
- **IndexedDB** — asynchronous and much larger (gigabytes). Good for big records or offline files. Not bundled; call it directly or wrap it in a small helper.
- **SQLite in the browser** — sql.js or sqlite-wasm run real SQL as WebAssembly. Not bundled.

Choose this for drafts, per-device settings, offline caches, or single-user prototypes.

### Option 2 — SQLite API server

Data lives on your server and the UI talks to it over HTTP through the [API server section](#api-server-for-sqlite) below:

```text
UI widget (httpGet / httpPost / httpPut / httpDelete)
        ↓ HTTPS + JSON
Server routes (Api + runServer)
        ↓
SQLite (better-sqlite3 wrapper)
```

Choose this when data is shared between users or devices, must survive a browser reset, or is read by other systems.

### Option 3 — Hybrid

Use browser storage for offline cache and preferences, and sync with the API when the app is online.

## SQLite database

The current `Database` helper supports SQLite through the `SQLite` wrapper.

> **Current state:** the `flet-box-server` package declares `main: "index.js"` but no such file exists at its root, and `tools/index.js` points to a `modules/` folder that does not exist. The top-level imports below document the intended API; until the exports are fixed, use the working `SQLite` wrapper directly as shown in the [API server section](#api-server-for-sqlite).

```javascript
import { Database } from "flet-box-server";

const db = Database({
  type: "sqlite",
  path: "data/app.db",
  tables: {
    users: {
      id: "INTEGER PRIMARY KEY AUTOINCREMENT",
      name: "TEXT",
      email: "TEXT",
    },
  },
});
```

Use the generated table API:

```javascript
const result = db.users.insert({
  name: "Ada",
  email: "ada@example.com",
});

const users = db.users.readAll();
const ada = db.users.readWhere(["email", "ada@example.com"], true);
db.users.update({ name: "Ada Lovelace" }, ["email", "ada@example.com"]);
db.users.delete(["email", "ada@example.com"]);
```

The lower-level SQLite class also provides table creation, updates, deletes, structure inspection, and reads.

## API server for SQLite

Wire the SQLite wrapper into the route server so the UI can read and write data safely over HTTP. Every wrapper method returns `[status, messageOrData]` — `true` when the operation succeeded.

```javascript
// server/index.js
import { Api, runServer } from "flet-box-server/core/index.js";
import { SQLite } from "flet-box-server/tools/betterSqlite.js";

const db = new SQLite("data/app.db");
db.createTable("users", {
  id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  name: "TEXT",
  email: "TEXT",
});

const routes = Api({
  "/api/users": {
    GET: () => {
      const [ok, rows] = db.readAll("users");
      return { ok, items: ok ? rows : [] };
    },
    POST: ({ body }) => {
      const [ok, msg] = db.insert("users", {
        name: body.name,
        email: body.email,
      });
      return ok ? { ok } : { ok, error: msg };
    },
  },
  "/api/users/:id": {
    PUT: ({ id, body }) => {
      const [ok, msg] = db.update("users", { email: body.email }, ["id", id]);
      return ok ? { ok } : { ok, error: msg };
    },
    DELETE: ({ id }) => {
      const [ok, msg] = db.delete("users", ["id", id]);
      return ok ? { ok } : { ok, error: msg };
    },
  },
});

runServer(routes, { port: 3000, docs: true });
```

Consume the API from the UI with the framework HTTP client:

```javascript
// app.js (FletBox UI)
import { httpGet, httpPost, httpPut, httpDelete } from "flet-box";

const list = await httpGet("http://localhost:3000/api/users");
const created = await httpPost("http://localhost:3000/api/users", {
  body: { name: "Ada", email: "ada@example.com" },
});
const updated = await httpPut("http://localhost:3000/api/users/1", {
  body: { email: "ada@lovelace.dev" },
});
const removed = await httpDelete("http://localhost:3000/api/users/1");
```

Start the server, then open the auto-generated docs at `http://localhost:3000/docs` to browse and test the endpoints.

## Redis cache

Configure Redis with `REDIS_URL`:

```bash
REDIS_URL=redis://localhost:6379
```

Use the cache helpers:

```javascript
import { connectRedis, cacheSet, cacheGet, cacheDel } from "flet-box-server";

connectRedis();
await cacheSet("user:1", { name: "Ada" }, 3600);
const user = await cacheGet("user:1");
await cacheDel("user:1");
```

## File storage

The local storage module uses `STORAGE_PATH` or `./storage`:

```javascript
import { uploadFile, downloadFile, listFiles, deleteFile } from "flet-box-server";

const file = await uploadFile("avatars", "profile.jpg", imageBuffer);
const stream = await downloadFile(file.path);
const files = await listFiles("avatars");
await deleteFile(file.path);
```

Validate file names, sizes, and content types before storing uploads.

## Email

Configure SMTP credentials through environment variables in production. A simple send looks like:

```javascript
import { sendEmail } from "flet-box-server";

await sendEmail({
  sendTo: "user@example.com",
  title: "Welcome",
  personalCode: 123456,
  userName: "Ada",
});
```

Never commit passwords or application tokens in source code.

## SMS

Configure Twilio:

```bash
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

```javascript
import { sendSMS, sendVerificationCode, verifyPhone } from "flet-box-server";

await sendSMS("+123456789", "Your code is 123456");
const code = await sendVerificationCode("+123456789");
const valid = await verifyPhone("+123456789", code);
```

The default verification store is in memory. Use a shared persistent store when scaling.

## PDF

```javascript
import { generatePDF, savePDF, generateInvoice } from "flet-box-server";

const pdf = await generatePDF("<h1>Hello</h1>", { format: "A4" });
await savePDF(pdf, "output.pdf");

const invoice = await generateInvoice({
  number: "INV-001",
  date: "2026-01-01",
  client: "Ada Lovelace",
  items: [{ description: "Consulting", quantity: 2, price: 50 }],
  total: 100,
});
```

PDF generation uses Puppeteer and may require additional system configuration in deployment environments.

## CSV and Excel

```javascript
import { readCSV, writeCSV, readExcel, writeExcel } from "flet-box-server";

const users = await readCSV("users.csv");
await writeCSV("copy.csv", users);
const workbookRows = await readExcel("users.xlsx");
await writeExcel("copy.xlsx", workbookRows);
```

## Queues

Queues use Redis and Bull:

```javascript
import { createQueue, addJob, processQueue } from "flet-box-server";

createQueue("emails", { attempts: 3, backoff: 5000 });

processQueue("emails", async (job) => {
  await sendEmail(job.data);
});

await addJob("emails", {
  sendTo: "user@example.com",
  title: "Welcome",
});
```

Use queues for slow work that should not block an HTTP request.

## WebSockets

```javascript
import { createWebSocketServer } from "flet-box-server";

const wss = createWebSocketServer(3001);

wss.onConnection((ws) => {
  ws.send(JSON.stringify({ type: "connected" }));
});

wss.onMessage((ws, message) => {
  wss.broadcast({ type: "message", data: message });
});
```

The server supports connection, message, close, error, broadcast, and room operations.

## Speech and translation

Optional Google Cloud modules provide speech-to-text and text-to-speech. They require cloud credentials and should be configured outside source control.

```javascript
import { transcribeFile, speak, translate } from "flet-box-server";

const text = await transcribeFile("audio.mp3", { language: "en-US" });
const audio = await speak("Hello", "en");
const translated = await translate("hello", "es");
```

## Logging

```javascript
import { logger } from "flet-box-server";

logger.save("logs/app.log");
logger.info("Server started");
logger.warn("Slow request", { duration: 800 });
logger.error("Database error", { code: "DB_ERROR" });
logger.close();
```
