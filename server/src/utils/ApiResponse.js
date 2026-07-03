/**
 * Standardized API Response Class
 *
 * Ensures every successful API response has the same shape:
 * { statusCode, data, message, success }
 *
 * Why standardize responses?
 * - Frontend can rely on a consistent contract
 * - Easier to build generic API handlers on the client
 * - Makes debugging easier (always know the shape)
 * - Professional API design (like Stripe, GitHub APIs)
 *
 * Pattern from chai-backend: ApiResponse class
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched'));
 */

class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
