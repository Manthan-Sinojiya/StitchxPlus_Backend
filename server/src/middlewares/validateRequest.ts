import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Higher-order middleware function to validate incoming requests against a Zod schema.
 * Accepts a Zod schema that can contain `body`, `query`, and/or `params` validation rules.
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace req properties with validated & stripped data
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.slice(1).join('.'),
          message: err.message,
        }));

        sendError(
          res,
          400,
          'VALIDATION_ERROR',
          'Request data failed schema validation check.',
          formattedErrors,
        );
        return;
      }

      next(error);
    }
  };
};
