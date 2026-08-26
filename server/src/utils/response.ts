import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string,
): Response<ApiResponse<T>> {
  const payload: ApiResponse<T> = {
    success: true,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  if (message !== undefined) {
    payload.message = message;
  }

  return res.status(statusCode).json(payload);
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
): Response<ApiResponse<T>> {
  return sendResponse(res, statusCode, data, message);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response<ApiResponse> {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };

  return res.status(statusCode).json(payload);
}
