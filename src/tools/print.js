// tools/print.js
// Simple and clean logging system

/**
 * A thin wrapper around `console` that adds icons, optional timestamps, and
 * optional labels to log output. Objects are serialized to pretty-printed JSON.
 *
 * @param {*} message - Value to log. Objects are serialized with `JSON.stringify`.
 * @param {"log"|"warn"|"error"|"info"|"success"|"debug"} [type="log"] - Log level.
 *   Can also be passed as an options object for backwards compatibility.
 * @param {Object} [options={}] - Additional formatting options.
 * @param {boolean} [options.timestamp=false] - Prepend the current time.
 * @param {string} [options.label=""] - Bracket-wrapped label inserted before the message.
 * @param {boolean} [options.prefix=true] - Whether to prepend the level icon.
 * @returns {void}
 *
 * @example
 * print('Hello world')
 * print('User logged in', 'success')
 * print('Something went wrong', 'error')
 * print('Loading...', 'info', { timestamp: true })
 */
export const print = (message, type = "log", options = {}) => {
  // Allow the second argument to be an options object for backwards compatibility
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

  // Serialize objects to readable JSON
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

  // Dispatch to the appropriate console method for the log level
  console[config.method](finalMessage);
};

// Shorthand aliases (uncomment to enable individual exports):
// export const log = (msg) => print(msg, "log");
// export const warn = (msg) => print(msg, "warn");
// export const error = (msg) => print(msg, "error");
// export const info = (msg) => print(msg, "info");
// export const success = (msg) => print(msg, "success");
// export const debug = (msg) => print(msg, "debug");

export default print;
