/**
 * Task Validators
 *
 * express-validator chains for validating task request bodies.
 *
 * Why separate validators?
 * - Keeps validation logic out of controllers and services
 * - Reusable across routes (e.g., create and update share some rules)
 * - Declarative: easy to read what's being validated
 * - Returns field-level errors for the frontend to display inline
 *
 * These are used as middleware in routes:
 *   router.post('/', createTaskValidator, validate, createTask);
 */

import { body } from 'express-validator';
import {
  TASK_STATUS_VALUES,
  TASK_PRIORITY_VALUES,
  TASK_CATEGORY_VALUES,
} from '../constants/index.js';

/**
 * Validation chain for POST /api/v1/tasks (create)
 */
export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(TASK_STATUS_VALUES)
    .withMessage(`Status must be one of: ${TASK_STATUS_VALUES.join(', ')}`),

  body('priority')
    .optional()
    .isIn(TASK_PRIORITY_VALUES)
    .withMessage(`Priority must be one of: ${TASK_PRIORITY_VALUES.join(', ')}`),

  body('category')
    .optional()
    .isIn(TASK_CATEGORY_VALUES)
    .withMessage(`Category must be one of: ${TASK_CATEGORY_VALUES.join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),

  body('dueDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

/**
 * Validation chain for PATCH /api/v1/tasks/:id (update)
 *
 * Similar to create, but ALL fields are optional (partial update).
 */
export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(TASK_STATUS_VALUES)
    .withMessage(`Status must be one of: ${TASK_STATUS_VALUES.join(', ')}`),

  body('priority')
    .optional()
    .isIn(TASK_PRIORITY_VALUES)
    .withMessage(`Priority must be one of: ${TASK_PRIORITY_VALUES.join(', ')}`),

  body('category')
    .optional()
    .isIn(TASK_CATEGORY_VALUES)
    .withMessage(`Category must be one of: ${TASK_CATEGORY_VALUES.join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),

  body('dueDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];
