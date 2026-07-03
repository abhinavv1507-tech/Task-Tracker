/**
 * Task Repository
 *
 * The data-access layer — ALL MongoDB queries live here.
 *
 * Why a Repository layer?
 * - Controllers shouldn't know about Mongoose syntax
 * - Services shouldn't know about database operations
 * - If you switch from MongoDB to PostgreSQL, only this file changes
 * - Queries are centralized, DRY, and easy to optimize
 * - Easy to mock in unit tests
 *
 * Every method returns raw Mongoose documents or plain objects.
 * Error handling (e.g., "not found") is the Service layer's job.
 */

import { Task } from '../models/task.model.js';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  SORTABLE_FIELDS,
} from '../constants/index.js';

class TaskRepository {
  /**
   * Find all tasks with filtering, search, sorting, and pagination.
   *
   * @param {Object} filters - { status, priority, category, isArchived, search }
   * @param {Object} pagination - { page, limit }
   * @param {string} sort - Sort string like "-createdAt" or "dueDate"
   * @returns {{ tasks: Array, pagination: Object }}
   */
  async findAll(filters = {}, pagination = {}, sort = '-createdAt') {
    const query = {};

    // ── Filter: exclude soft-deleted tasks by default ──
    query.deletedAt = null;

    // ── Filter: isArchived ──
    if (filters.isArchived !== undefined) {
      query.isArchived = filters.isArchived === 'true' || filters.isArchived === true;
    } else {
      // By default, show only active (non-archived) tasks
      query.isArchived = false;
    }

    // ── Filter: status ──
    if (filters.status) {
      query.status = filters.status;
    }

    // ── Filter: priority ──
    if (filters.priority) {
      query.priority = filters.priority;
    }

    // ── Filter: category ──
    if (filters.category) {
      query.category = filters.category;
    }

    // ── Search: full-text search on title and description ──
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // ── Pagination ──
    const page = Math.max(1, parseInt(pagination.page, 10) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(pagination.limit, 10) || DEFAULT_PAGE_SIZE)
    );
    const skip = (page - 1) * limit;

    // ── Sort ──
    // Validate sort field to prevent injection
    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortDirection = sort.startsWith('-') ? -1 : 1;

      if (SORTABLE_FIELDS.includes(sortField)) {
        sortObj[sortField] = sortDirection;
      } else {
        sortObj.createdAt = -1; // Default sort
      }
    }

    // ── Execute query ──
    const [tasks, totalCount] = await Promise.all([
      Task.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Task.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find a single task by its MongoDB _id.
   * Excludes soft-deleted tasks.
   *
   * @param {string} id - MongoDB ObjectId
   * @returns {Object|null} Task document or null
   */
  async findById(id) {
    return Task.findOne({ _id: id, deletedAt: null }).lean();
  }

  /**
   * Create a new task document.
   *
   * @param {Object} data - Task fields
   * @returns {Object} Created task document
   */
  async create(data) {
    const task = new Task(data);
    const saved = await task.save();
    return saved.toObject();
  }

  /**
   * Update a task by ID (partial update).
   * Uses findOneAndUpdate with { new: true } to return the updated document.
   * runValidators ensures Mongoose schema validation runs on updates too.
   *
   * @param {string} id
   * @param {Object} data - Fields to update
   * @returns {Object|null}
   */
  async updateById(id, data) {
    return Task.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Soft-delete a task by setting deletedAt timestamp.
   * This enables "Undo Delete" on the frontend.
   *
   * @param {string} id
   * @returns {Object|null}
   */
  async softDelete(id) {
    return Task.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    ).lean();
  }

  /**
   * Restore a soft-deleted task by clearing deletedAt.
   *
   * @param {string} id
   * @returns {Object|null}
   */
  async restore(id) {
    return Task.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      { new: true }
    ).lean();
  }

  /**
   * Archive a task (different from delete — task is hidden but not "deleted").
   *
   * @param {string} id
   * @returns {Object|null}
   */
  async archive(id) {
    return Task.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { isArchived: true } },
      { new: true }
    ).lean();
  }

  /**
   * Unarchive (restore from archive) a task.
   *
   * @param {string} id
   * @returns {Object|null}
   */
  async unarchive(id) {
    return Task.findOneAndUpdate(
      { _id: id, deletedAt: null, isArchived: true },
      { $set: { isArchived: false } },
      { new: true }
    ).lean();
  }

  /**
   * Permanently delete a task (admin operation / cleanup).
   *
   * @param {string} id
   * @returns {Object|null}
   */
  async hardDelete(id) {
    return Task.findByIdAndDelete(id).lean();
  }

  /**
   * Aggregation pipeline for dashboard statistics.
   * Returns counts grouped by status, priority, overdue, etc.
   *
   * @returns {Object} Statistics object
   */
  async getStatistics() {
    const [stats] = await Task.aggregate([
      // Only include non-deleted, non-archived tasks
      { $match: { deletedAt: null, isArchived: false } },
      {
        $facet: {
          // Total count
          total: [{ $count: 'count' }],

          // Count by status
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],

          // Count by priority
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } },
          ],

          // Count by category
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
          ],

          // Overdue tasks
          overdue: [
            {
              $match: {
                dueDate: { $lt: new Date() },
                status: { $ne: 'done' },
              },
            },
            { $count: 'count' },
          ],

          // Completed today
          completedToday: [
            {
              $match: {
                status: 'done',
                completedAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
            { $count: 'count' },
          ],

          // Due today
          dueToday: [
            {
              $match: {
                dueDate: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
                status: { $ne: 'done' },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    // Flatten the facet results into a clean object
    const total = stats.total[0]?.count || 0;
    const byStatus = {};
    stats.byStatus.forEach((s) => { byStatus[s._id] = s.count; });
    const byPriority = {};
    stats.byPriority.forEach((p) => { byPriority[p._id] = p.count; });
    const byCategory = {};
    stats.byCategory.forEach((c) => { byCategory[c._id] = c.count; });

    return {
      total,
      byStatus,
      byPriority,
      byCategory,
      overdue: stats.overdue[0]?.count || 0,
      completedToday: stats.completedToday[0]?.count || 0,
      dueToday: stats.dueToday[0]?.count || 0,
      completionRate: total > 0
        ? Math.round(((byStatus.done || 0) / total) * 100)
        : 0,
    };
  }
}

// Export a singleton instance
export const taskRepository = new TaskRepository();
