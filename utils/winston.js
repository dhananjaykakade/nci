const { createLogger, format, transports } = require('winston');
const config = require('../config/config');
require('winston-daily-rotate-file');
const fs = require('fs');
const getISTTimestamp = require('./getIstIme')


// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom IST timestamp

// Create Winston logger
const logger = createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: getISTTimestamp }),
    format.printf(({ timestamp, level, message, stack }) => {
      const logMessage = stack
        ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
        : `${timestamp} [${level.toUpperCase()}]: ${message}`;
      return logMessage;
    })
  ),
  transports: [
    // Rotate app logs daily
    new transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      handleExceptions: true,
      handleRejections: true,
    }),
    // Separate error logs
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Add console transport for non-production
if (config.nodeEnv !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: getISTTimestamp }),
        format.printf(({ timestamp, level, message, stack }) => {
          const logMessage = stack
            ? `${timestamp} [${level}]: ${message}\n${stack}`
            : `${timestamp} [${level}]: ${message}`;
          return logMessage;
        })
      ),
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

module.exports = logger;
