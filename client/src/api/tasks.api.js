/**
 * Task API Methods
 *
 * All task-related HTTP calls. Each function returns the `data`
 * property from the ApiResponse (unwrapped by the Axios interceptor).
 */

import api from './axios.js';

/**
 * Build a query string from a filters object, omitting empty values.
 */
const buildParams = (filters = {}) => {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params[key] = value;
    }
  });
  return params;
};

export const taskApi = {
  /** GET /tasks — list with filters, search, sort, pagination */
  getAll: (filters) => api.get('/tasks', { params: buildParams(filters) }),

  /** GET /tasks/stats — dashboard statistics */
  getStats: () => api.get('/tasks/stats'),

  /** GET /tasks/:id — single task */
  getById: (id) => api.get(`/tasks/${id}`),

  /** POST /tasks — create */
  create: (data) => api.post('/tasks', data),

  /** PATCH /tasks/:id — partial update */
  update: (id, data) => api.patch(`/tasks/${id}`, data),

  /** DELETE /tasks/:id — soft delete */
  delete: (id) => api.delete(`/tasks/${id}`),

  /** PATCH /tasks/:id/restore — undo delete */
  restore: (id) => api.patch(`/tasks/${id}/restore`),

  /** PATCH /tasks/:id/archive — archive */
  archive: (id) => api.patch(`/tasks/${id}/archive`),

  /** PATCH /tasks/:id/unarchive — restore from archive */
  unarchive: (id) => api.patch(`/tasks/${id}/unarchive`),
};
