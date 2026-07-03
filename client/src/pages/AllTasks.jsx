/**
 * All Tasks Page
 *
 * Compact toolbar: Search | Filters button (with active count badge) | Sort | View toggle
 * Filters expand into a 3-column panel below the toolbar.
 */

import { useEffect, useState, useRef } from 'react';
import { FiPlus, FiSearch, FiGrid, FiList, FiFilter, FiChevronDown, FiX } from 'react-icons/fi';
import { useTaskContext } from '../context/TaskContext.jsx';
import TaskCard from '../components/tasks/TaskCard.jsx';
import Modal from '../components/ui/Modal.jsx';
import TaskForm from '../components/tasks/TaskForm.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { TaskCardSkeleton } from '../components/ui/Skeleton.jsx';
import {
  TASK_STATUS, TASK_PRIORITY, TASK_CATEGORY,
  STATUS_LABELS, PRIORITY_LABELS, SORT_OPTIONS,
} from '../constants/index.js';

export default function AllTasks() {
  const { tasks, pagination, loading, filters, fetchTasks, setFilters, resetFilters, setPage } = useTaskContext();

  const [view, setView]               = useState('grid');
  const [showModal, setShowModal]     = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [filterOpen, setFilterOpen]   = useState(false);

  // ── Fetch whenever any filter or page changes ────────────────
  // We pass `filters` explicitly (not relying on closure) so MongoDB
  // always receives the current page, limit, sort, and filter values.
  useEffect(() => {
    fetchTasks({ ...filters });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.page, filters.status, filters.priority, filters.category, filters.search, filters.sort]);

  // ── Debounced search ────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters({ search: searchInput, page: 1 });
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleEdit   = (task) => { setEditingTask(task); setShowModal(true); };
  const handleClose  = ()     => { setShowModal(false); setEditingTask(null); };
  const handleCreate = ()     => { setEditingTask(null); setShowModal(true); };
  const handleFilter = (key, value) => setFilters({ [key]: value, page: 1 });

  // ── Active filter count (for badge) ─────────────────────────
  const activeFilterList = [
    filters.status   && { key: 'status',   label: `Status: ${STATUS_LABELS[filters.status]}` },
    filters.priority && { key: 'priority', label: `Priority: ${PRIORITY_LABELS[filters.priority]}` },
    filters.category && { key: 'category', label: `Category: ${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}` },
    filters.search   && { key: 'search',   label: `"${filters.search}"` },
  ].filter(Boolean);

  const totalPages = pagination?.totalPages || 1;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">All Tasks</h1>
          {pagination && (
            <p className="page-subtitle">
              {pagination.totalCount} task{pagination.totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleCreate}>
          <FiPlus size={16} /> New Task
        </button>
      </div>

      {/* ── Compact Toolbar ──────────────────────────────────── */}
      <div className="toolbar-row">
        {/* Search */}
        <div className="search-wrapper">
          <FiSearch className="search-icon" size={14} />
          <input
            id="tasks-search"
            className="form-control search-input"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Filters Button */}
        <button
          className={`toolbar-btn ${filterOpen ? 'active' : ''}`}
          onClick={() => setFilterOpen((p) => !p)}
        >
          <FiFilter size={14} />
          Filters
          {activeFilterList.length > 0 && (
            <span className="filter-badge">{activeFilterList.length}</span>
          )}
          <FiChevronDown
            size={13}
            style={{
              transition: 'transform 0.2s',
              transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Sort */}
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: 140 }}
          value={filters.sort}
          onChange={(e) => handleFilter('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
            title="Grid view"
          >
            <FiGrid size={14} />
          </button>
          <button
            className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
            title="List view"
          >
            <FiList size={14} />
          </button>
        </div>
      </div>

      {/* ── Filter Panel (slide down) ─────────────────────────── */}
      {filterOpen && (
        <div className="filter-panel">
          {/* Status */}
          <div>
            <div className="filter-panel-label">Status</div>
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) => handleFilter('status', e.target.value)}
            >
              <option value="">All Status</option>
              {Object.values(TASK_STATUS).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <div className="filter-panel-label">Priority</div>
            <select
              className="form-control"
              value={filters.priority}
              onChange={(e) => handleFilter('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              {Object.values(TASK_PRIORITY).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <div className="filter-panel-label">Category</div>
            <select
              className="form-control"
              value={filters.category}
              onChange={(e) => handleFilter('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.values(TASK_CATEGORY).map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Active Filter Chips ───────────────────────────────── */}
      {activeFilterList.length > 0 && (
        <div className="filter-chips">
          {activeFilterList.map(({ key, label }) => (
            <span
              key={key}
              className="filter-chip"
              onClick={() => {
                if (key === 'search') setSearchInput('');
                setFilters({ [key]: '' });
              }}
            >
              {label}
              <FiX size={11} className="filter-chip-x" />
            </span>
          ))}
          <span
            className="filter-chip"
            style={{ borderColor: 'transparent', color: 'var(--text-disabled)' }}
            onClick={() => { resetFilters(); setSearchInput(''); }}
          >
            Clear all
          </span>
        </div>
      )}

      {/* ── Task Grid / List ──────────────────────────────────── */}
      {loading ? (
        <div className={`task-grid ${view === 'list' ? 'list-view' : ''}`}>
          {Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No tasks found"
          description={activeFilterList.length ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
          action={
            !activeFilterList.length && (
              <button className="btn btn-primary" onClick={handleCreate}>
                <FiPlus size={14} /> Create Task
              </button>
            )
          }
        />
      ) : (
        <div className={`task-grid ${view === 'list' ? 'list-view' : ''}`}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onEdit={handleEdit} view={view} />
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setPage(filters.page - 1)}
            disabled={!pagination?.hasPrevPage}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - filters.page) <= 2)
            .map((p) => (
              <button
                key={p}
                className={`page-btn ${p === filters.page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          <button
            className="page-btn"
            onClick={() => setPage(filters.page + 1)}
            disabled={!pagination?.hasNextPage}
          >
            ›
          </button>
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={showModal} onClose={handleClose} title={editingTask ? 'Edit Task' : 'New Task'}>
        <TaskForm task={editingTask} onClose={handleClose} />
      </Modal>
    </>
  );
}
