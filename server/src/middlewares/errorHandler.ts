import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : 'API_ERROR';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
    errorCode = 'INVALID_ID';
  } else {
    logger.error(err, 'Unhandled Server Exception');
  }

  if (env.NODE_ENV === 'development' && err.stack) {
    details = { stack: err.stack };
  }

  sendError(res, statusCode, errorCode, message, details);
};
