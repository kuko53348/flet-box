// core/security/index.js - Export all security modules
export * from "./headers.js";
export * from "./jwt.js";
export * from "./validation.js";
export * from "./roles.js";
export * from "./blacklist.js";
export * from "./sanitize.js";
export * from "./middleware.js";
export * from "./database.js";
export * from "./auth.js";
export * from "./detector.js"; // ← ya estaba

// Default export
import * as headers from "./headers.js";
import * as jwt from "./jwt.js";
import * as validation from "./validation.js";
import * as roles from "./roles.js";
import * as blacklist from "./blacklist.js";
import * as sanitize from "./sanitize.js";
import * as middleware from "./middleware.js";
import * as database from "./database.js";
import * as auth from "./auth.js";
import * as detector from "./detector.js";

export default {
  ...headers,
  ...jwt,
  ...validation,
  ...roles,
  ...blacklist,
  ...sanitize,
  ...middleware,
  ...database,
  ...auth,
  ...detector,
};
