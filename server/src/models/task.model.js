/**
 * Task Model (Mongoose Schema)
 *
 * Defines the shape of a Task document in MongoDB.
 *
 * Schema Design Decisions:
 * - `status`, `priority`, `category` use enums (fixed set in constants/index.js)
 * - `tags` is an array of strings for flexible categorization
 * - `completedAt` is set automatically when status changes to 'done'
 * - `isArchived` enables archiving tasks (PATCH /:id/archive)
 * - `deletedAt` enables soft-delete with undo support (DELETE sets this, not hard-delete)
 * - `timestamps: true` auto-manages createdAt/updatedAt
 *
 * Indexes:
 * - Text index on title + description for full-text search
 * - Compound index on status + priority for common filter queries
 * - Index on dueDate for date-range queries
 * - Index on isArchived to quickly filter active tasks
 *
 * Why indexes?
 * - Without indexes, MongoDB scans every document (O(n))
 * - With indexes, lookups are O(log n) using B-tree
 * - Text indexes enable MongoDB's $text search operator
 * - Compound indexes serve queries that filter on multiple fields
 */

import mongoose, { Schema } from 'mongoose';
import {
  TASK_STATUS_VALUES,
  TASK_PRIORITY_VALUES,
  TASK_CATEGORY_VALUES,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_CATEGORY,
} from '../constants/index.js';

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    status: {
      type: String,
      enum: {
        values: TASK_STATUS_VALUES,
        message: '{VALUE} is not a valid status',
      },
      default: TASK_STATUS.TODO,
      index: true,
    },

    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITY_VALUES,
        message: '{VALUE} is not a valid priority',
      },
      default: TASK_PRIORITY.MEDIUM,
      index: true,
    },

    category: {
      type: String,
      enum: {
        values: TASK_CATEGORY_VALUES,
        message: '{VALUE} is not a valid category',
      },
      default: TASK_CATEGORY.OTHER,
    },

    tags: {
      type: [String],
      default: [],
      // Lowercase all tags for consistent searching
      set: (tags) => tags.map((tag) => tag.toLowerCase().trim()),
    },

    dueDate: {
      type: Date,
      default: null,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true, // Auto-creates createdAt and updatedAt
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────

// Text index for full-text search on title and description
// Weight: title matches are ranked higher than description matches
taskSchema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 3, description: 1 } }
);

// Compound index for common filter pattern: status + priority
taskSchema.index({ status: 1, priority: 1 });

// ─── Pre-save Middleware ─────────────────────────────────────────────

// Automatically set completedAt when task status changes to 'done'
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === TASK_STATUS.DONE) {
      this.completedAt = new Date();
    } else {
      this.completedAt = null;
    }
  }
  next();
});

// ─── Instance Methods ────────────────────────────────────────────────

// Check if a task is overdue
taskSchema.methods.isOverdue = function () {
  if (!this.dueDate) return false;
  if (this.status === TASK_STATUS.DONE) return false;
  return new Date() > this.dueDate;
};

// ─── Static Methods ─────────────────────────────────────────────────

// Find all overdue tasks
taskSchema.statics.findOverdue = function () {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: TASK_STATUS.DONE },
    isArchived: false,
  });
};

export const Task = mongoose.model('Task', taskSchema);
