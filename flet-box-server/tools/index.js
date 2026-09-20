// index.js - Centralized export (fixed version)

// ============================================================
// CORE MODULES
// ============================================================
export * from "./core/Api.js";
export * from "./core/createDoc.js";
export * from "./core/rateLimit.js";
export * from "./core/runServer.js";
export * from "./core/security.js";
export * from "./core/server.js";

// ============================================================
// MODULES (formerly tools)
// ============================================================
export * from "./modules/auth/index.js";
export * from "./modules/database/index.js";
export * from "./modules/cache/index.js";
export * from "./modules/storage/index.js";
export * from "./modules/email/index.js";
export * from "./modules/sms/index.js";
export * from "./modules/queue/index.js";
export * from "./modules/pdf/index.js";
export * from "./modules/csv/index.js";
export * from "./modules/logger/index.js";
export * from "./modules/websocket/index.js";
export * from "./modules/speech/index.js";
export * from "./modules/translate/index.js";
export * from "./modules/validator/index.js";

// ============================================================
// DEFAULT EXPORT (for simplified imports)
// ============================================================
import * as core from "./core/index.js";
import * as modules from "./modules/index.js";

export default {
  ...core,
  ...modules,
};
