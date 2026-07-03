/**
 * Task Service
 *
 * The business logic layer — sits between Controller and Repository.
 *
 * Why a Service layer?
 * - Controllers are thin (parse request → call service → send response)
 * - Repository only knows about DB queries
 * - Service is where business rules live:
 *   - "If status changes to done, set completedAt"
 *   - "Task not found? Throw 404"
 *   - "Parse and validate query params before passing to repository"
 *
 * This separation makes the codebase:
 * - Testable: mock the repository, test business logic in isolation
 * - Reusable: same service can be called from REST controllers, GraphQL resolvers, or CLI
 * - Maintainable: business rules are in one place, not scattered across controllers
 */

import { taskRepository } from '../repositories/task.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { TASK_STATUS } from '../constants/index.js';
import mongoose from 'mongoose';

class TaskService {
  /**
   * Get all tasks with optional filtering, search, sorting, and pagination.
   *
   * @param {Object} queryParams - Raw query string params from Express request
   * @returns {{ tasks: Array, pagination: Object }}
   */
  async getAllTasks(queryParams = {}) {
    const { status, priority, category, search, sort, page, limit, isArchived } = queryParams;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (isArchived !== undefined) filters.isArchived = isArchived;

    const pagination = { page, limit };
    const sortParam = sort || '-createdAt';

    return taskRepository.findAll(filters, pagination, sortParam);
  }

  /**
   * Get a single task by ID.
   * Validates the ObjectId format and throws 404 if not found.
   *
   * @param {string} id - MongoDB ObjectId string
   * @returns {Object} Task document
   * @throws {ApiError} 400 if invalid ID format, 404 if not found
   */
  async getTaskById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    const task = await taskRepository.findById(id);

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return task;
  }

  /**
   * Create a new task.
   *
   * @param {Object} data - Validated task data from the request body
   * @returns {Object} Created task document
   */
  async createTask(data) {
    return taskRepository.create(data);
  }

  /**
   * Update an existing task (partial update via PATCH).
   *
   * Business logic:
   * - If status changes to 'done', completedAt is set (handled by Mongoose pre-save)
   * - Since we use findOneAndUpdate here (bypasses pre-save),
   *   we manually handle the completedAt logic
   *
   * @param {string} id
   * @param {Object} data - Partial update fields
   * @returns {Object} Updated task document
   */
  async updateTask(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    // Business rule: auto-set completedAt when status changes to done
    if (data.status === TASK_STATUS.DONE) {
      data.completedAt = new Date();
    } else if (data.status && data.status !== TASK_STATUS.DONE) {
      data.completedAt = null;
    }

    const task = await taskRepository.updateById(id, data);

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return task;
  }

  /**
   * Soft-delete a task (sets deletedAt, enables undo).
   *
   * @param {string} id
   * @returns {Object} Soft-deleted task
   */
  async deleteTask(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    const task = await taskRepository.softDelete(id);

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return task;
  }

  /**
   * Restore a soft-deleted task (undo delete).
   *
   * @param {string} id
   * @returns {Object} Restored task
   */
  async restoreTask(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    const task = await taskRepository.restore(id);

    if (!task) {
      throw new ApiError(404, 'Task not found or not deleted');
    }

    return task;
  }

  /**
   * Archive a task (hide from main view, but not deleted).
   *
   * @param {string} id
   * @returns {Object} Archived task
   */
  async archiveTask(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    const task = await taskRepository.archive(id);

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return task;
  }

  /**
   * Restore a task from archive.
   *
   * @param {string} id
   * @returns {Object} Unarchived task
   */
  async unarchiveTask(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    const task = await taskRepository.unarchive(id);

    if (!task) {
      throw new ApiError(404, 'Task not found or not archived');
    }

    return task;
  }

  /**
   * Get dashboard statistics.
   *
   * @returns {Object} Stats object with counts by status, priority, etc.
   */
  async getTaskStats() {
    return taskRepository.getStatistics();
  }
}

export const taskService = new TaskService();
