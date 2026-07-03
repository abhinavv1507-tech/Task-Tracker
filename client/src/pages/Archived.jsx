/**
 * Archived Tasks Page
 */

import { useEffect, useState } from 'react';
import { FiArchive, FiRefreshCw } from 'react-icons/fi';
import { taskApi } from '../api/tasks.api.js';
import { useTaskContext } from '../context/TaskContext.jsx';
import { TaskCardSkeleton } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { PriorityBadge, StatusBadge, CategoryChip } from '../components/ui/Badge.jsx';
import toast from 'react-hot-toast';

export default function Archived() {
  const [archived, setArchived]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const { fetchStats }            = useTaskContext();

  const load = async () => {
    setLoading(true);
    try {
      const res = await taskApi.getAll({ isArchived: 'true', limit: 50, sort: '-createdAt' });
      setArchived(res.data?.tasks || []);
    } catch {
      toast.error('Failed to load archived tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUnarchive = async (id) => {
    try {
      await taskApi.unarchive(id);
      setArchived((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task restored from archive');
      fetchStats();
    } catch {
      toast.error('Failed to unarchive task');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Archived</h1>
          <p className="page-subtitle">{archived.length} archived task{archived.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="task-grid">
          {Array.from({ length: 3 }).map((_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : archived.length === 0 ? (
        <EmptyState icon={<FiArchive />} title="No archived tasks" description="Tasks you archive will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {archived.map((task) => (
            <div key={task._id} className="task-list-row card">
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {task.title}
              </span>
              <CategoryChip category={task.category} />
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleUnarchive(task._id)}
                title="Restore from archive"
              >
                <FiRefreshCw size={13} /> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
