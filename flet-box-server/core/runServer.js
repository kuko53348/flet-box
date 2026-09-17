// core/runServer.js - Server orchestrator
import { createServer } from "./server.js";
import { createDocsHandler } from "./createDoc.js";
import { securityCheck } from "./security/middleware.js";
import { rateLimit } from "./rateLimit.js";
import { autoValidate } from "./autoValidate.js";
import { blockMalicious } from "./security/detector.js";

export const runServer = (
  routes,
  {
    port = 3000,
    cors = false,
    docs = true,
    security = false,
    rateLimit: rateLimitOptions = null,
    globalMiddleware = [],
    useExpress = false,
    cleanInput = true,
    validate = false, // Activa autoValidate
    block = false, // Activa blockMalicious
  } = {},
) => {
  // 📚 Documentación
  if (docs) {
    routes["/docs"] = {
      method: "GET",
      handler: createDocsHandler(routes),
      middleware: [],
      tag: "docs",
      description: "Automatic API documentation",
      originalPath: "/docs",
    };
  }

  const finalGlobalMiddleware = [...globalMiddleware];

  // 🧹 Limpieza automática (cleanInput)
  if (cleanInput) {
    finalGlobalMiddleware.push(securityCheck);
    console.log("🧹 Input sanitization enabled globally");
  }

  // 🔒 Seguridad global (security: true)
  if (security) {
    if (!finalGlobalMiddleware.includes(securityCheck)) {
      finalGlobalMiddleware.push(securityCheck);
    }
    console.log("🔒 Security enabled globally");
  }

  // ✅ Validación automática de esquemas (validate: true)
  if (validate) {
    finalGlobalMiddleware.push(autoValidate);
    console.log("✅ Automatic schema validation enabled");
  }

  // 🛡️ Bloqueo de contenido malicioso (block: true)
  if (block) {
    finalGlobalMiddleware.push(blockMalicious);
    console.log("🛡️ Malicious content blocking enabled");
  }

  // 📊 Rate limit global
  if (rateLimitOptions) {
    const limiter = rateLimit(rateLimitOptions);
    finalGlobalMiddleware.push(limiter);
    console.log(`📊 Rate limit enabled globally: ${rateLimitOptions.max}/min`);
  }

  // 🚀 Servidor (nativo o Express)
  if (useExpress) {
    (async () => {
      try {
        await import("express");
      } catch {
        console.error("❌ Express is not installed!");
        console.error("   To use Express mode, run: npm install express");
        console.error("   Or set useExpress: false to use native server.");
        process.exit(1);
      }

      try {
        const { createExpressServer } = await import("./expressServer.js");
        const app = createExpressServer(routes, {
          cors,
          globalMiddleware: finalGlobalMiddleware,
        });

        app.listen(port, () => {
          console.log(`🚀 Express server running on http://localhost:${port}`);
          console.log(`📡 Routes:`);
          for (const [, route] of Object.entries(routes)) {
            if (route.originalPath !== "_getDocs") {
              console.log(`   ${route.method.padEnd(6)} ${route.originalPath}`);
            }
          }
          if (docs) {
            console.log(`   📚 Documentation at http://localhost:${port}/docs`);
          }
        });
      } catch (error) {
        console.error("❌ Error starting Express:", error.message);
        process.exit(1);
      }
    })();

    return;
  }

  // 🚀 MODO FLETBOX NATIVO
  const server = createServer(routes, {
    cors, // ← pasamos CORS al servidor nativo
    globalMiddleware: finalGlobalMiddleware,
  });
  server.listen(port, () => {
    console.log(`🚀 FletBox native server running on http://localhost:${port}`);
    console.log(`📡 Routes:`);
    for (const [, route] of Object.entries(routes)) {
      if (route.originalPath !== "_getDocs") {
        console.log(`   ${route.method.padEnd(6)} ${route.originalPath}`);
      }
    }
    if (docs) {
      console.log(`   📚 Documentation at http://localhost:${port}/docs`);
    }
  });

  return server;
};
