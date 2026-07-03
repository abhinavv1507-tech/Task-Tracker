/**
 * Badge Component
 * Renders priority or status badges with correct Ink Wash styling.
 */

import { PRIORITY_CLASS, PRIORITY_LABELS, STATUS_CLASS, STATUS_LABELS } from '../../constants/index.js';

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <span className={`badge ${PRIORITY_CLASS[priority] || ''}`}>
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`badge ${STATUS_CLASS[status] || 'todo'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function CategoryChip({ category }) {
  if (!category) return null;
  return (
    <span className="chip">
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
