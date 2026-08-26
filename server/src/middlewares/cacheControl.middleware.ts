import { Request, Response, NextFunction } from 'express';

/**
 * Cache-Control middleware for public cacheable GET endpoints.
 * @param maxAgeSeconds Max-age in seconds for client and CDN caching
 */
export const cacheControl = (maxAgeSeconds: number = 300) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET') {
      res.setHeader(
        'Cache-Control',
        `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=60`,
      );
    }
    next();
  };
};
