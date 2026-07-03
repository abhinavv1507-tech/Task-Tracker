/**
 * Task Routes
 *
 * Maps HTTP methods + URL patterns to controller handlers.
 * Validators are attached as middleware BEFORE the controller.
 *
 * Route Design (RESTful + custom actions):
 *
 *   GET    /api/v1/tasks           → List tasks (with filters, search, sort, pagination)
 *   GET    /api/v1/tasks/stats     → Dashboard statistics
 *   POST   /api/v1/tasks           → Create a task
 *   GET    /api/v1/tasks/:id       → Get single task
 *   PATCH  /api/v1/tasks/:id       → Partially update a task
 *   DELETE /api/v1/tasks/:id       → Soft-delete a task
 *   PATCH  /api/v1/tasks/:id/restore   → Undo soft-delete
 *   PATCH  /api/v1/tasks/:id/archive   → Archive a task
 *   PATCH  /api/v1/tasks/:id/unarchive → Restore from archive
 *
 * Why PATCH instead of PUT?
 * - PUT replaces the entire resource (must send ALL fields)
 * - PATCH modifies specific fields (partial update)
 * - Since our updates are often partial (e.g., just changing status),
 *   PATCH is semantically correct per HTTP spec (RFC 5789)
 *
 * Why /stats before /:id?
 * - Express matches routes top-to-bottom
 * - If /:id came first, "stats" would be treated as an ID
 * - Static routes must be defined BEFORE parameterized routes
 */

import { Router } from 'express';
import {
  getAllTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  archiveTask,
  unarchiveTask,
} from '../controllers/task.controller.js';
import {
  createTaskValidator,
  updateTaskValidator,
} from '../validators/task.validator.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ─── Collection Routes ───────────────────────────────────────────────
router.route('/')
  .get(getAllTasks)
  .post(createTaskValidator, validate, createTask);

// ─── Statistics (must be BEFORE /:id) ────────────────────────────────
router.get('/stats', getTaskStats);

// ─── Single Resource Routes ──────────────────────────────────────────
router.route('/:id')
  .get(getTaskById)
  .patch(updateTaskValidator, validate, updateTask)
  .delete(deleteTask);

// ─── Custom Action Routes ────────────────────────────────────────────
router.patch('/:id/restore', restoreTask);
router.patch('/:id/archive', archiveTask);
router.patch('/:id/unarchive', unarchiveTask);

export default router;
