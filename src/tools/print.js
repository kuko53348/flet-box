// tools/print.js
// Sistema de logging simple y elegante

/**
 * Print function with simple syntax
 * @param {*} message - Message to print
 * @param {string} type - 'log' | 'warn' | 'error' | 'info' | 'success' | 'debug' (default: 'log')
 * @param {Object} options - Additional options (timestamp, label)
 * @returns {void}
 *
 * @example
 * print('Hello world')
 * print('User logged in', 'success')
 * print('Something went wrong', 'error')
 * print('Loading...', 'info', { timestamp: true })
 */
export const print = (message, type = "log", options = {}) => {
  // Si el segundo parámetro es un objeto (para compatibilidad)
  if (typeof type === "object") {
    options = type;
    type = "log";
  }

  const { timestamp = false, label = "", prefix = true } = options;

  const styles = {
    log: { color: "#94a3b8", icon: "📝", method: "log" },
    warn: { color: "#fbbf24", icon: "⚠️", method: "warn" },
    error: { color: "#f87171", icon: "❌", method: "error" },
    info: { color: "#60a5fa", icon: "ℹ️", method: "info" },
    success: { color: "#34d399", icon: "✅", method: "log" },
    debug: { color: "#c084fc", icon: "🐛", method: "debug" },
  };

  const config = styles[type] || styles.log;

  // Formatear mensaje si es objeto
  let formattedMessage = message;
  if (typeof message === "object" && message !== null) {
    formattedMessage = JSON.stringify(message, null, 2);
  }

  const parts = [];
  if (timestamp) parts.push(`[${new Date().toLocaleTimeString()}]`);
  if (prefix) parts.push(config.icon);
  if (label) parts.push(`[${label}]`);
  parts.push(formattedMessage);

  const finalMessage = parts.join(" ");

  // Usar el método de consola adecuado
  console[config.method](finalMessage);
};

// Shorthands más simples aún
// export const log = (msg) => print(msg, "log");
// export const warn = (msg) => print(msg, "warn");
// export const error = (msg) => print(msg, "error");
// export const info = (msg) => print(msg, "info");
// export const success = (msg) => print(msg, "success");
// export const debug = (msg) => print(msg, "debug");

export default print;
