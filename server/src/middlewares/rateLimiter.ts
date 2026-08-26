import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

const isDevOrTest = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';

/**
 * Standard global rate limiter for general API endpoints
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevOrTest ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      429,
      'TOO_MANY_REQUESTS',
      'Too many requests from this IP address, please try again after 15 minutes.',
    );
  },
});

/**
 * Stricter rate limiter for general authentication routes
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevOrTest ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      429,
      'TOO_MANY_AUTH_ATTEMPTS',
      'Too many authentication requests. Please try again after 15 minutes.',
    );
  },
});

/**
 * Rate limiter specifically for login and password-reset attempts
 */
export const sensitiveAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevOrTest ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      429,
      'TOO_MANY_LOGIN_ATTEMPTS',
      'Too many login or password reset attempts. Please try again after 15 minutes for security reasons.',
    );
  },
});

