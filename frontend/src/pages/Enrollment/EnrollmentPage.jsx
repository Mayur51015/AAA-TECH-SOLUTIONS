import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight, BookOpen, Clock, User, Mail, Phone, GraduationCap, MessageSquare, AlertCircle } from 'lucide-react';
import { coursesData } from '../../data/courses';
import { submitEnrollmentApplication, getCourses } from '../../services';
import './EnrollmentPage.css';

export default function EnrollmentPage() {
  const [searchParams] = useSearchParams();

  // Real courses from API
  const [apiCourses, setApiCourses] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      try {
        const courses = await getCourses();
        if (courses && courses.length > 0 && isMounted) {
          setApiCourses(courses);
        }
      } catch (err) {
        console.warn('Failed to load courses from API:', err.message);
      }
    }
    loadCourses();
    return () => { isMounted = false; };
  }, []);

  // Build course options — prefer API courses (numeric MySQL IDs)
  const courseOptions = apiCourses.length > 0 ? apiCourses : coursesData;
  const firstCourseId = courseOptions[0]?.id || coursesData[0]?.id || '';

  // Resolve initial course from URL params
  const paramCourse = searchParams.get('course');
  let initialCourseId = firstCourseId;
  if (paramCourse) {
    // Try to find matching course by slug or numeric id
    const matched = courseOptions.find(c =>
      String(c.id) === paramCourse ||
      c.slug === paramCourse
    );
    initialCourseId = matched ? matched.id : paramCourse;
  }

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    courseId: initialCourseId,
    qualification: 'Bachelor\'s Degree (Computer Science / Tech)',
    goals: '',
    agreeTerms: true
  });

  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update courseId when URL params change
  useEffect(() => {
    const paramCourseVal = searchParams.get('course');
    if (paramCourseVal && courseOptions.length > 0) {
      const matched = courseOptions.find(c =>
        String(c.id) === paramCourseVal ||
        c.slug === paramCourseVal
      );
      if (matched) {
        setFormData(prev => ({ ...prev, courseId: matched.id }));
      }
    }
  }, [searchParams, apiCourses]);

  const selectedCourseObj = courseOptions.find(c => String(c.id) === String(formData.courseId)) || courseOptions[0] || coursesData[0];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Please enter your full name.';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Please provide a valid email address.';
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) errors.phone = 'Please provide a valid 10-digit phone number.';
    if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to the enrollment terms.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const combinedNotes = [
        formData.qualification ? `Qualification: ${formData.qualification}` : '',
        formData.goals.trim() ? `Goals: ${formData.goals.trim()}` : ''
      ].filter(Boolean).join(' | ');

      const result = await submitEnrollmentApplication({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.phone.trim(),
        course_id: Number(formData.courseId) || formData.courseId,
        message: combinedNotes
      });

      const enrollmentId = result?.data?.id || result?.enrollmentId;
      setRefId(enrollmentId ? `AAA-ENR-${enrollmentId}` : `AAA-ENR-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSubmitting(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (apiErr) {
      setIsSubmitting(false);
      const errorMessage = apiErr?.message || 'Enrollment submission failed. Please try again or contact us via WhatsApp.';
      setApiError(errorMessage);
    }
  };

  const dynamicWaUrl = `https://wa.me/917358533721?text=${encodeURIComponent(
    `🎓 *New Enrollment Enquiry — AAA Tech Solutions*\n\n` +
    `👤 *Name:* ${formData.fullName || 'Prospective Student'}\n` +
    `📱 *Phone:* ${formData.phone || 'Not provided'}\n` +
    `✉️ *Email:* ${formData.email || 'Not provided'}\n` +
    `📚 *Program:* ${selectedCourseObj.title}\n` +
    `💬 *Notes:* ${formData.goals || 'Interested in batch details and schedule.'}`
  )}`;

  return (
    <div className="enrollment-page-view">
      {/* Header */}
      <section className="enrollment-hero-section">
        <div className="container">
          <div className="enrollment-hero-content">
            <span className="section-tag section-tag-dark">🎓 Admissions & Enrollment</span>
            <h1 className="enrollment-hero-title">
              {submitted ? 'Enrollment Application Received' : 'Apply for AAA Tech Solutions Cohorts'}
            </h1>
            <p className="enrollment-hero-lead">
              {submitted
                ? 'Thank you for applying. Our admissions and technical mentoring team will review your application.'
                : 'Complete the application below to secure your seat in our upcoming live mentor-guided cohort.'}
            </p>
          </div>
        </div>
      </section>

      <section className="section enrollment-form-section">
        <div className="container">
          {!submitted ? (
            <div className="enrollment-layout-grid">
              {/* Left Column: Form */}
              <div className="enrollment-form-container card">
                <h2 className="form-section-title">Candidate Details</h2>
                <p className="form-section-desc">Please provide accurate contact and educational details.</p>

                <form onSubmit={handleSubmit} className="enrollment-form" noValidate>
                  {/* API Error Banner */}
                  {apiError && (
                    <div className="modal-api-error-banner" role="alert">
                      <AlertCircle size={16} aria-hidden="true" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
                      Full Legal Name <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Priya Sharma"
                        className={`form-input ${formErrors.fullName ? 'input-error' : ''}`}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
                  </div>

                  {/* Email & Phone Row */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address <span className="req">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Mail size={16} className="input-icon" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="priya@example.com"
                          className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone / WhatsApp <span className="req">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Phone size={16} className="input-icon" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                    </div>
                  </div>

                  {/* Course Selection */}
                  <div className="form-group">
                    <label htmlFor="courseId" className="form-label">
                      Select Program Track <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <BookOpen size={16} className="input-icon" />
                      <select
                        id="courseId"
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        className="form-input form-select"
                        disabled={isSubmitting}
                      >
                        {courseOptions.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.title} — {c.duration || ''} ({c.level || ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Qualification */}
                  <div className="form-group">
                    <label htmlFor="qualification" className="form-label">
                      Highest Level of Education / Experience
                    </label>
                    <div className="input-with-icon">
                      <GraduationCap size={16} className="input-icon" />
                      <select
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="form-input form-select"
                        disabled={isSubmitting}
                      >
                        <option value="Bachelor's Degree (Computer Science / Tech)">Bachelor's Degree (CS / Tech)</option>
                        <option value="Bachelor's Degree (Other Discipline)">Bachelor's Degree (Other)</option>
                        <option value="Master's Degree or Higher">Master's Degree or Higher</option>
                        <option value="Associate Degree / Diploma">Diploma / Vocational</option>
                        <option value="Self-Taught / Industry Working Professional">Working Professional</option>
                      </select>
                    </div>
                  </div>

                  {/* Learning Goals */}
                  <div className="form-group">
                    <label htmlFor="goals" className="form-label">
                      Questions or Learning Objectives (Optional)
                    </label>
                    <textarea
                      id="goals"
                      name="goals"
                      rows="3"
                      value={formData.goals}
                      onChange={handleInputChange}
                      placeholder="Briefly describe your career goals or specific questions..."
                      className="form-input form-textarea"
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  {/* Terms */}
                  <div className="form-group-checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                      <span>I agree to the <Link to="/terms" target="_blank">Enrollment Guidelines</Link> and <Link to="/privacy-policy" target="_blank">Privacy Policy</Link>.</span>
                    </label>
                    {formErrors.agreeTerms && <span className="error-text">{formErrors.agreeTerms}</span>}
                  </div>

                  <div className="form-buttons-group">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg submit-enroll-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <span>Submit Enrollment Application</span>
                          <ArrowRight size={18} aria-hidden="true" />
                        </>
                      )}
                    </button>
                    <a href={dynamicWaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-lg enroll-wa-direct">
                      <MessageSquare size={18} />
                      <span>Or Enquire Directly on WhatsApp</span>
                    </a>
                  </div>
                </form>
              </div>

              {/* Right Column: Selected Course Summary */}
              <div className="enrollment-summary-sidebar">
                <div className="selected-summary-card card">
                  <span className="summary-tag">Selected Program Track</span>
                  <h3 className="summary-title">{selectedCourseObj.title}</h3>
                  <p className="summary-desc">{selectedCourseObj.shortDescription || selectedCourseObj.description || ''}</p>

                  <div className="summary-meta-list">
                    <div className="summary-meta-item">
                      <Clock size={15} className="summary-meta-icon" />
                      <span>Duration: <strong>{selectedCourseObj.duration}</strong></span>
                    </div>
                    {selectedCourseObj.schedule && (
                      <div className="summary-meta-item">
                        <CheckCircle2 size={15} className="summary-meta-icon" />
                        <span>Schedule: <strong>{selectedCourseObj.schedule}</strong></span>
                      </div>
                    )}
                    {selectedCourseObj.fees && (
                      <div className="summary-meta-item">
                        <ShieldCheck size={15} className="summary-meta-icon" />
                        <span>Tuition: <strong>{selectedCourseObj.fees}</strong></span>
                      </div>
                    )}
                  </div>

                  {selectedCourseObj.tags && (
                    <div className="summary-tags-row">
                      {selectedCourseObj.tags.map((t, idx) => (
                        <span key={idx} className="summary-tag-pill">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="summary-note">
                    <AlertCircle size={15} className="summary-note-icon" />
                    <p>MSME Registered Enterprise | Cohorts are strictly limited to ensure 1-on-1 mentorship.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Confirmation State */
            <div className="enrollment-confirmation-container">
              <div className="confirmation-card card">
                <div className="confirmation-icon-box">
                  <CheckCircle2 size={48} className="confirm-icon" />
                </div>
                <span className="confirmation-tag">Application Received</span>
                <h2 className="confirm-title">Registration Acknowledged</h2>
                <p className="confirm-desc">
                  Thank you, <strong>{formData.fullName}</strong>. Your enrollment application for <strong>{selectedCourseObj.title}</strong> has been logged with the Admissions Office.
                </p>

                <div className="confirmation-ref-box">
                  <span className="ref-label">Application Reference ID</span>
                  <span className="ref-code">{refId}</span>
                </div>

                <div className="confirm-details-grid">
                  <div className="confirm-detail-box">
                    <span className="detail-label">Candidate Name</span>
                    <span className="detail-value">{formData.fullName}</span>
                  </div>
                  <div className="confirm-detail-box">
                    <span className="detail-label">Notification Email</span>
                    <span className="detail-value">{formData.email}</span>
                  </div>
                  <div className="confirm-detail-box">
                    <span className="detail-label">Program Track</span>
                    <span className="detail-value">{selectedCourseObj.title}</span>
                  </div>
                  <div className="confirm-detail-box">
                    <span className="detail-label">Admissions Review</span>
                    <span className="detail-value">Within 24 Hours</span>
                  </div>
                </div>

                <div className="confirmation-actions">
                  <a href={dynamicWaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-lg">
                    <MessageSquare size={18} />
                    <span>WhatsApp Us for Faster Response</span>
                  </a>
                  <Link to="/" className="btn btn-primary">
                    Return to Home
                  </Link>
                  <Link to="/courses" className="btn btn-outline">
                    Explore Other Programs
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
