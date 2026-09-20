// core/expressServer.js - Express server adapter for FletBox
import express from "express";

export const createExpressServer = (routes, options = {}) => {
  const { cors = false, globalMiddleware = [] } = options;

  const app = express();
  app.use(express.json());

  if (cors) {
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
      }
      next();
    });
  }

  if (globalMiddleware.length > 0) {
    app.use(globalMiddleware);
  }

  for (const [, route] of Object.entries(routes)) {
    if (route.originalPath === "/docs" || route.originalPath === "_getDocs")
      continue;

    const method = route.method.toLowerCase();
    const path = route.originalPath;
    const handlers = [...route.middleware];

    // Middleware to assign _route and add query to the context
    handlers.push((req, res, next) => {
      req._route = route;
      next();
    });

    handlers.push(async (req, res) => {
      try {
        const context = {
          ...req.body,
          ...req.params,
          req,
          routes,
          query: req.query, // ← ADDED
        };
        const result = route.handler(context);
        if (result && typeof result.then === "function") {
          const data = await result;
          res.json(data);
        } else {
          res.json(result);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app[method](path, ...handlers);
  }

  if (routes["/docs"]) {
    const docsHandler = routes["/docs"].handler;
    app.get("/docs", (req, res) => {
      const result = docsHandler({ req });
      res.json(result);
    });
  }

  return app;
};

export default createExpressServer;
