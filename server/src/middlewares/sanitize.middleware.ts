import { Request, Response, NextFunction } from 'express';

/**
 * Clean object to prevent NoSQL operator injection ($where, $gt, etc.) and basic XSS attacks.
 */
function cleanObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      // Basic XSS sanitization for script tags
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Strip keys starting with $ or containing . (NoSQL operator injection defense)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = cleanObject(obj[key]);
  }
  return sanitized;
}

export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) req.body = cleanObject(req.body);
  if (req.query) req.query = cleanObject(req.query);
  if (req.params) req.params = cleanObject(req.params);
  next();
};
