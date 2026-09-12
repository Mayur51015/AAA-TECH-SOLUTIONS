import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  LogOut,
  GraduationCap,
  Mail,
  MessageSquare,
  Briefcase,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminStats,
  getEnrollments,
  updateEnrollmentStatus,
  getContacts,
  updateContactStatus
} from '../../services';
import { apiRequest } from '../../services/api';
import './AdminPage.css';

export default function AdminPage() {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, enrollments, contacts, reviews, applications

  // Dashboard Data State
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    totalContacts: 0,
    totalReviews: 0,
    totalApplications: 0
  });
  const [enrollments, setEnrollments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Load Stats
      const statsRes = await getAdminStats().catch(() => null);
      if (statsRes?.data) setStats(statsRes.data);

      // 2. Load Enrollments
      const enrollRes = await getEnrollments().catch(() => null);
      if (enrollRes?.data) setEnrollments(enrollRes.data);

      // 3. Load Contacts
      const contactsRes = await getContacts().catch(() => null);
      if (contactsRes?.data) setContacts(contactsRes.data);

      // 4. Load Reviews
      const revRes = await apiRequest('/admin/reviews').catch(() => null);
      if (revRes?.data) setReviews(revRes.data);

      // 5. Load Applications
      const appRes = await apiRequest('/applications').catch(() => null);
      if (appRes?.data) setApplications(appRes.data);
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Status Updaters
  const handleEnrollmentStatusChange = async (id, newStatus) => {
    try {
      await updateEnrollmentStatus(id, newStatus);
      setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleContactStatusChange = async (id, newStatus) => {
    try {
      await updateContactStatus(id, newStatus);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleReviewStatusChange = async (id, newStatus) => {
    try {
      await apiRequest(`/admin/reviews/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert('Failed to update review status: ' + err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' });
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete review: ' + err.message);
    }
  };

  const handleApplicationStatusChange = async (id, newStatus) => {
    try {
      await apiRequest(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // -------------------------------------------------------
  // RENDER: AUTHENTICATED DASHBOARD
  // -------------------------------------------------------
  return (
    <div className="admin-page-container">
      <div className="container">
        {/* Top Header */}
        <div className="admin-dashboard-header">
          <div>
            <h1 className="admin-welcome-title">Control Center</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              Welcome back, <strong>{admin?.name || 'Administrator'}</strong> <span className="admin-role-badge">{admin?.role || 'admin'}</span>
            </p>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-action-btn"
              onClick={loadDashboardData}
              disabled={isLoadingData}
              title="Refresh Data"
            >
              <RefreshCw size={15} className={isLoadingData ? 'spinner-icon' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="admin-action-btn btn-danger"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="admin-metric-icon icon-blue">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="admin-metric-val">{stats.totalEnrollments || enrollments.length}</div>
              <div className="admin-metric-lbl">Total Enrollments</div>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon icon-emerald">
              <Mail size={24} />
            </div>
            <div>
              <div className="admin-metric-val">{stats.totalContacts || contacts.length}</div>
              <div className="admin-metric-lbl">Client Inquiries</div>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon icon-amber">
              <Star size={24} />
            </div>
            <div>
              <div className="admin-metric-val">{stats.totalReviews || reviews.length}</div>
              <div className="admin-metric-lbl">Student Reviews</div>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon icon-purple">
              <Briefcase size={24} />
            </div>
            <div>
              <div className="admin-metric-val">{stats.totalApplications || applications.length}</div>
              <div className="admin-metric-lbl">Job Applications</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Clock size={16} />
            <span>Overview</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
            onClick={() => setActiveTab('enrollments')}
          >
            <GraduationCap size={16} />
            <span>Enrollments</span>
            <span className="tab-badge">{enrollments.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Mail size={16} />
            <span>Inquiries</span>
            <span className="tab-badge">{contacts.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={16} />
            <span>Reviews</span>
            <span className="tab-badge">{reviews.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <Briefcase size={16} />
            <span>Careers</span>
            <span className="tab-badge">{applications.length}</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Recent Student Enrollments</h2>
            </div>
            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state-cell">No enrollments recorded yet.</td>
                    </tr>
                  ) : (
                    enrollments.slice(0, 8).map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.full_name}</strong></td>
                        <td>{item.mobile}</td>
                        <td>{item.email}</td>
                        <td>{item.course_title || 'Selected Program'}</td>
                        <td>{item.plan_name || 'Standard'}</td>
                        <td>
                          <span className={`status-badge status-${item.status}`}>{item.status}</span>
                        </td>
                        <td>{new Date(item.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Enrollments */}
        {activeTab === 'enrollments' && (
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Course Applications ({enrollments.length})</h2>
            </div>
            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Contact</th>
                    <th>Course</th>
                    <th>Plan</th>
                    <th>Notes / Message</th>
                    <th>Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state-cell">No enrollments found.</td>
                    </tr>
                  ) : (
                    enrollments.map(item => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td><strong>{item.full_name}</strong></td>
                        <td>
                          <div>{item.mobile}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.email}</div>
                        </td>
                        <td>{item.course_title || 'General'}</td>
                        <td>{item.plan_name || 'Standard'}</td>
                        <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{item.message || '—'}</td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => handleEnrollmentStatusChange(item.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Contacts */}
        {activeTab === 'contacts' && (
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Contact Inquiries ({contacts.length})</h2>
            </div>
            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sender Name</th>
                    <th>Email & Phone</th>
                    <th>Subject / Type</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state-cell">No inquiries found.</td>
                    </tr>
                  ) : (
                    contacts.map(item => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td><strong>{item.name}</strong></td>
                        <td>
                          <div>{item.email}</div>
                          {item.phone && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.phone}</div>}
                        </td>
                        <td>{item.subject}</td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{item.message}</td>
                        <td>{new Date(item.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => handleContactStatusChange(item.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Student Reviews Moderation ({reviews.length})</h2>
            </div>
            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Course</th>
                    <th>Rating</th>
                    <th>Feedback</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state-cell">No reviews submitted yet.</td>
                    </tr>
                  ) : (
                    reviews.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.course_title || 'General'}</td>
                        <td>
                          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>★ {item.rating}.0</span>
                        </td>
                        <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>"{item.review_text}"</td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => handleReviewStatusChange(item.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-action-btn btn-danger"
                            onClick={() => handleDeleteReview(item.id)}
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Applications */}
        {activeTab === 'applications' && (
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Career Applications ({applications.length})</h2>
            </div>
            <div className="admin-table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Resume</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state-cell">No job applications submitted yet.</td>
                    </tr>
                  ) : (
                    applications.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.job_title || 'Position'}</td>
                        <td>{item.phone}</td>
                        <td>{item.email}</td>
                        <td>
                          {item.resume_url ? (
                            <a href={item.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7' }}>
                              View Resume
                            </a>
                          ) : '—'}
                        </td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => handleApplicationStatusChange(item.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
