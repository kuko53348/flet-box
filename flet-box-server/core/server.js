// core/server.js - Con prioridad a rutas con parámetros
import http from "http";

export const createServer = (routes, options = {}) => {
  const { globalMiddleware = [], cors = false } = options;

  // Separar rutas con y sin parámetros
  const routesWithParams = Object.values(routes).filter(
    (r) => r.paramNames && r.paramNames.length > 0,
  );
  const routesWithoutParams = Object.values(routes).filter(
    (r) => !r.paramNames || r.paramNames.length === 0,
  );

  const server = http.createServer((req, res) => {
    // ---- Definir métodos de respuesta con CORS automático ----
    const sendJson = (data, status = 200) => {
      if (res.headersSent) return;
      if (cors) applyCorsHeaders(req, res);
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };
    res.json = sendJson;
    res.error = (message, status = 400) => sendJson({ error: message }, status);

    // ---- Manejo preflight OPTIONS ----
    if (cors && req.method === "OPTIONS") {
      applyCorsHeaders(req, res);
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    // Guardar query params en req.query para fácil acceso
    req.query = Object.fromEntries(url.searchParams);

    if (method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const contentType = req.headers["content-type"] || "";
        if (contentType.includes("application/json")) {
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch {
            return res.error("Invalid JSON body", 400);
          }
        } else {
          req.body = body ? body : {};
        }

        // ---- BUSCAR RUTA CON PRIORIDAD ----
        let matchedRoute = null;
        let params = {};

        // 1. PRIMERO: Rutas con parámetros (ej: /notes/:id)
        for (const route of routesWithParams) {
          if (route.method !== method) continue;
          if (route.regex) {
            const match = pathname.match(route.regex);
            if (match) {
              matchedRoute = route;
              route.paramNames.forEach((name, i) => {
                params[name] = match[i + 1];
              });
              break;
            }
          }
        }

        // 2. SEGUNDO: Rutas fijas (ej: /notes)
        if (!matchedRoute) {
          for (const route of routesWithoutParams) {
            if (route.method !== method) continue;
            if (route.originalPath === pathname) {
              matchedRoute = route;
              break;
            }
          }
        }

        if (!matchedRoute) {
          if (pathname === "/favicon.ico") {
            res.writeHead(204);
            res.end();
            return;
          }
          return res.error("Not found", 404);
        }

        // ---- Asignar _route para autoValidate ----
        req._route = matchedRoute;

        // ---- Combinar middlewares ----
        const allMiddleware = [
          ...globalMiddleware,
          ...(matchedRoute.middleware || []),
        ];

        let middlewareIndex = 0;

        const runMiddleware = () => {
          if (res.headersSent) return;
          if (middlewareIndex >= allMiddleware.length) {
            executeHandler();
            return;
          }

          const currentMw = allMiddleware[middlewareIndex];
          middlewareIndex++;

          try {
            const result = currentMw(req, res, () => {
              if (!res.headersSent) runMiddleware();
            });

            if (result && typeof result.then === "function") {
              result
                .then(() => {
                  if (!res.headersSent) runMiddleware();
                })
                .catch((err) => {
                  console.error(`❌ Middleware async error: ${err.message}`);
                  if (!res.headersSent) res.error(err.message, 500);
                });
            }
          } catch (err) {
            console.error(`❌ Middleware sync error: ${err.message}`);
            if (!res.headersSent) res.error(err.message, 500);
          }
        };

        const executeHandler = () => {
          if (res.headersSent) return;

          try {
            let result;
            if (matchedRoute.handler.length === 2) {
              result = matchedRoute.handler(req, res);
            } else {
              const context = {
                ...req.body,
                ...params,
                req,
                routes,
                query: req.query, // ← SOLUCIÓN: pasar query params
              };
              result = matchedRoute.handler(context);
            }

            if (result && typeof result.then === "function") {
              result
                .then((data) => {
                  if (!res.headersSent) res.json(data);
                })
                .catch((err) => {
                  console.error(`❌ Handler async error: ${err.message}`);
                  if (!res.headersSent) res.error(err.message, 500);
                });
            } else {
              if (!res.headersSent) res.json(result);
            }
          } catch (err) {
            console.error(`❌ Handler sync error: ${err.message}`);
            if (!res.headersSent) res.error(err.message, 500);
          }
        };

        runMiddleware();
      } catch (err) {
        console.error("❌ Uncaught error in request:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
      }
    });

    req.on("error", (err) => {
      console.error("❌ Request error:", err);
      if (!res.headersSent) res.error("Bad request", 400);
    });
  });

  return server;
};

// ---- Función auxiliar para CORS ----
function applyCorsHeaders(req, res) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key, X-Requested-With",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
}
