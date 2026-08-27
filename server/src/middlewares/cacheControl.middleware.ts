import { Request, Response, NextFunction } from 'express';

/**
 * Cache-Control middleware for public cacheable GET endpoints.
 * @param maxAgeSeconds Max-age in seconds for client and CDN caching
 */
export const cacheControl = (maxAgeSeconds: number = 0) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET') {
      if (maxAgeSeconds <= 0) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else {
        res.setHeader(
          'Cache-Control',
          `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=60`,
        );
      }
    }
    next();
  };
};
