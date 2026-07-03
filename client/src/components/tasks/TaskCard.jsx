/**
 * TaskCard Component
 *
 * Displays a single task in either grid or list view.
 * Shows: title, category, priority, status, due date, tags.
 * Action buttons (edit, archive, delete) appear on hover.
 */

import { FiEdit2, FiArchive, FiTrash2, FiClock } from 'react-icons/fi';
import { format, isPast, isToday } from 'date-fns';
import { PriorityBadge, StatusBadge, CategoryChip } from '../ui/Badge.jsx';
import { useTaskContext } from '../../context/TaskContext.jsx';

export default function TaskCard({ task, onEdit, view = 'grid' }) {
  const { deleteTask, archiveTask } = useTaskContext();

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTask(task._id, task.title);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    archiveTask(task._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const dueInfo = (() => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    const overdue = isPast(date) && task.status !== 'done' && !isToday(date);
    const today   = isToday(date);
    return {
      label: overdue ? `Overdue · ${format(date, 'MMM d')}` :
             today   ? 'Due Today' :
                       format(date, 'MMM d'),
      overdue,
      today,
    };
  })();

  if (view === 'list') {
    return (
      <div className="task-list-row" onClick={() => onEdit?.(task)}>
        <div className={`task-list-title ${task.status === 'done' ? 'task-title done' : ''}`}>
          {task.title}
        </div>
        <CategoryChip category={task.category} />
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        {dueInfo && (
          <span className={`task-due ${dueInfo.overdue ? 'overdue' : ''}`}>
            <FiClock size={11} />{dueInfo.label}
          </span>
        )}
        <div className="task-actions">
          <button className="task-action-btn" onClick={handleEdit} title="Edit"><FiEdit2 size={13} /></button>
          <button className="task-action-btn" onClick={handleArchive} title="Archive"><FiArchive size={13} /></button>
          <button className="task-action-btn danger" onClick={handleDelete} title="Delete"><FiTrash2 size={13} /></button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`task-card priority-${task.priority} fade-in-up`}
      onClick={() => onEdit?.(task)}
    >
      <div className="task-card-header">
        <span className={`task-title ${task.status === 'done' ? 'done' : ''}`}>
          {task.title}
        </span>
        <div className="task-actions">
          <button className="task-action-btn" onClick={handleEdit}    title="Edit"><FiEdit2 size={13} /></button>
          <button className="task-action-btn" onClick={handleArchive} title="Archive"><FiArchive size={13} /></button>
          <button className="task-action-btn danger" onClick={handleDelete} title="Delete"><FiTrash2 size={13} /></button>
        </div>
      </div>

      <div className="task-meta">
        <CategoryChip category={task.category} />
        <PriorityBadge priority={task.priority} />
      </div>

      {task.tags?.length > 0 && (
        <div className="task-tags">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="task-footer">
        {dueInfo ? (
          <span className={`task-due ${dueInfo.overdue ? 'overdue' : ''}`}>
            <FiClock size={11} />{dueInfo.label}
          </span>
        ) : <span />}
        <StatusBadge status={task.status} />
      </div>
    </div>
  );
}
