📄 COMPLETE DEMO.md - FLET-BOX-SERVER

Here is the complete demo.md file with ALL the features supported by Flet-Box-Server.

---

```markdown
# 🚀 Flet-Box-Server Demo

## Index
1. [Installation](#installation)
2. [Basic Configuration](#basic-configuration)
3. [Database](#database)
4. [API Routes](#api-routes)
5. [Authentication (JWT)](#authentication-jwt)
6. [Roles and Permissions](#roles-and-permissions)
7. [Refresh Token](#refresh-token)
8. [Email](#email)
9. [SMS](#sms)
10. [PDF](#pdf)
11. [CSV / Excel](#csv--excel)
12. [WebSocket](#websocket)
13. [Queues (Jobs)](#queues-jobs)
14. [Rate Limiting](#rate-limiting)
15. [Cache (Redis)](#cache-redis)
16. [File Uploads](#file-uploads)
17. [Text-to-Speech](#text-to-speech)
18. [Speech-to-Text](#speech-to-text)
19. [Translation](#translation)
20. [Validation](#validation)
21. [Logging](#logging)
22. [Scalability](#scalability)

---

## Installation

```bash
npm install flet-box-server
```

---

Basic Configuration

```javascript
// server.js
import { runServer, Api, Database } from 'flet-box-server';

// 1. Database
const db = Database({
    type: 'sqlite',
    path: 'database.db',
    tables: {
        users: {
            name: 'TEXT',
            email: 'TEXT',
            age: 'INTEGER'
        }
    }
});

// 2. Routes
const routes = Api({
    '/users': {
        method: 'GET',
        handler: () => db.users.readAll()
    },
    '/users': {
        method: 'POST',
        handler: ({ name, email, age }) => {
            return db.users.insert({ name, email, age });
        }
    }
});

// 3. Server
runServer(routes, {
    port: 3000,
    cors: true
});
```

---

Database

SQLite (full CRUD)

```javascript
import { Database } from 'flet-box-server';

const db = Database({
    type: 'sqlite',
    path: 'database.db',
    tables: {
        users: {
            name: 'TEXT',
            email: 'TEXT',
            age: 'INTEGER'
        },
        products: {
            name: 'TEXT',
            price: 'REAL',
            stock: 'INTEGER',
            category: 'TEXT'
        },
        orders: {
            userId: 'INTEGER',
            total: 'REAL',
            status: 'TEXT',
            created_at: 'TEXT'
        }
    }
});

// ========== CREATE ==========
// Insert user
const user = await db.users.insert({ 
    name: 'Juan', 
    email: 'juan@email.com', 
    age: 30 
});

// ========== READ ==========
// Read all
const users = await db.users.readAll();

// Read one by condition
const user = await db.users.readWhere(['email', 'juan@email.com'], true);

// Read last 10
const recent = await db.users.readLast('id', 10);

// ========== UPDATE ==========
// Update
await db.users.update(
    { name: 'Juan Carlos', age: 31 }, 
    ['id', 1]
);

// Update with multiple conditions
await db.users.updateMultiple(
    { status: 'active' },
    [['age', '>', 18], ['role', 'user']]
);

// ========== DELETE ==========
// Delete
await db.users.delete(['id', 1]);

// Delete with condition
await db.users.deleteWhere(
    ['status', 'inactive'],
    ['created_at', '<', '2024-01-01']
);

// ========== UTILITIES ==========
// Check table
const exists = await db.checkTable('users');

// List tables
const tables = await db.listTables();

// Add column
await db.addColumn('users', 'phone', 'TEXT');

// Get structure
const structure = await db.getTableStructure('users');

// Clear table
await db.clearTable('users');

// Drop table
await db.dropTable('users');
```

---

API Routes

```javascript
import { Api, GET, POST, PUT, DELETE } from 'flet-box-server';

const routes = Api({
    // ========== GET ==========
    '/users': {
        method: 'GET',
        handler: () => db.users.readAll()
    },

    '/users/:id': {
        method: 'GET',
        handler: ({ id }) => {
            return db.users.readWhere(['id', id], true);
        }
    },

    // ========== POST ==========
    '/users': {
        method: 'POST',
        handler: ({ name, email, age }) => {
            return db.users.insert({ name, email, age });
        }
    },

    // ========== PUT ==========
    '/users/:id': {
        method: 'PUT',
        handler: ({ id, name, email, age }) => {
            return db.users.update({ name, email, age }, ['id', id]);
        }
    },

    // ========== DELETE ==========
    '/users/:id': {
        method: 'DELETE',
        handler: ({ id }) => {
            return db.users.delete(['id', id]);
        }
    },

    // ========== QUERY PARAMS ==========
    '/search': {
        method: 'GET',
        handler: ({ q, limit = 10, page = 1 }) => {
            // /search?q=juan&limit=5&page=2
            const offset = (page - 1) * limit;
            return db.users.readWhere(['name', 'LIKE', `%${q}%`]);
        }
    }
});
```

---

Authentication (JWT)

```javascript
import { 
    hashPassword, 
    comparePassword, 
    signToken, 
    verifyToken,
    authenticate 
} from 'flet-box-server';

const routes = Api({
    // ========== REGISTRATION ==========
    '/auth/register': {
        method: 'POST',
        handler: async ({ name, email, password }) => {
            // Check whether it already exists
            const existing = await db.users.readWhere(['email', email], true);
            if (existing) {
                throw new Error('Email is already registered');
            }

            // Hash the password
            const hashedPassword = await hashPassword(password);

            // Save user
            const user = await db.users.insert({
                name,
                email,
                password: hashedPassword,
                role: 'user',
                created_at: new Date().toISOString()
            });

            // Generate token
            const token = signToken({ 
                userId: user.id, 
                email: user.email, 
                role: user.role 
            });

            return { user, token };
        }
    },

    // ========== LOGIN ==========
    '/auth/login': {
        method: 'POST',
        handler: async ({ email, password }) => {
            const user = await db.users.readWhere(['email', email], true);
            if (!user) {
                throw new Error('User not found');
            }

            const isValid = await comparePassword(password, user.password);
            if (!isValid) {
                throw new Error('Incorrect password');
            }

            const token = signToken({ 
                userId: user.id, 
                email: user.email, 
                role: user.role 
            });

            return { 
                user: { id: user.id, name: user.name, email: user.email }, 
                token 
            };
        }
    },

    // ========== PROFILE (requires authentication) ==========
    '/auth/profile': {
        method: 'GET',
        middleware: [authenticate],
        handler: ({ userId }) => {
            return db.users.readWhere(['id', userId], true);
        }
    },

    // ========== UPDATE PROFILE ==========
    '/auth/profile': {
        method: 'PUT',
        middleware: [authenticate],
        handler: ({ userId, name, email }) => {
            return db.users.update({ name, email }, ['id', userId]);
        }
    },

    // ========== CHANGE PASSWORD ==========
    '/auth/change-password': {
        method: 'POST',
        middleware: [authenticate],
        handler: async ({ userId, oldPassword, newPassword }) => {
            const user = await db.users.readWhere(['id', userId], true);
            const isValid = await comparePassword(oldPassword, user.password);
            if (!isValid) {
                throw new Error('Current password is incorrect');
            }

            const hashed = await hashPassword(newPassword);
            await db.users.update({ password: hashed }, ['id', userId]);
            return { message: 'Password updated' };
        }
    }
});
```

---

Roles and Permissions

```javascript
import { verifyToken } from 'flet-box-server';

// ========== ROLES MIDDLEWARE ==========
const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token required');
    
    const payload = verifyToken(token);
    if (payload.role !== 'admin') {
        throw new Error('Access denied: admin role required');
    }
    req.userId = payload.userId;
    next();
};

const isUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token required');
    
    const payload = verifyToken(token);
    if (payload.role !== 'user' && payload.role !== 'admin') {
        throw new Error('Access denied: user role required');
    }
    req.userId = payload.userId;
    next();
};

const routes = Api({
    // ========== ADMIN ONLY ==========
    '/admin/users': {
        method: 'GET',
        middleware: [authenticate, isAdmin],
        handler: () => db.users.readAll()
    },

    '/admin/users/:id': {
        method: 'DELETE',
        middleware: [authenticate, isAdmin],
        handler: ({ id }) => db.users.delete(['id', id])
    },

    '/admin/users/:id/role': {
        method: 'PUT',
        middleware: [authenticate, isAdmin],
        handler: ({ id, role }) => {
            return db.users.update({ role }, ['id', id]);
        }
    },

    // ========== USER OR ADMIN ==========
    '/profile': {
        method: 'GET',
        middleware: [authenticate, isUser],
        handler: ({ userId }) => db.users.readWhere(['id', userId], true)
    }
});
```

---

Refresh Token

```javascript
import { 
    signToken, 
    signRefreshToken, 
    verifyRefreshToken 
} from 'flet-box-server';

// ========== STORE REFRESH TOKENS ==========
// (Add the refresh_tokens table to the database)
db.addColumn('refresh_tokens', {
    userId: 'INTEGER',
    token: 'TEXT',
    expires_at: 'TEXT'
});

const routes = Api({
    // ========== LOGIN WITH REFRESH ==========
    '/auth/login': {
        method: 'POST',
        handler: async ({ email, password }) => {
            const user = await db.users.readWhere(['email', email], true);
            if (!user) throw new Error('User not found');

            const isValid = await comparePassword(password, user.password);
            if (!isValid) throw new Error('Incorrect password');

            const accessToken = signToken({ 
                userId: user.id, 
                email: user.email 
            });
            const refreshToken = signRefreshToken({ userId: user.id });

            // Save refresh token in DB
            await db.refresh_tokens.insert({
                userId: user.id,
                token: refreshToken,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });

            return { accessToken, refreshToken, user };
        }
    },

    // ========== REFRESH TOKEN ==========
    '/auth/refresh': {
        method: 'POST',
        handler: async ({ refreshToken }) => {
            // Verify refresh token
            const payload = verifyRefreshToken(refreshToken);
            
            // Verify that it exists in the DB
            const stored = await db.refresh_tokens.readWhere(['token', refreshToken], true);
            if (!stored) {
                throw new Error('Invalid refresh token');
            }

            // Generate new access token
            const newAccessToken = signToken({ 
                userId: payload.userId, 
                email: payload.email 
            });

            return { accessToken: newAccessToken };
        }
    },

    // ========== LOGOUT ==========
    '/auth/logout': {
        method: 'POST',
        middleware: [authenticate],
        handler: async ({ userId, refreshToken }) => {
            // Remove refresh token from DB
            await db.refresh_tokens.delete(['token', refreshToken]);
            return { message: 'Logout successful' };
        }
    }
});
```

---

Email

```javascript
import { sendEmail, EmailService } from 'flet-box-server';

// ========== SIMPLE FUNCTION ==========
const routes = Api({
    '/send-email': {
        method: 'POST',
        handler: ({ email, message }) => {
            return sendEmail({
                sendTo: email,
                title: 'New message',
                personalCode: Math.floor(Math.random() * 1000000),
                userName: message
            });
        }
    },

    // ========== EMAIL WITH CUSTOM HTML ==========
    '/send-email-custom': {
        method: 'POST',
        handler: ({ email, subject, html }) => {
            return sendEmail({
                sendTo: email,
                title: subject,
                html: html
            });
        }
    },

    // ========== EMAIL WITH TEMPLATE ==========
    '/send-welcome': {
        method: 'POST',
        handler: async ({ email, name }) => {
            const html = `
                <h1>Welcome, ${name}!</h1>
                <p>Thank you for signing up on our platform.</p>
                <a href="https://miapp.com/verify">Verify email</a>
            `;
            return sendEmail({
                sendTo: email,
                title: 'Welcome to My App',
                html
            });
        }
    }
});

// ========== EMAIL CLASS (more control) ==========
const emailService = new EmailService({
    user: 'your-email@gmail.com',
    password: 'your-app-password'
});

await emailService.send({
    sendTo: 'user@email.com',
    title: 'Subject',
    personalCode: 123456,
    userName: 'Juan'
});
```

---

SMS

```javascript
import { sendSMS, sendVerificationCode, verifyPhone, sendBulkSMS } from 'flet-box-server';

const routes = Api({
    // ========== SEND SMS ==========
    '/sms/send': {
        method: 'POST',
        handler: ({ phone, message }) => {
            return sendSMS(phone, message);
        }
    },

    // ========== SEND VERIFICATION CODE ==========
    '/sms/verify-send': {
        method: 'POST',
        handler: async ({ phone }) => {
            const code = await sendVerificationCode(phone);
            return { message: 'Code sent', code };
        }
    },

    // ========== VERIFY CODE ==========
    '/sms/verify-check': {
        method: 'POST',
        handler: async ({ phone, code }) => {
            const isValid = await verifyPhone(phone, code);
            return { valid: isValid };
        }
    },

    // ========== BULK SMS ==========
    '/sms/bulk': {
        method: 'POST',
        handler: async ({ numbers, message }) => {
            const results = await sendBulkSMS(numbers, message);
            return results;
        }
    }
});
```

---

PDF

```javascript
import { generatePDF, generateInvoice, generateReceipt, savePDF } from 'flet-box-server';

const routes = Api({
    // ========== PDF FROM HTML ==========
    '/pdf/generate': {
        method: 'POST',
        handler: async ({ html }) => {
            const pdf = await generatePDF(html);
            return { pdf: pdf.toString('base64') };
        }
    },

    // ========== INVOICE ==========
    '/pdf/invoice': {
        method: 'POST',
        handler: async ({ orderId }) => {
            const order = await db.orders.readWhere(['id', orderId], true);
            const user = await db.users.readWhere(['id', order.userId], true);
            const items = await db.orderItems.readWhere(['orderId', orderId]);

            const pdf = await generateInvoice({
                number: order.invoiceNumber,
                date: order.createdAt,
                client: user.name,
                items: items.map(item => ({
                    description: item.productName,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: order.total,
                currency: 'USD',
                company: 'My Company S.A.',
                notes: 'Thank you for your purchase'
            });

            return { pdf: pdf.toString('base64') };
        }
    },

    // ========== RECEIPT ==========
    '/pdf/receipt': {
        method: 'POST',
        handler: async ({ paymentId }) => {
            const payment = await db.payments.readWhere(['id', paymentId], true);
            const user = await db.users.readWhere(['id', payment.userId], true);

            const pdf = await generateReceipt({
                number: payment.receiptNumber,
                date: payment.createdAt,
                client: user.name,
                items: [{ description: payment.description, price: payment.amount }],
                total: payment.amount,
                currency: 'USD',
                paymentMethod: payment.method,
                transactionId: payment.transactionId
            });

            return { pdf: pdf.toString('base64') };
        }
    }
});
```

---

CSV / Excel

```javascript
import { readCSV, writeCSV, readExcel, writeExcel } from 'flet-box-server';

const routes = Api({
    // ========== IMPORT CSV ==========
    '/csv/import': {
        method: 'POST',
        handler: async ({ filePath }) => {
            const data = await readCSV(filePath);
            return { imported: data.length, data };
        }
    },

    // ========== EXPORT CSV ==========
    '/csv/export': {
        method: 'GET',
        handler: async () => {
            const users = await db.users.readAll();
            const csv = await writeCSV('exports/users.csv', users);
            return { file: 'exports/users.csv', count: users.length };
        }
    },

    // ========== IMPORT EXCEL ==========
    '/excel/import': {
        method: 'POST',
        handler: async ({ filePath }) => {
            const data = await readExcel(filePath);
            return { imported: data.length, data };
        }
    },

    // ========== EXPORT EXCEL ==========
    '/excel/export': {
        method: 'GET',
        handler: async () => {
            const users = await db.users.readAll();
            await writeExcel('exports/users.xlsx', users);
            return { file: 'exports/users.xlsx', count: users.length };
        }
    }
});
```

---

WebSocket

```javascript
import { createWebSocketServer } from 'flet-box-server';

// ========== WEBSOCKET SERVER ==========
const wss = createWebSocketServer(3001);

// ========== CONNECTION ==========
wss.onConnection((ws, req) => {
    console.log('🟢 Client connected');
    ws.send(JSON.stringify({ type: 'connected', message: 'Welcome!' }));
});

// ========== MESSAGES ==========
wss.onMessage((ws, message) => {
    console.log('📩 Message:', message);

    // General chat
    if (message.type === 'chat') {
        wss.broadcast({
            type: 'chat',
            user: message.user,
            message: message.message,
            timestamp: new Date().toISOString()
        });
    }

    // Join room
    if (message.type === 'join-room') {
        wss.joinRoom(ws, message.room);
        wss.to(message.room, {
            type: 'notification',
            message: `${message.user} joined the room`
        });
    }

    // Room message
    if (message.type === 'room-message') {
        wss.to(message.room, {
            type: 'room-message',
            user: message.user,
            message: message.message,
            room: message.room
        });
    }

    // Private message
    if (message.type === 'private') {
        wss.sendTo(message.to, {
            type: 'private',
            from: message.from,
            message: message.message
        });
    }
});

// ========== DISCONNECTION ==========
wss.onClose((ws) => {
    console.log('🔴 Client disconnected');
});

// ========== ERRORS ==========
wss.onError((ws, error) => {
    console.error('⚠️ WebSocket error:', error.message);
});

// ========== ROUTES WITH WEBSOCKET ==========
const routes = Api({
    '/ws/status': {
        method: 'GET',
        handler: () => ({
            clients: wss.getClientCount(),
            rooms: Array.from(wss.rooms.keys())
        })
    }
});
```

---

Queues (Jobs)

```javascript
import { createQueue, addJob, processQueue, getQueueStatus } from 'flet-box-server';

// ========== CREATE QUEUES ==========
const emailQueue = createQueue('email', {
    attempts: 3,
    backoff: 5000
});

const reportQueue = createQueue('report', {
    attempts: 2,
    backoff: 10000
});

// ========== PROCESS QUEUE ==========
processQueue('email', async (job) => {
    const { to, subject, html } = job.data;
    await sendEmail({ sendTo: to, title: subject, html });
    console.log(`✅ Email sent to ${to}`);
});

processQueue('report', async (job) => {
    const { type, params } = job.data;
    const report = await generateReport(type, params);
    await savePDF(report, `reports/${job.id}.pdf`);
    console.log(`✅ Report generated: ${job.id}`);
});

// ========== ROUTES ==========
const routes = Api({
    // ========== SEND EMAIL WITH QUEUE ==========
    '/send-email-queue': {
        method: 'POST',
        handler: async ({ email, subject, message }) => {
            await addJob('email', {
                to: email,
                subject: subject,
                html: `<h1>${message}</h1>`
            });
            return { message: 'Email queued' };
        }
    },

    // ========== GENERATE REPORT ==========
    '/generate-report': {
        method: 'POST',
        handler: async ({ type, params }) => {
            await addJob('report', { type, params });
            return { message: 'Report queued' };
        }
    },

    // ========== QUEUE STATUS ==========
    '/queue/status': {
        method: 'GET',
        handler: async () => {
            const emailStatus = await getQueueStatus('email');
            const reportStatus = await getQueueStatus('report');
            return { email: emailStatus, report: reportStatus };
        }
    },

    // ========== CLEAN QUEUE ==========
    '/queue/clean': {
        method: 'POST',
        handler: async () => {
            await cleanQueue('email', 60000);
            return { message: 'Queue cleaned' };
        }
    }
});
```

---

Rate Limiting

```javascript
import { rateLimit, rateLimitPerMinute, rateLimitPerHour } from 'flet-box-server';

const routes = Api({
    // ========== LIMIT PER MINUTE ==========
    '/auth/login': {
        method: 'POST',
        middleware: [rateLimit({ window: 60, max: 5 })], // 5 attempts/minute
        handler: async ({ email, password }) => {
            // Login logic...
        }
    },

    // ========== LIMIT PER HOUR ==========
    '/api/public': {
        method: 'GET',
        middleware: [rateLimitPerHour(1000)],
        handler: () => ({ data: 'Public data' })
    },

    // ========== CUSTOM LIMIT ==========
    '/api/premium': {
        method: 'GET',
        middleware: [
            rateLimit({ 
                window: 60, 
                max: 100,
                message: 'Too many requests, please wait a moment'
            })
        ],
        handler: () => ({ data: 'Premium data' })
    },

    // ========== CUSTOM KEY (per user) ==========
    '/api/user-data': {
        method: 'GET',
        middleware: [
            authenticate,
            rateLimit({
                window: 60,
                max: 20,
                keyGenerator: (req) => req.userId || req.ip
            })
        ],
        handler: ({ userId }) => {
            return db.users.readWhere(['id', userId], true);
        }
    }
});
```

---

Cache (Redis)

```javascript
import { 
    connectRedis, 
    cacheSet, 
    cacheGet, 
    cacheDel, 
    cacheKeys,
    cached 
} from 'flet-box-server';

// ========== CONNECT REDIS ==========
connectRedis('redis://localhost:6379');

const routes = Api({
    // ========== WITH CACHE ==========
    '/products': {
        method: 'GET',
        handler: async () => {
            // Try cache
            let products = await cacheGet('products');
            if (products) {
                return { fromCache: true, data: products };
            }

            // Database
            products = await db.products.readAll();
            await cacheSet('products', products, 3600); // 1 hour

            return { fromCache: false, data: products };
        }
    },

    // ========== PRODUCT BY ID (with cache) ==========
    '/products/:id': {
        method: 'GET',
        handler: async ({ id }) => {
            const cacheKey = `product:${id}`;
            let product = await cacheGet(cacheKey);
            if (product) {
                return { fromCache: true, data: product };
            }

            product = await db.products.readWhere(['id', id], true);
            await cacheSet(cacheKey, product, 3600);

            return { fromCache: false, data: product };
        }
    },

    // ========== INVALIDATE CACHE ==========
    '/products': {
        method: 'POST',
        handler: async ({ name, price }) => {
            const product = await db.products.insert({ name, price });
            await cacheDel('products'); // Invalidate list
            return product;
        }
    },

    // ========== CLEAR CACHE ==========
    '/cache/clear': {
        method: 'POST',
        handler: async () => {
            await cacheDelPattern('product:*');
            await cacheDel('products');
            return { message: 'Cache cleared' };
        }
    },

    // ========== CACHE STATISTICS ==========
    '/cache/stats': {
        method: 'GET',
        handler: async () => {
            const keys = await cacheKeys('*');
            return { totalKeys: keys.length, keys };
        }
    }
});

// ========== CACHE DECORATOR ==========
class ProductService {
    @cached(3600)
    async getProducts() {
        return db.products.readAll();
    }

    @cached(3600)
    async getProduct(id) {
        return db.products.readWhere(['id', id], true);
    }
}
```

---

File Uploads

```javascript
import { uploadFile, downloadFile, listFiles, deleteFile, getFileInfo } from 'flet-box-server';

const routes = Api({
    // ========== UPLOAD FILE ==========
    '/upload': {
        method: 'POST',
        middleware: [authenticate],
        handler: async ({ file, fileName, folder = 'uploads' }) => {
            const result = await uploadFile(folder, fileName, file);
            return result;
        }
    },

    // ========== UPLOAD KEEPING ORIGINAL NAME ==========
    '/upload/keep-name': {
        method: 'POST',
        middleware: [authenticate],
        handler: async ({ file, fileName }) => {
            const result = await uploadFile('uploads', fileName, file, { keepName: true });
            return result;
        }
    },

    // ========== LIST FILES ==========
    '/files': {
        method: 'GET',
        middleware: [authenticate],
        handler: async ({ folder = 'uploads' }) => {
            return listFiles(folder);
        }
    },

    // ========== LIST RECURSIVELY ==========
    '/files/all': {
        method: 'GET',
        middleware: [authenticate],
        handler: async ({ folder = 'uploads' }) => {
            return listFiles(folder, { recursive: true });
        }
    },

    // ========== DOWNLOAD FILE ==========
    '/files/:path': {
        method: 'GET',
        handler: async ({ path }) => {
            return downloadFile(path);
        }
    },

    // ========== FILE INFORMATION ==========
    '/files/:path/info': {
        method: 'GET',
        handler: async ({ path }) => {
            return getFileInfo(path);
        }
    },

    // ========== DELETE FILE ==========
    '/files/:path': {
        method: 'DELETE',
        middleware: [authenticate],
        handler: async ({ path }) => {
            const deleted = await deleteFile(path);
            return { deleted };
        }
    }
});
```

---

Text-to-Speech

```javascript
import { textToSpeech, saveAudio, speak } from 'flet-box-server';

const routes = Api({
    // ========== TEXT TO SPEECH ==========
    '/tts': {
        method: 'POST',
        handler: async ({ text, language = 'es-ES', voice = 'es-ES-Neural2-D' }) => {
            const audio = await textToSpeech(text, {
                language,
                voice,
                speed: 1.0,
                pitch: 0.0
            });
            return { audio: audio.toString('base64') };
        }
    },

    // ========== TTS WITH PARAMETERS ==========
    '/tts/advanced': {
        method: 'POST',
        handler: async ({ 
            text, 
            language, 
            voice, 
            speed = 1.0, 
            pitch = 0.0 
        }) => {
            const audio = await textToSpeech(text, {
                language,
                voice,
                speed,
                pitch
            });
            return { audio: audio.toString('base64') };
        }
    },

    // ========== QUICK TTS ==========
    '/tts/quick': {
        method: 'POST',
        handler: async ({ text, lang = 'es' }) => {
            const audio = await speak(text, lang);
            return { audio: audio.toString('base64') };
        }
    }
});
```

---

Speech-to-Text

```javascript
import { speechToText, transcribeFile, listen } from 'flet-box-server';

const routes = Api({
    // ========== AUDIO TO TEXT ==========
    '/stt': {
        method: 'POST',
        handler: async ({ audio, language = 'es-ES' }) => {
            const text = await speechToText(audio, {
                language,
                encoding: 'MP3',
                sampleRate: 16000,
                punctuation: true
            });
            return { text };
        }
    },

    // ========== TRANSCRIBE FILE ==========
    '/stt/file': {
        method: 'POST',
        handler: async ({ filePath, language = 'es-ES' }) => {
            const text = await transcribeFile(filePath, { language });
            return { text };
        }
    },

    // ========== QUICK STT ==========
    '/stt/quick': {
        method: 'POST',
        handler: async ({ audio, lang = 'es' }) => {
            const text = await listen(audio, lang);
            return { text };
        }
    },

    // ========== STT WITH PHRASES ==========
    '/stt/custom': {
        method: 'POST',
        handler: async ({ audio, language = 'es-ES', phrases = [] }) => {
            const text = await speechToText(audio, {
                language,
                phrases,
                punctuation: true,
                profanity: false
            });
            return { text };
        }
    }
});
```

---

Translation

```javascript
import { translate, translateWithCode } from 'flet-box-server';

const routes = Api({
    // ========== TRANSLATE TEXT ==========
    '/translate': {
        method: 'POST',
        handler: async ({ text, target, source = 'auto' }) => {
            const translated = await translate(text, target, source);
            return { original: text, translated, target, source };
        }
    },

    // ========== TRANSLATE WITH CODE ==========
    '/translate/code': {
        method: 'POST',
        handler: async ({ text, target, source = 'auto' }) => {
            const translated = await translateWithCode(text, target, source);
            return { original: text, translated };
        }
    },

    // ========== BULK TRANSLATION ==========
    '/translate/bulk': {
        method: 'POST',
        handler: async ({ texts, target, source = 'auto' }) => {
            const results = await Promise.all(
                texts.map(text => translate(text, target, source))
            );
            return { original: texts, translated: results };
        }
    }
});
```

---

Validation

```javascript
import { validate, isEmail, isPhone, sanitizeString } from 'flet-box-server';

const routes = Api({
    // ========== VALIDATE DATA ==========
    '/validate': {
        method: 'POST',
        handler: ({ data }) => {
            const schema = {
                name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
                email: { type: 'email', required: true },
                age: { type: 'number', required: true, min: 18, max: 99 },
                phone: { type: 'phone' }
            };

            const result = validate(data, schema);
            return result;
        }
    },

    // ========== VALIDATE EMAIL ==========
    '/validate/email': {
        method: 'POST',
        handler: ({ email }) => {
            return { valid: isEmail(email) };
        }
    },

    // ========== VALIDATE PHONE ==========
    '/validate/phone': {
        method: 'POST',
        handler: ({ phone }) => {
            return { valid: isPhone(phone) };
        }
    },

    // ========== SANITIZE ==========
    '/sanitize': {
        method: 'POST',
        handler: ({ text, options = {} }) => {
            const sanitized = sanitizeString(text, {
                escapeHtml: true,
                trim: true,
                ...options
            });
            return { original: text, sanitized };
        }
    }
});
```

---

Logging

```javascript
import { logger } from 'flet-box-server';

// ========== CONFIGURE LOGGER ==========
logger.save('logs/app.log');

const routes = Api({
    // ========== AUTOMATIC LOGS ==========
    '/users': {
        method: 'GET',
        handler: () => {
            logger.info('Users queried');
            return db.users.readAll();
        }
    },

    '/users': {
        method: 'POST',
        handler: ({ name, email }) => {
            logger.info(`User created: ${email}`);
            return db.users.insert({ name, email });
        }
    },

    // ========== ERROR LOGS ==========
    '/error-test': {
        method: 'GET',
        handler: () => {
            try {
                throw new Error('Test error');
            } catch (error) {
                logger.error('Error in /error-test', { error: error.message });
                throw error;
            }
        }
    },

    // ========== REQUEST LOGS ==========
    // (A global middleware can be used)
    '/api/*': {
        method: 'GET',
        middleware: [
            (req, res, next) => {
                logger.request(req.method, req.url, 200);
                next();
            }
        ],
        handler: () => ({ message: 'OK' })
    },

    // ========== GET LOGS ==========
    '/logs': {
        method: 'GET',
        handler: async () => {
            const logs = await readFile('logs/app.log', 'utf-8');
            return { logs: logs.split('\n').filter(Boolean) };
        }
    }
});
```

---

Scalability

Cluster (Multi-core)

```javascript
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`🔄 Starting ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`❌ Worker ${worker.id} died, restarting...`);
        cluster.fork();
    });
} else {
    // Application code
    import('./server.js');
}
```

Docker

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build
docker build -t flet-box-server .

# Run
docker run -p 3000:3000 flet-box-server

# Docker Compose
docker-compose up -d
```

```yaml
# docker-compose.yml
version: '3'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - db

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  db:
    image: sqlite:latest
    volumes:
      - ./data:/data
```

---

📋 Summary

Complete Features

Module Status Files
Database ✅ SQLite, PostgreSQL, MySQL
Authentication ✅ JWT, Refresh Tokens, Roles
Email ✅ Nodemailer, Gmail SMTP
SMS ✅ Twilio
PDF ✅ Puppeteer, Invoices, Receipts
CSV/Excel ✅ csv-parse, xlsx
WebSocket ✅ ws, Rooms, Broadcast
Queues ✅ Bull, Redis
Rate Limit ✅ Memory, Redis
Cache ✅ Redis
Storage ✅ Local files
TTS ✅ Google Cloud TTS
STT ✅ Google Cloud STT
Translation ✅ Google Translate
Validation ✅ Schema-based
Logging ✅ Files, Colors
Scalability ✅ Cluster, Docker

---

🚀 Run

```bash
# Install
npm install flet-box-server

# Create server.js (copy from this demo)
# Run
node server.js

# With nodemon (development)
npm install -g nodemon
nodemon server.js
```

---

📖 More Information

· 📦 NPM Package
· 🐙 GitHub
· 📚 Documentation

---

FLET-BOX-SERVER: Simple, Professional, Scalable. 🚀

```

---

## 🎯 **SUMMARY**

This `demo.md` contains:

1. ✅ **22 complete sections**
2. ✅ **All modules** documented
3. ✅ **Functional examples** ready to copy
4. ✅ **From the basics to advanced topics**
5. ✅ **Scalability** (Cluster, Docker)
6. ✅ **Everything in a single file**

**With this, anyone can build a complete API with Flet-Box-Server.** 🚀
