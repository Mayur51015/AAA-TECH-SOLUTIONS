import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, User, Key, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/admin/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Sync auth errors
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Client-side validation
    if (!cleanUsername) {
      setError('Please enter your Admin Username or ID.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(cleanUsername, cleanPassword);
      const destination = location.state?.from?.pathname || '/admin/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="container">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <Link to="/" title="Back to AAA Tech Solutions Home">
              <img src={logoImg} alt="AAA Tech Solutions" className="admin-brand-logo" />
            </Link>
          </div>
          <div className="admin-login-header">
            <div className="admin-lock-icon-box" aria-hidden="true">
              <Lock size={28} />
            </div>
            <h1 className="admin-login-title">Administrator Portal</h1>
            <p className="admin-login-desc">
              Sign in with your administrative credentials to access the control center.
            </p>
          </div>

          {error && (
            <div className="admin-login-error-alert" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-username">
                Admin ID / Username <span className="req-star">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" aria-hidden="true" />
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter admin ID or username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  className="form-input has-left-icon"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                Password <span className="req-star">*</span>
              </label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="form-input has-left-icon"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg admin-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner-icon" aria-hidden="true" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>End-to-end encrypted administrative session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
