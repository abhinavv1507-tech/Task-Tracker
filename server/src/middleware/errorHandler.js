/**
 * Global Error Handler Middleware
 *
 * This is the LAST middleware in the Express pipeline.
 * It catches all errors that weren't handled by route handlers.
 *
 * Error types handled:
 * 1. ApiError — our custom errors with statusCode and errors[]
 * 2. Mongoose ValidationError — schema validation failures
 * 3. Mongoose CastError — invalid ObjectId format
 * 4. Duplicate key error (code 11000) — unique constraint violations
 * 5. Unknown errors — catch-all with 500 status
 *
 * Security:
 * - Stack traces are ONLY included in development
 * - Production responses never expose internal details
 */

import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the full error in development
  logger.error(err.message, {
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // ── Handle our custom ApiError ──
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  // ── Handle Mongoose Validation Error ──
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // ── Handle Mongoose CastError (invalid ObjectId) ──
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      errors: [],
    });
  }

  // ── Handle MongoDB Duplicate Key Error ──
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
      errors: [{ field, message: `${field} already exists` }],
    });
  }

  // ── Catch-all: Unknown Errors ──
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    errors: [],
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
