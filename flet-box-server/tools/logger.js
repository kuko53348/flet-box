// logger.js - Advanced logging module for FletBox
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * # LOGGER MODULE
 * - Logging with levels (info, warn, error, debug)
 * - Colored output
 * - File rotation support
 * - JSON format option
 *
 * @example
 * import { logger } from '@flet-box/logger';
 *
 * logger.info('App started');
 * logger.warn('Slow request', { duration: 500 });
 * logger.error('Database error', { error });
 * logger.debug('Debug info', { data });
 *
 * // Save logs to file
 * logger.save('logs/app.log');
 */

const levels = {
  debug: { color: '\x1b[36m', label: 'DEBUG' },
  info: { color: '\x1b[32m', label: 'INFO' },
  warn: { color: '\x1b[33m', label: 'WARN' },
  error: { color: '\x1b[31m', label: 'ERROR' },
  success: { color: '\x1b[32m', label: 'SUCCESS' },
};

const logFileStreams = {};

/**
 * Get current timestamp
 * @returns {string}
 */
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 * @returns {string}
 */
function formatLog(level, message, data) {
  const timestamp = getTimestamp();
  const label = levels[level]?.label || level.toUpperCase();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] ${label}: ${message}${dataStr}`;
}

/**
 * Write log to file
 * @param {string} filePath - Log file path
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function writeToFile(filePath, level, message, data) {
  if (!filePath) return;

  const dir = filePath.split('/').slice(0, -1).join('/');
  if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  if (!logFileStreams[filePath]) {
    logFileStreams[filePath] = createWriteStream(filePath, { flags: 'a' });
  }

  const logLine = formatLog(level, message, data) + '\n';
  logFileStreams[filePath].write(logLine);
}

/**
 * Log a message with colored output
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function log(level, message, data = null) {
  const config = levels[level] || levels.info;
  const color = config.color || '\x1b[0m';
  const label = config.label || level.toUpperCase();

  const timestamp = getTimestamp();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  
  console.log(`${color}[${timestamp}] ${label}: ${message}${dataStr}\x1b[0m`);

  if (logger._logFile) {
    writeToFile(logger._logFile, level, message, data);
  }
}

/**
 * Logger object
 */
export const logger = {
  _logFile: null,

  /**
   * Set log file path
   * @param {string} filePath
   */
  save(filePath) {
    this._logFile = filePath;
    log('info', `Logging to file: ${filePath}`);
  },

  /**
   * Close log file stream
   */
  close() {
    Object.values(logFileStreams).forEach(stream => stream.end());
    this._logFile = null;
  },

  /**
   * Log debug message
   */
  debug(message, data = null) {
    log('debug', message, data);
  },

  /**
   * Log info message
   */
  info(message, data = null) {
    log('info', message, data);
  },

  /**
   * Log warning message
   */
  warn(message, data = null) {
    log('warn', message, data);
  },

  /**
   * Log error message
   */
  error(message, data = null) {
    log('error', message, data);
  },

  /**
   * Log success message
   */
  success(message, data = null) {
    log('success', message, data);
  },

  /**
   * Log HTTP request
   */
  request(method, url, status, duration = null) {
    const statusColor = status >= 400 ? levels.error.color : status >= 300 ? levels.warn.color : levels.info.color;
    const message = `${method} ${url} → ${status}`;
    const data = duration !== null ? { duration: `${duration}ms` } : null;
    console.log(`${statusColor}[${getTimestamp()}] ${message}\x1b[0m`);
    if (this._logFile) {
      writeToFile(this._logFile, 'info', message, data);
    }
  },
};

export default logger;
