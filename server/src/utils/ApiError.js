/**
 * Custom API Error Class
 *
 * Extends the built-in Error class to include HTTP status codes,
 * structured error arrays, and a success flag.
 *
 * Why a custom error class?
 * - Standard Error only has `message` and `stack`
 * - APIs need `statusCode` to set the HTTP response code
 * - We need `errors[]` for field-level validation errors
 * - The `success` flag makes it easy for frontends to check response status
 *
 * Pattern from chai-backend: ApiError extends Error
 *
 * Usage:
 *   throw new ApiError(404, 'Task not found');
 *   throw new ApiError(400, 'Validation failed', [{ field: 'title', message: 'Required' }]);
 */

class ApiError extends Error {
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    // Call parent Error constructor with the message
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    // Capture stack trace, excluding this constructor from the trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
