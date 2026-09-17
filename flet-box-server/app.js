import {
  Api,
  runServer,
  securityDB,
  securityCheck,
  authenticate,
  blockMalicious,
} from "./core/index.js";

// ============================================================
// 👤 USUARIO ADMIN (para login)
// ============================================================
try {
  securityDB.createUser("admin", "admin123", ["admin"]);
  console.log("✅ Usuario admin creado");
} catch (error) {
  console.log("ℹ️ Usuario admin ya existe");
}

// ============================================================
// 🚀 DEFINIR RUTAS CON GENERACIÓN AUTOMÁTICA DE SCHEMAS
// ============================================================
const routes = Api({
  // 🔑 LOGIN (sin protección)
  "/login": {
    POST: (req, res) => securityDB.tokenHandler(req, res),
    tag: "auth",
  },

  // ==========================================================
  // 📍 RUTAS CON PARÁMETROS Y GENERACIÓN AUTOMÁTICA
  // ==========================================================

  // GET /api/get/:id - No necesita body, solo parámetro
  "/api/get/:id": {
    GET: {
      handler: ({ id, req, query }) => ({
        success: true,
        message: "GET con parámetro en URL",
        params: { id },
        query: req.query || {},
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Obtiene un recurso por ID",
      // No necesita example porque GET no tiene body
    },
  },

  // POST /api/post/:id - Con body y generación automática
  "/api/post/:id": {
    POST: {
      handler: ({ id, req, body }) => ({
        success: true,
        message: "POST con parámetro en URL + body",
        params: { id },
        body: body || req.body || {},
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Crea un recurso con ID en URL",
      example: {
        // ← SCHEMA GENERADO AUTOMÁTICAMENTE
        name: "Juan Pérez",
        email: "juan@example.com",
        age: 30,
        active: true,
        tags: ["developer", "backend"],
      },
    },
  },

  // PUT /api/put/:id - Con body y generación automática
  "/api/put/:id": {
    PUT: {
      handler: ({ id, req, body }) => ({
        success: true,
        message: "PUT con parámetro en URL + body",
        params: { id },
        body: body || req.body || {},
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Actualiza un recurso completo por ID",
      example: {
        // ← SCHEMA GENERADO AUTOMÁTICAMENTE
        name: "María González",
        email: "maria@example.com",
        age: 28,
        active: false,
      },
    },
  },

  // PATCH /api/patch/:id - Con body parcial y generación automática
  "/api/patch/:id": {
    PATCH: {
      handler: ({ id, req, body }) => ({
        success: true,
        message: "PATCH con parámetro en URL + body",
        params: { id },
        body: body || req.body || {},
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Actualiza parcialmente un recurso por ID",
      example: {
        // ← SCHEMA GENERADO AUTOMÁTICAMENTE
        email: "nuevo@example.com",
      },
    },
  },

  // DELETE /api/delete/:id - No necesita body
  "/api/delete/:id": {
    DELETE: {
      handler: ({ id, req }) => ({
        success: true,
        message: "DELETE con parámetro en URL",
        params: { id },
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Elimina un recurso por ID",
    },
  },

  // ==========================================================
  // 📍 RUTAS FIJAS (SIN PARÁMETROS)
  // ==========================================================

  // GET /api/get
  "/api/get": {
    GET: {
      handler: ({ req, query }) => ({
        success: true,
        message: "GET sin parámetros",
        query: req.query || {},
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Obtiene todos los recursos",
    },
  },

  // GET /api/get-query - Con query params
  "/api/get-query": {
    GET: {
      handler: ({ req, query }) => ({
        success: true,
        message: "GET con query params",
        query: req.query || {},
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Obtiene recursos con filtros",
      // No necesita example porque GET usa query params, no body
    },
  },

  // POST /api/post - Con body y generación automática
  "/api/post": {
    POST: {
      handler: ({ req, body }) => ({
        success: true,
        message: "POST sin parámetros en URL",
        body: body || req.body || {},
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Crea un nuevo recurso",
      example: {
        // ← SCHEMA GENERADO AUTOMÁTICAMENTE
        title: "Nueva tarea",
        description: "Descripción de la tarea",
        completed: false,
        priority: 1,
      },
    },
  },

  // POST /api/upload
  "/api/upload": {
    POST: {
      handler: ({ req, body }) => ({
        success: true,
        message: "POST /api/upload",
        body: body || req.body || {},
        user: req.user?.username || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      middleware: [authenticate, blockMalicious, securityCheck],
      tag: "test",
      description: "Sube un archivo (multipart/form-data)",
      example: {
        // ← SCHEMA GENERADO AUTOMÁTICAMENTE
        file: "archivo.pdf",
        description: "Subida de archivo",
      },
    },
  },
});

// ============================================================
// 🚀 INICIAR SERVIDOR
// ============================================================
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🚀 SERVIDOR DE PRUEBAS DE SEGURIDAD CON SCHEMAS AUTOMÁTICOS");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

runServer(routes, {
  port: 8000,
  docs: true,
  cleanInput: false,
  security: false,
  rateLimit: null,
});

console.log("✅ Servidor iniciado correctamente");
console.log(`🌐 URL: http://localhost:8000`);
console.log(`📚 Documentación: http://localhost:8000/docs`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📋 ENDPOINTS CON ESQUEMAS GENERADOS:");
console.log("");
console.log("  🔑 AUTENTICACIÓN:");
console.log("     POST   /login");
console.log("");
console.log("  📡 ENDPOINTS DE PRUEBA CON SCHEMAS:");
console.log("     GET    /api/get");
console.log("     GET    /api/get/:id");
console.log("     GET    /api/get-query");
console.log(
  "     POST   /api/post      → SCHEMA: { title, description, completed, priority }",
);
console.log(
  "     POST   /api/post/:id  → SCHEMA: { name, email, age, active, tags }",
);
console.log(
  "     PUT    /api/put/:id   → SCHEMA: { name, email, age, active }",
);
console.log("     PATCH  /api/patch/:id → SCHEMA: { email }");
console.log("     DELETE /api/delete/:id");
console.log("     POST   /api/upload    → SCHEMA: { file, description }");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
