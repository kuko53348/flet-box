# Database and services

## SQLite database

The current `Database` helper supports SQLite through the `SQLite` wrapper.

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
