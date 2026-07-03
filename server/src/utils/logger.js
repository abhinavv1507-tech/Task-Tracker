/**
 * Centralized Logger Utility
 *
 * A simple structured logger that adds timestamps, log levels,
 * and can be extended to use Winston/Pino in production.
 *
 * Why not just console.log?
 * - Timestamps make debugging easier
 * - Log levels help filter noise in production
 * - Single point to redirect logs (file, cloud service, etc.)
 * - Consistent formatting across the codebase
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

const logger = {
  error: (message, meta = {}) => {
    console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
  },

  warn: (message, meta = {}) => {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
  },

  info: (message, meta = {}) => {
    console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  },
};

export { logger };
