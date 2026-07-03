/**
 * Frontend Constants
 * Keep in sync with server/src/constants/index.js
 */

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
};

export const TASK_PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const TASK_CATEGORY = {
  WORK: 'work',
  PERSONAL: 'personal',
  HEALTH: 'health',
  FINANCE: 'finance',
  EDUCATION: 'education',
  OTHER: 'other',
};

export const STATUS_LABELS = {
  'todo':        'Todo',
  'in-progress': 'In Progress',
  'done':        'Done',
};

export const PRIORITY_LABELS = {
  urgent: 'Urgent',
  high:   'High',
  medium: 'Medium',
  low:    'Low',
};

export const STATUS_CLASS = {
  'todo':        'todo',
  'in-progress': 'progress',
  'done':        'done',
};

export const PRIORITY_CLASS = {
  urgent: 'urgent',
  high:   'high',
  medium: 'medium',
  low:    'low',
};

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt',  label: 'Oldest First' },
  { value: 'dueDate',    label: 'Due Date (Asc)' },
  { value: '-dueDate',   label: 'Due Date (Desc)' },
  { value: 'title',      label: 'Title (A–Z)' },
  { value: '-title',     label: 'Title (Z–A)' },
];

export const DEFAULT_FILTERS = {
  status:     '',
  priority:   '',
  category:   '',
  search:     '',
  sort:       '-createdAt',
  page:       1,
  limit:      9,
  isArchived: 'false',
};
