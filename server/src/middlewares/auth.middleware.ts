import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtAccessPayload } from '../utils/auth.js';
import { AppError } from '../utils/appError.js';
import { UserRole } from '../models/user.model.js';

// Extend Express Request interface to include authenticated user payload
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

/**
 * Authentication middleware: verifies Bearer JWT token in Authorization header
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (_err) {
    return next(new AppError('Invalid or expired access token.', 401));
  }
};

/**
 * Optional authentication middleware: sets req.user if valid token provided, but proceeds if absent
 */
export const authenticateOptional = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
  } catch (_err) {
    // Ignore invalid optional tokens
  }
  next();
};

/**
 * Role-based authorization middleware: authorizes specific UserRoles (e.g. CUSTOMER, ADMIN, STAFF)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Forbidden. Access requires one of: ${allowedRoles.join(', ')}`, 403));
    }

    next();
  };
};
