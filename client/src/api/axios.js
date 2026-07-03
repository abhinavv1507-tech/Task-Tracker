/**
 * Centralized Axios Instance
 *
 * All API calls go through this instance.
 * - Base URL from environment variable
 * - 10 second timeout
 * - Request interceptor: sets Content-Type
 * - Response interceptor: extracts data, handles errors globally
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ───────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────
api.interceptors.response.use(
  // On success: unwrap the data property from ApiResponse
  (response) => response.data,

  // On error: extract message, show toast for network errors
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // Network error (no response from server)
    if (!error.response) {
      toast.error('Cannot connect to server. Is it running?');
    }

    return Promise.reject({
      message,
      errors: error.response?.data?.errors || [],
      status: error.response?.status,
    });
  }
);

export default api;
