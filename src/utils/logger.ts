/**
 * Logging utility using Winston
 */

import winston from 'winston';
import { config } from '../config/env';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.filePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: config.logging.level,
    format: config.server.isDevelopment ? consoleFormat : logFormat,
  }),
];

// File transport (if enabled)
if (config.logging.fileEnabled) {
  transports.push(
    new winston.transports.File({
      filename: config.logging.filePath,
      level: config.logging.level,
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Add request ID to logs
export const createRequestLogger = (requestId: string) => {
  return logger.child({ requestId });
};

// HTTP request logger for Morgan
export const httpLoggerStream = {
  write: (message: string) => {
    logger.info(message.trim(), { component: 'http' });
  },
};

// Structured logging methods
export const log = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },
  
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },

  // Specific log types
  auth: (message: string, meta?: any) => {
    logger.info(message, { ...meta, component: 'auth' });
  },

  database: (message: string, meta?: any) => {
    logger.info(message, { ...meta, component: 'database' });
  },

  api: (message: string, meta?: any) => {
    logger.info(message, { ...meta, component: 'api' });
  },

  security: (message: string, meta?: any) => {
    logger.warn(message, { ...meta, component: 'security' });
  },

  performance: (message: string, meta?: any) => {
    logger.info(message, { ...meta, component: 'performance' });
  },
};

export default logger;