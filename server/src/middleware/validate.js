/**
 * Validation Middleware
 *
 * Runs after express-validator chains and checks for errors.
 * If there are validation errors, it throws an ApiError with
 * field-level error details for the frontend.
 *
 * Usage in routes:
 *   router.post('/', createTaskValidator, validate, createTask);
 *   // 1. createTaskValidator runs the validation chains
 *   // 2. validate checks the results and either passes or throws
 *   // 3. createTask runs only if validation passed
 */

import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Map errors to a clean format: [{ field, message }]
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw new ApiError(400, 'Validation failed', extractedErrors);
  }

  next();
};
