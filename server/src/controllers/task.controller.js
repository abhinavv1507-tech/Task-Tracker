/**
 * Task Controller
 *
 * The thinnest layer — receives HTTP requests and delegates to the service.
 *
 * Controller responsibilities:
 * 1. Extract data from the request (params, query, body)
 * 2. Call the appropriate service method
 * 3. Send the response using ApiResponse
 *
 * What does NOT belong here:
 * - Business logic (that's the service's job)
 * - Database queries (that's the repository's job)
 * - Validation (that's the validator middleware's job)
 *
 * Every handler is wrapped in asyncHandler to auto-catch errors.
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { taskService } from '../services/task.service.js';

/**
 * GET /api/v1/tasks
 * Fetch all tasks with optional filters, search, sort, and pagination.
 *
 * Query params: status, priority, category, search, sort, page, limit, isArchived
 */
const getAllTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getAllTasks(req.query);

  res.status(200).json(
    new ApiResponse(200, result, 'Tasks fetched successfully')
  );
});

/**
 * GET /api/v1/tasks/stats
 * Get dashboard statistics (counts by status, priority, overdue, etc.)
 */
const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getTaskStats();

  res.status(200).json(
    new ApiResponse(200, stats, 'Task statistics fetched successfully')
  );
});

/**
 * GET /api/v1/tasks/:id
 * Get a single task by its MongoDB ObjectId.
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);

  res.status(200).json(
    new ApiResponse(200, task, 'Task fetched successfully')
  );
});

/**
 * POST /api/v1/tasks
 * Create a new task.
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);

  res.status(201).json(
    new ApiResponse(201, task, 'Task created successfully')
  );
});

/**
 * PATCH /api/v1/tasks/:id
 * Partially update an existing task.
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);

  res.status(200).json(
    new ApiResponse(200, task, 'Task updated successfully')
  );
});

/**
 * DELETE /api/v1/tasks/:id
 * Soft-delete a task (sets deletedAt, supports undo).
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await taskService.deleteTask(req.params.id);

  res.status(200).json(
    new ApiResponse(200, task, 'Task deleted successfully')
  );
});

/**
 * PATCH /api/v1/tasks/:id/restore
 * Restore a soft-deleted task (undo delete).
 */
const restoreTask = asyncHandler(async (req, res) => {
  const task = await taskService.restoreTask(req.params.id);

  res.status(200).json(
    new ApiResponse(200, task, 'Task restored successfully')
  );
});

/**
 * PATCH /api/v1/tasks/:id/archive
 * Archive a task (hide from main view).
 */
const archiveTask = asyncHandler(async (req, res) => {
  const task = await taskService.archiveTask(req.params.id);

  res.status(200).json(
    new ApiResponse(200, task, 'Task archived successfully')
  );
});

/**
 * PATCH /api/v1/tasks/:id/unarchive
 * Restore a task from archive.
 */
const unarchiveTask = asyncHandler(async (req, res) => {
  const task = await taskService.unarchiveTask(req.params.id);

  res.status(200).json(
    new ApiResponse(200, task, 'Task unarchived successfully')
  );
});

export {
  getAllTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  archiveTask,
  unarchiveTask,
};
