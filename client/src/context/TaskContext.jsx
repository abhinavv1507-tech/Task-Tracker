/**
 * Task Context
 *
 * Global state for tasks using useReducer.
 * Provides: tasks list, stats, pagination, filters, loading/error states.
 * All side effects (API calls) live here so components stay thin.
 */

import { createContext, useContext, useReducer, useCallback } from 'react';
import { taskApi } from '../api/tasks.api.js';
import { DEFAULT_FILTERS } from '../constants/index.js';
import toast from 'react-hot-toast';

// ── State Shape ───────────────────────────────────────────
const initialState = {
  tasks:      [],
  stats:      null,
  pagination: null,
  filters:    { ...DEFAULT_FILTERS, isArchived: 'false' },
  loading:    false,
  statsLoading: false,
  error:      null,
};

// ── Action Types ──────────────────────────────────────────
const A = {
  FETCH_START:    'FETCH_START',
  FETCH_SUCCESS:  'FETCH_SUCCESS',
  FETCH_ERROR:    'FETCH_ERROR',
  STATS_START:    'STATS_START',
  STATS_SUCCESS:  'STATS_SUCCESS',
  SET_FILTERS:    'SET_FILTERS',
  RESET_FILTERS:  'RESET_FILTERS',
  ADD_TASK:       'ADD_TASK',
  UPDATE_TASK:    'UPDATE_TASK',
  REMOVE_TASK:    'REMOVE_TASK',
};

// ── Reducer ───────────────────────────────────────────────
function taskReducer(state, { type, payload }) {
  switch (type) {
    case A.FETCH_START:
      return { ...state, loading: true, error: null };
    case A.FETCH_SUCCESS:
      return { ...state, loading: false, tasks: payload.tasks, pagination: payload.pagination };
    case A.FETCH_ERROR:
      return { ...state, loading: false, error: payload };
    case A.STATS_START:
      return { ...state, statsLoading: true };
    case A.STATS_SUCCESS:
      return { ...state, statsLoading: false, stats: payload };
    case A.SET_FILTERS: {
      const newFilters = { ...state.filters, ...payload };
      // Only reset to page 1 when changing filters (not when explicitly setting page)
      if (!('page' in payload)) newFilters.page = 1;
      return { ...state, filters: newFilters };
    }
    case A.RESET_FILTERS:
      return { ...state, filters: { ...DEFAULT_FILTERS } };
    case A.ADD_TASK:
      return { ...state, tasks: [payload, ...state.tasks] };
    case A.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((t) => (t._id === payload._id ? payload : t)),
      };
    case A.REMOVE_TASK:
      return { ...state, tasks: state.tasks.filter((t) => t._id !== payload) };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────
const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // ── Fetch tasks ──────────────────────────────────────────────
  // IMPORTANT: accepts explicit params — no state.filters captured in closure.
  // This avoids stale values when page/filter changes trigger the effect.
  const fetchTasks = useCallback(async (params = {}) => {
    dispatch({ type: A.FETCH_START });
    try {
      const res = await taskApi.getAll(params);
      dispatch({ type: A.FETCH_SUCCESS, payload: res.data });
    } catch (err) {
      dispatch({ type: A.FETCH_ERROR, payload: err.message });
      toast.error(err.message || 'Failed to fetch tasks');
    }
  }, []); // no deps — intentionally stateless

  // ── Fetch stats ──────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    dispatch({ type: A.STATS_START });
    try {
      const res = await taskApi.getStats();
      dispatch({ type: A.STATS_SUCCESS, payload: res.data });
    } catch {
      // Non-critical — fail silently
    }
  }, []);

  // ── Create task ──────────────────────────────────────────
  const createTask = useCallback(async (data) => {
    const res = await taskApi.create(data);
    dispatch({ type: A.ADD_TASK, payload: res.data });
    toast.success('Task created');
    return res.data;
  }, []);

  // ── Update task ──────────────────────────────────────────
  const updateTask = useCallback(async (id, data) => {
    const res = await taskApi.update(id, data);
    dispatch({ type: A.UPDATE_TASK, payload: res.data });
    toast.success('Task updated');
    return res.data;
  }, []);

  // ── Soft-delete with undo toast ──────────────────────────
  const deleteTask = useCallback(async (id, title = 'Task') => {
    dispatch({ type: A.REMOVE_TASK, payload: id });
    const toastId = toast(
      (t) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>"{title}" deleted</span>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await taskApi.restore(id);
                dispatch({ type: A.ADD_TASK, payload: res.data });
                toast.success('Task restored');
              } catch {
                toast.error('Could not restore task');
              }
            }}
            style={{
              background: '#F0EBE1',
              color: '#111',
              border: 'none',
              borderRadius: 4,
              padding: '3px 10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.78rem',
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 5000 }
    );
    try {
      await taskApi.delete(id);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.message || 'Delete failed');
    }
  }, []);

  // ── Archive ──────────────────────────────────────────────
  const archiveTask = useCallback(async (id) => {
    const res = await taskApi.archive(id);
    dispatch({ type: A.REMOVE_TASK, payload: id });
    toast.success('Task archived');
    return res.data;
  }, []);

  // ── Set filters ──────────────────────────────────────────
  const setFilters = useCallback((updates) => {
    dispatch({ type: A.SET_FILTERS, payload: updates });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: A.RESET_FILTERS });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: A.SET_FILTERS, payload: { page } });
  }, []);

  const value = {
    ...state,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
    archiveTask,
    setFilters,
    resetFilters,
    setPage,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};
