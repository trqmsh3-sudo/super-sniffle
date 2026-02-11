import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../config/constants.js';

export const apiLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many search requests. Please wait a minute before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
