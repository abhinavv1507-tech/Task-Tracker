/**
 * Async Handler Wrapper
 *
 * A higher-order function that wraps async route handlers to catch
 * any rejected promises and pass them to Express's error handler.
 *
 * Without this:
 *   app.get('/tasks', async (req, res) => {
 *     const tasks = await Task.find(); // If this throws, Express hangs!
 *     res.json(tasks);
 *   });
 *
 * With this:
 *   app.get('/tasks', asyncHandler(async (req, res) => {
 *     const tasks = await Task.find(); // If this throws, error handler catches it
 *     res.json(tasks);
 *   }));
 *
 * Why not just try/catch everywhere?
 * - DRY: avoids repeating try/catch in every controller
 * - Cleaner: controllers focus on happy path
 * - Safer: impossible to forget error handling
 *
 * How it works:
 * - Takes a function (requestHandler)
 * - Returns a new function that wraps requestHandler in Promise.resolve()
 * - If the promise rejects, .catch(next) forwards the error to Express's
 *   global error handler middleware
 *
 * Pattern from chai-backend: asyncHandler
 */

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
