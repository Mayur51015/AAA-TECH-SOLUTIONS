import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminLogin as apiAdminLogin, getAdminMe, adminLogout as apiAdminLogout } from '../services/adminService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('aaa_admin_token') || null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Validate existing token/session on mount or refresh
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const storedToken = localStorage.getItem('aaa_admin_token');
      if (!storedToken) {
        if (isMounted) {
          setAdmin(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await getAdminMe();
        if (res && res.success && res.admin) {
          if (isMounted) {
            setAdmin(res.admin);
            setToken(storedToken);
            setAuthError('');
          }
        } else {
          // Token invalid or expired
          apiAdminLogout();
          if (isMounted) {
            setAdmin(null);
            setToken(null);
            setAuthError('Your session has expired. Please login again.');
          }
        }
      } catch (err) {
        // Backend rejected token or server error
        apiAdminLogout();
        if (isMounted) {
          setAdmin(null);
          setToken(null);
          const isExpired = err.status === 401 || err.message?.includes('expired');
          setAuthError(isExpired ? 'Your session has expired. Please login again.' : '');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verifySession();

    const handleUnauthorized = () => {
      apiAdminLogout();
      setAdmin(null);
      setToken(null);
      setAuthError('Your session has expired. Please login again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Login handler
  const login = useCallback(async (username, password) => {
    setAuthError('');
    const res = await apiAdminLogin({ username, password });

    if (res && res.success && res.token) {
      setAdmin(res.admin);
      setToken(res.token);
      return res;
    }

    throw new Error(res?.message || 'Login failed. Please check your credentials.');
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    apiAdminLogout();
    setAdmin(null);
    setToken(null);
    setAuthError('');
  }, []);

  const value = {
    admin,
    token,
    isAuthenticated: Boolean(admin && token),
    isLoading,
    authError,
    setAuthError,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
