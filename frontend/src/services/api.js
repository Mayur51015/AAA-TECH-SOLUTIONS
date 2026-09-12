/**
 * Centralized API Client
 * AAA Tech Solutions
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal API Request Wrapper
 * @param {string} endpoint - Relative path (e.g. '/courses' or '/enrollments')
 * @param {RequestInit} [options] - Fetch configuration options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const cleanBase = API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = `${cleanBase}/${cleanEndpoint}`;

  // Retrieve token from localStorage if present (for Admin)
  let authToken = null;
  try {
    authToken = localStorage.getItem('aaa_admin_token');
  } catch {}

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutMs = options.timeout || 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && authToken) {
        try {
          localStorage.removeItem('aaa_admin_token');
          window.dispatchEvent(new Event('auth:unauthorized'));
        } catch {}
      }
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Server request timed out. Please verify backend is running on http://localhost:5000');
    }
    throw error;
  }
}
