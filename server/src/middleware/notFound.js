/**
 * 404 Not Found Middleware
 *
 * Catches requests to undefined routes and returns a consistent
 * JSON error response. Must be placed AFTER all route definitions.
 */

import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
