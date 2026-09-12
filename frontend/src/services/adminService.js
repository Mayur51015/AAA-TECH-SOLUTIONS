import { apiRequest } from './api';

/**
 * Submit administrative login credentials to backend
 * @param {{ username?: string, adminId?: string, email?: string, password: string }} credentials
 */
export async function adminLogin(credentials) {
  const payload = {
    username: credentials.username || credentials.adminId || credentials.email,
    password: credentials.password
  };

  const res = await apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res && res.token) {
    localStorage.setItem('aaa_admin_token', res.token);
  }
  return res;
}

/**
 * Get current authenticated admin profile
 */
export async function getAdminMe() {
  return await apiRequest('/admin/me');
}

/**
 * Get dashboard overview metrics and statistics
 */
export async function getAdminStats() {
  return await apiRequest('/admin/stats');
}

/**
 * Terminate admin session and purge stored token
 */
export function adminLogout() {
  try {
    localStorage.removeItem('aaa_admin_token');
  } catch (err) {
    console.warn('Could not remove token from storage:', err);
  }
}
