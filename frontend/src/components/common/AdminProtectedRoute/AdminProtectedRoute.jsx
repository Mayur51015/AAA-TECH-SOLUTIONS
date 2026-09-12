import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './AdminProtectedRoute.css';

/**
 * Protected Route wrapper for Admin Portal
 * Enforces authentication and redirects unauthenticated users to /admin/login
 */
export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="admin-auth-loading" role="status" aria-live="polite">
        <div className="admin-loading-card">
          <Loader2 size={36} className="admin-loading-spinner" />
          <h3>Verifying Authentication</h3>
          <p>Validating administrative session credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember original destination
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children ? children : null;
}
