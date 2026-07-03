/**
 * Application Constants
 *
 * Centralizes all magic strings, enums, and configuration constants.
 * This prevents typos, improves IDE autocomplete, and makes refactoring
 * a single-point change instead of a find-and-replace across the codebase.
 */

export const DB_NAME = 'task-tracker';

// ─── Task Status Enum ────────────────────────────────────────────────
export const TASK_STATUS = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
});

export const TASK_STATUS_VALUES = Object.values(TASK_STATUS);

// ─── Task Priority Enum ─────────────────────────────────────────────
export const TASK_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

export const TASK_PRIORITY_VALUES = Object.values(TASK_PRIORITY);

// ─── Task Category Enum ─────────────────────────────────────────────
export const TASK_CATEGORY = Object.freeze({
  WORK: 'work',
  PERSONAL: 'personal',
  HEALTH: 'health',
  FINANCE: 'finance',
  EDUCATION: 'education',
  OTHER: 'other',
});

export const TASK_CATEGORY_VALUES = Object.values(TASK_CATEGORY);

// ─── Pagination Defaults ────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 9;
export const MAX_PAGE_SIZE = 50;

// ─── Sortable Fields ────────────────────────────────────────────────
export const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title'];
