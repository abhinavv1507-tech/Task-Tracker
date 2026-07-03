/**
 * TaskForm Component
 *
 * Handles both CREATE and EDIT modes via the `task` prop.
 * Manages its own local form state, validates, and calls
 * the appropriate context action on submit.
 */

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext.jsx';
import { TASK_STATUS, TASK_PRIORITY, TASK_CATEGORY } from '../../constants/index.js';

const EMPTY_FORM = {
  title:       '',
  description: '',
  status:      TASK_STATUS.TODO,
  priority:    TASK_PRIORITY.MEDIUM,
  category:    TASK_CATEGORY.WORK,
  dueDate:     '',
  tags:        [],
};

export default function TaskForm({ task, onClose }) {
  const { createTask, updateTask } = useTaskContext();
  const isEdit = Boolean(task?._id);

  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        status:      task.status      || TASK_STATUS.TODO,
        priority:    task.priority    || TASK_PRIORITY.MEDIUM,
        category:    task.category    || TASK_CATEGORY.WORK,
        dueDate:     task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        tags: task.tags || [],
      });
    }
  }, [isEdit, task]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())                e.title = 'Title is required';
    if (form.title.trim().length < 3)      e.title = 'Title must be at least 3 characters';
    if (form.title.trim().length > 100)    e.title = 'Title must be under 100 characters';
    if (form.description.length > 1000)    e.description = 'Description must be under 1000 characters';
    return e;
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!form.tags.includes(newTag) && form.tags.length < 5) {
        set('tags', [...form.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    set('tags', form.tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...form,
      dueDate: form.dueDate || null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateTask(task._id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      // Field-level errors from API
      if (err.errors?.length) {
        const apiErrors = {};
        err.errors.forEach(({ field, message }) => { apiErrors[field] = message; });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Title */}
      <div className="form-group mb-4">
        <label className="form-label">Title *</label>
        <input
          className={`form-control ${errors.title ? 'error' : ''}`}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Task title..."
          maxLength={100}
          autoFocus
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      {/* Description */}
      <div className="form-group mb-4">
        <label className="form-label">Description</label>
        <textarea
          className={`form-control ${errors.description ? 'error' : ''}`}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Add a description..."
          rows={3}
          maxLength={1000}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      {/* Priority + Status */}
      <div className="form-row mb-4">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-control" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {Object.values(TASK_PRIORITY).map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Category + Due Date */}
      <div className="form-row mb-4">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-control" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {Object.values(TASK_CATEGORY).map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            className="form-control"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <label className="form-label">Tags (press Enter to add)</label>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          padding: '8px 12px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          minHeight: 42,
          transition: 'var(--transition)',
        }}>
          {form.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <span className="tag-remove" onClick={() => removeTag(tag)}><FiX size={10} /></span>
            </span>
          ))}
          <input
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              flex: 1,
              minWidth: 80,
              padding: 0,
            }}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={form.tags.length < 5 ? 'Add tag...' : ''}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="modal-footer" style={{ padding: '20px 0 0', marginTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
