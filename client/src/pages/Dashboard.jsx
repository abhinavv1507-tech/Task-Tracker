/**
 * Dashboard Page
 *
 * Shows stats, completion progress, tasks due today, and recent tasks.
 */

import { useEffect, useState } from 'react';
import { FiPlus, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { useTaskContext } from '../context/TaskContext.jsx';
import { StatCardSkeleton, TaskCardSkeleton } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import TaskForm from '../components/tasks/TaskForm.jsx';
import TaskCard from '../components/tasks/TaskCard.jsx';

export default function Dashboard() {
  const { stats, tasks, loading, statsLoading, fetchTasks, fetchStats } = useTaskContext();
  const [showModal, setShowModal]       = useState(false);
  const [editingTask, setEditingTask]   = useState(null);

  useEffect(() => {
    fetchStats();
    fetchTasks({ isArchived: 'false', sort: '-createdAt', limit: 6, page: 1 });
  }, []);

  const handleEdit = (task) => { setEditingTask(task); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingTask(null); };
  const handleCreate = () => { setEditingTask(null); setShowModal(true); };

  const today = new Date();
  const todayStr = format(today, 'EEEE, MMMM d');

  // Filter tasks due today from fetched list
  const dueToday = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'done') return false;
    const d = new Date(t.dueDate);
    return d.toDateString() === today.toDateString();
  });

  const completionRate = stats?.completionRate ?? 0;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle text-tertiary">{todayStr}</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleCreate}>
          <FiPlus size={16} /> New Task
        </button>
      </div>

      {/* ── Stats Row ───────────────────────────────────── */}
      <div className="stats-grid">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-value">{stats?.total ?? '—'}</span>
              <span className="stat-meta">All active tasks</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">In Progress</span>
              <span className="stat-value amber">{stats?.byStatus?.['in-progress'] ?? '—'}</span>
              <span className="stat-meta">Currently working</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <span className="stat-value green">{stats?.byStatus?.done ?? '—'}</span>
              <span className="stat-meta">All time</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Overdue</span>
              <span className="stat-value red">{stats?.overdue ?? '—'}</span>
              <span className="stat-meta">Past due date</span>
            </div>
          </>
        )}
      </div>

      {/* ── Completion Progress ──────────────────────────── */}
      <div className="progress-section">
        <div className="progress-header">
          <div>
            <span className="label">Completion Rate</span>
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiTrendingUp size={14} style={{ color: 'var(--status-done)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {stats?.byStatus?.done ?? 0} of {stats?.total ?? 0} tasks done
              </span>
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--ivory)' }}>
            {completionRate}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      {/* ── Due Today ────────────────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <span className="section-title">Due Today</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            <FiClock size={12} />{dueToday.length} task{dueToday.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="task-grid">
            <TaskCardSkeleton /><TaskCardSkeleton />
          </div>
        ) : dueToday.length === 0 ? (
          <EmptyState icon="✅" title="Nothing due today" description="You're all clear for today!" />
        ) : (
          <div className="task-grid">
            {dueToday.map((task) => (
              <TaskCard key={task._id} task={task} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Tasks ─────────────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <span className="section-title">Recent Tasks</span>
        </div>

        {loading ? (
          <div className="task-grid">
            {Array.from({ length: 3 }).map((_, i) => <TaskCardSkeleton key={i} />)}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No tasks yet"
            description="Create your first task to get started."
            action={
              <button className="btn btn-primary" onClick={handleCreate}>
                <FiPlus size={14} /> Create Task
              </button>
            }
          />
        ) : (
          <div className="task-grid">
            {tasks.slice(0, 6).map((task) => (
              <TaskCard key={task._id} task={task} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <TaskForm task={editingTask} onClose={handleClose} />
      </Modal>
    </>
  );
}
