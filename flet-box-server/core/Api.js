// core/Api.js - Process routes with automatic schema generation from examples

import { inferSchema } from "./inferSchema.js";

/**
 * Process route definitions into an internal structure.
 *
 * This function takes a routes object where each key is a path (e.g., "/users")
 * and the value is a configuration object. The configuration can either:
 * - Contain method-specific handlers (GET, POST, etc.) with optional middleware.
 * - Or a single handler with a default method (GET).
 *
 * It returns an object where each route is normalized with regex for parameter matching,
 * metadata, schemas (auto-generated from `example`), and responses (auto-generated from `responseExample`).
 *
 * @param {Object} routes - Route definitions.
 * @param {Object} routes.path - Configuration for a specific path.
 * @param {Function|Object} routes.path.GET - Handler function or object with handler, middleware, etc.
 * @param {Function|Object} routes.path.POST - Handler function or object.
 * @param {Function|Object} routes.path.PUT - Handler function or object.
 * @param {Function|Object} routes.path.DELETE - Handler function or object.
 * @param {Function|Object} routes.path.PATCH - Handler function or object.
 * @param {Array<Function>} [routes.path.middleware] - Global middleware for this route.
 * @param {string} [routes.path.tag] - Tag for grouping documentation.
 * @param {string} [routes.path.description] - Description for documentation.
 * @param {Object} [routes.path.schemas] - Manual schema definitions (merged with auto-generated).
 * @param {Object} [routes.path.responses] - Manual response definitions (merged with auto-generated).
 * @param {Object} [routes.path.example] - Example request body (auto-generates input schema).
 * @param {Object} [routes.path.responseExample] - Example response body (auto-generates output schema and 200 response).
 * @returns {Object} Processed routes with normalized structure.
 *
 * @example
 * // With automatic schema generation
 * const routes = Api({
 *   '/tasks': {
 *     POST: {
 *       handler: ({ title }) => ({ id: 1, title }),
 *       example: { title: 'New task' },
 *       responseExample: { id: 1, title: 'New task' }
 *     }
 *   }
 * });
 */
export const Api = (routes) => {
  const processed = {};
  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  // Default error responses that are added automatically
  const defaultErrorResponses = {
    400: { description: "Bad request - invalid input" },
    401: { description: "Unauthorized - authentication required" },
    403: { description: "Forbidden - insufficient permissions" },
    500: { description: "Internal server error" },
  };

  for (const [path, config] of Object.entries(routes)) {
    let tag = config.tag || "general";
    let description = config.description || "";
    const globalMiddleware = config.middleware || [];

    // Manual schemas & responses (user-defined)
    const manualSchemas = config.schemas || {};
    const manualResponses = config.responses || {};

    const hasMethodHandlers = methods.some((m) => config[m] !== undefined);

    if (hasMethodHandlers) {
      for (const method of methods) {
        const methodConfig = config[method];
        if (!methodConfig) continue;

        let handler;
        let middleware = [...globalMiddleware];
        let methodSchemas = { ...manualSchemas };
        let methodResponses = { ...manualResponses };

        if (typeof methodConfig === "function") {
          handler = methodConfig;
        } else if (typeof methodConfig === "object" && methodConfig !== null) {
          handler = methodConfig.handler;
          if (methodConfig.middleware) {
            middleware = middleware.concat(methodConfig.middleware);
          }
          if (methodConfig.tag) tag = methodConfig.tag;
          if (methodConfig.description) description = methodConfig.description;
          if (methodConfig.schemas) {
            Object.assign(methodSchemas, methodConfig.schemas);
          }
          if (methodConfig.responses) {
            Object.assign(methodResponses, methodConfig.responses);
          }

          // --- AUTO-GENERATE INPUT SCHEMA from `example` ---
          if (methodConfig.example && !methodConfig.schemas) {
            const exampleBody = methodConfig.example;
            const schemaName = `${method}${path.replace(/\//g, "_")}Schema`;
            const generatedSchema = inferSchema(exampleBody, schemaName);
            methodSchemas[schemaName] = generatedSchema;
            // Store for documentation
            methodConfig._example = exampleBody;
          }

          // --- AUTO-GENERATE RESPONSE SCHEMA & 200 RESPONSE from `responseExample` ---
          if (methodConfig.responseExample) {
            const responseExample = methodConfig.responseExample;
            const schemaName = `${method}${path.replace(/\//g, "_")}Response`;
            const generatedSchema = inferSchema(responseExample, schemaName);
            methodSchemas[schemaName] = generatedSchema;

            // If no manual 200 response, create one from the generated schema
            if (!methodResponses[200]) {
              methodResponses[200] = {
                description: "Success",
                schema: { $ref: `#/${schemaName}` },
              };
            }

            // Merge default error responses if not manually overridden
            for (const [code, defaultResp] of Object.entries(
              defaultErrorResponses,
            )) {
              if (!methodResponses[code]) {
                methodResponses[code] = defaultResp;
              }
            }
          }

          // Store for documentation
          if (methodConfig.responseExample) {
            methodConfig._responseExample = methodConfig.responseExample;
          }
        } else {
          throw new Error(
            `Invalid handler for ${method} ${path}: must be a function or an object with a handler property`,
          );
        }

        if (typeof handler !== "function") {
          throw new Error(`Handler for ${method} ${path} must be a function`);
        }

        // Build parameter regex for path params (e.g., /users/:id)
        const paramNames = [];
        const regexPath = path.replace(/:([^/]+)/g, (_, param) => {
          paramNames.push(param);
          return "([^/]+)";
        });
        const key = `${method}:${path}`;

        processed[key] = {
          method,
          handler,
          middleware,
          tag,
          description,
          regex: new RegExp(`^${regexPath}$`),
          paramNames,
          originalPath: path,
          schemas: methodSchemas,
          responses: methodResponses,
          _example: methodConfig._example || null,
          _responseExample: methodConfig._responseExample || null,
        };
      }
    } else {
      // --- SINGLE HANDLER (without explicit method) ---
      const method = (config.method || "GET").toUpperCase();
      let handler = config.handler;
      let middleware = [...globalMiddleware];
      let methodSchemas = { ...manualSchemas };
      let methodResponses = { ...manualResponses };

      if (typeof handler !== "function") {
        throw new Error(`Handler for ${path} must be a function`);
      }

      // Auto-generate input schema from `example`
      if (config.example && !config.schemas) {
        const exampleBody = config.example;
        const schemaName = `${method}${path.replace(/\//g, "_")}Schema`;
        const generatedSchema = inferSchema(exampleBody, schemaName);
        methodSchemas[schemaName] = generatedSchema;
        config._example = exampleBody;
      }

      // Auto-generate response schema & 200 response from `responseExample`
      if (config.responseExample) {
        const responseExample = config.responseExample;
        const schemaName = `${method}${path.replace(/\//g, "_")}Response`;
        const generatedSchema = inferSchema(responseExample, schemaName);
        methodSchemas[schemaName] = generatedSchema;

        if (!methodResponses[200]) {
          methodResponses[200] = {
            description: "Success",
            schema: { $ref: `#/${schemaName}` },
          };
        }

        for (const [code, defaultResp] of Object.entries(
          defaultErrorResponses,
        )) {
          if (!methodResponses[code]) {
            methodResponses[code] = defaultResp;
          }
        }
        config._responseExample = responseExample;
      }

      const paramNames = [];
      const regexPath = path.replace(/:([^/]+)/g, (_, param) => {
        paramNames.push(param);
        return "([^/]+)";
      });

      processed[path] = {
        method,
        handler,
        middleware,
        tag,
        description,
        regex: new RegExp(`^${regexPath}$`),
        paramNames,
        originalPath: path,
        schemas: methodSchemas,
        responses: methodResponses,
        _example: config._example || null,
        _responseExample: config._responseExample || null,
      };
    }
  }

  return processed;
};
