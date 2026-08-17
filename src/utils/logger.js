// src/utils/logger.js

/**
 * A simple logging utility that only logs in non-production environments.
 * It checks `process.env.NODE_ENV` which is typically set to 'production'
 * during a production build by tools like Webpack, Vite, or Create React App.
 */
const isProduction = process.env.NODE_ENV === 'production';

const logger = {
  /**
   * Logs an error message. Only active in development/test environments.
   * @param {any[]} args - Arguments to log.
   */
  error: (...args) => {
    if (!isProduction) {
      console.error('APP_ERROR:', ...args);
    }
  },
  /**
   * Logs a warning message. Only active in development/test environments.
   * @param {any[]} args - Arguments to log.
   */
  warn: (...args) => {
    if (!isProduction) {
      console.warn('APP_WARNING:', ...args);
    }
  },
  /**
   * Logs an informational message. Only active in development/test environments.
   * @param {any[]} args - Arguments to log.
   */
  info: (...args) => {
    if (!isProduction) {
      console.info('APP_INFO:', ...args);
    }
  },
  /**
   * Logs a debug message. Only active in development/test environments.
   * @param {any[]} args - Arguments to log.
   */
  debug: (...args) => {
    if (!isProduction) {
      console.debug('APP_DEBUG:', ...args);
    }
  },
};

export default logger;