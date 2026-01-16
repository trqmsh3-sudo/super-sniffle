const winston = require('winston');
const path = require('path');

/**
 * Winston Logger Configuration
 * Professional logging with file rotation and console output
 */

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Define log levels and colors
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
  }
};

winston.addColors(customLevels.colors);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: customLevels.levels,
  format: logFormat,
  transports: [
    // Console output (colored)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat
      )
    }),
    
    // Error logs file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  
  // Don't exit on uncaught exception
  exitOnError: false,
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add helper methods for common logging patterns
logger.api = (method, path, statusCode, duration) => {
  logger.http(`${method} ${path} ${statusCode} - ${duration}ms`);
};

logger.buildStart = (productName) => {
  logger.info(`🔨 Building dossier for: ${productName}`);
};

logger.buildSuccess = (productName, productId, duration) => {
  logger.info(`✅ Dossier built successfully for: ${productName} (ID: ${productId}) in ${duration}ms`);
};

logger.buildError = (productName, error) => {
  logger.error(`❌ Build failed for: ${productName}`, { error: error.message, stack: error.stack });
};

logger.cacheHit = (key) => {
  logger.debug(`✅ Cache HIT: ${key}`);
};

logger.cacheMiss = (key) => {
  logger.debug(`❌ Cache MISS: ${key}`);
};

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
});

module.exports = logger;
