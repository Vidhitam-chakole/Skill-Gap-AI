/**
 * Global Error Handler Middleware
 * Returns structured error responses matching frontend expectations.
 */

import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  const status = err.status ?? 500;
  const message = err.status ? err.message : "Internal server error";

  res.status(status).json({
    success: false,
    error: message,
    code: err.code,
    timestamp: new Date().toISOString(),
  });
}

export function createError(status: number, message: string, code?: string): AppError {
  const error = new Error(message) as AppError;
  error.status = status;
  error.code = code;
  return error;
}
