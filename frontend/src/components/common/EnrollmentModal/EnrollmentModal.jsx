import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, MessageSquare, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useEnrollmentModal } from '../../../context/EnrollmentContext';
import { coursesData } from '../../../data/courses';
import { companyInfo } from '../../../data/company';
import { submitEnrollmentApplication, getCourses, getCoursePlans } from '../../../services';
import './EnrollmentModal.css';

export default function EnrollmentModal() {
  const { isEnrollmentOpen, selectedCourseId, selectedPlan, closeEnrollmentModal } = useEnrollmentModal();
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Real courses & plans from API
  const [apiCourses, setApiCourses] = useState([]);
  const [apiPlans, setApiPlans] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    courseId: '',
    plan: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');

  // Fetch courses and plans from MySQL on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const courses = await getCourses();
        if (courses && courses.length > 0 && isMounted) {
          setApiCourses(courses);
        }
      } catch (err) {
        console.warn('Failed to load courses from API:', err.message);
      }

      try {
        const plans = await getCoursePlans();
        if (plans && plans.length > 0 && isMounted) {
          setApiPlans(plans);
        }
      } catch (err) {
        console.warn('Failed to load plans from API:', err.message);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Build the list of courses for the dropdown
  // Prefer API courses (have numeric MySQL IDs), fallback to static data
  const courseOptions = apiCourses.length > 0
    ? apiCourses.map(c => ({ id: c.id, title: c.title, duration: c.duration || '', slug: c.slug }))
    : coursesData.map(c => ({ id: c.id, title: c.title, duration: c.duration || '', slug: c.id }));

  // Build the list of plans for the dropdown
  const planOptions = apiPlans.length > 0
    ? apiPlans.map(p => ({
        id: p.id,
        value: String(p.id),
        label: `${p.name} (${p.price}${p.billing ? ` ${p.billing}` : ''} — ${p.description || ''})`
      }))
    : [
        { id: 1, value: '1', label: "Starter (₹1,000 — Single Module / Topic)" },
        { id: 2, value: '2', label: "Monthly (₹1,500/mo — 1 Month Full Course)" },
        { id: 3, value: '3', label: "2-Month (₹3,000 — 2 Month Full Course)" },
        { id: 4, value: '4', label: "Premium (₹5,000 — Advanced Bundle & Mentorship)" }
      ];

  // Sync selectedCourseId & selectedPlan when modal opens
  useEffect(() => {
    if (isEnrollmentOpen) {
      let initialCourseId = '';
      let initialPlanId = '';

      // Resolve selectedCourseId — may be numeric ID or string slug
      if (selectedCourseId) {
        if (!isNaN(selectedCourseId)) {
          // Numeric ID from API
          initialCourseId = String(selectedCourseId);
        } else {
          // String slug from static data — find matching API course
          const matched = courseOptions.find(c =>
            String(c.id) === String(selectedCourseId) ||
            c.slug === selectedCourseId ||
            c.title.toLowerCase() === String(selectedCourseId).toLowerCase()
          );
          initialCourseId = matched ? String(matched.id) : selectedCourseId;
        }
      }

      // Resolve selectedPlan — may be numeric ID or plan name string
      if (selectedPlan) {
        if (!isNaN(selectedPlan)) {
          initialPlanId = String(selectedPlan);
        } else {
          // Match by plan name
          const matchedPlan = apiPlans.find(p =>
            p.name && p.name.toLowerCase() === selectedPlan.toLowerCase()
          ) || apiPlans.find(p =>
            p.planValue && p.planValue.toLowerCase() === selectedPlan.toLowerCase()
          );
          initialPlanId = matchedPlan ? String(matchedPlan.id) : '';

          // Fallback: try static plan options
          if (!initialPlanId) {
            const staticMatch = planOptions.find(p =>
              p.label.toLowerCase().includes(selectedPlan.toLowerCase())
            );
            initialPlanId = staticMatch ? staticMatch.value : '';
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        courseId: initialCourseId,
        plan: initialPlanId
      }));
      setFormErrors({});
      setApiError('');
      setSubmitted(false);

      // Focus first input on open
      const timer = setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isEnrollmentOpen, selectedCourseId, selectedPlan]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isEnrollmentOpen && !isSubmitting) {
        closeEnrollmentModal();
      }
    };

    if (isEnrollmentOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnrollmentOpen, isSubmitting, closeEnrollmentModal]);

  if (!isEnrollmentOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter your mobile number.';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.courseId) {
      errors.courseId = 'Please select the course you are interested in.';
    }

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
      const result = await submitEnrollmentApplication({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.phone.trim(),
        course_id: Number(formData.courseId) || formData.courseId,
        plan_id: formData.plan ? (Number(formData.plan) || null) : null,
        message: formData.message.trim()
      });

      // Use server-returned enrollment ID
      const enrollmentId = result?.data?.id || result?.enrollmentId;
      setRefId(enrollmentId ? `AAA-ENR-${enrollmentId}` : `AAA-ENR-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (apiErr) {
      setIsSubmitting(false);
      const errorMessage = apiErr?.message || apiErr?.data?.message || 'Enrollment submission failed. Please try again or contact us via WhatsApp.';
      setApiError(errorMessage);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      closeEnrollmentModal();
    }
  };

  // Find selected course object for WhatsApp message
  const selectedCourseObj = courseOptions.find(c => String(c.id) === String(formData.courseId));
  const selectedCourseName = selectedCourseObj?.title || 'General Course Track';

  // WhatsApp Enquiry Link Construction
  const waNumber = companyInfo.contact.whatsapp || '917358533721';
  const waMessage = encodeURIComponent(
    `🎓 *New Enrollment Enquiry — AAA Tech Solutions*\n\n` +
    `👤 *Name:* ${formData.fullName.trim() || 'Prospective Student'}\n` +
    `📱 *Mobile:* ${formData.phone.trim() || 'Not provided'}\n` +
    `✉️ *Email:* ${formData.email.trim() || 'Not provided'}\n` +
    `📚 *Course:* ${selectedCourseName}\n` +
    `📋 *Preferred Plan:* ${formData.plan || 'Standard Cohort'}\n` +
    `💬 *Notes:* ${formData.message.trim() || 'Interested in syllabus, fees, and next batch schedule.'}`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div
      className="enrollment-modal-backdrop"
      onClick={handleBackdropClick}
      aria-hidden={!isEnrollmentOpen}
    >
      <div
        className="enrollment-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-modal-title"
        ref={modalRef}
      >
        {/* Modal Header */}
        <div className="enrollment-modal-header">
          <div className="modal-title-wrap">
            <h2 id="enrollment-modal-title" className="enrollment-modal-title">
              <span className="modal-title-icon">🎓</span>
              <span>Enroll Now</span>
            </h2>
            <p className="enrollment-modal-subtitle">
              Apply for cohort learning with direct engineer mentorship.
            </p>
          </div>
          <button
            type="button"
            className="enrollment-modal-close-btn"
            onClick={closeEnrollmentModal}
            aria-label="Close enrollment dialog"
            disabled={isSubmitting}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="enrollment-modal-body">
          {submitted ? (
            <div className="enrollment-success-view">
              <div className="success-icon-badge">
                <CheckCircle2 size={48} className="success-check" />
              </div>
              <h3 className="success-heading">Enrollment Application Received!</h3>
              <p className="success-message">
                Thank you for applying, <strong>{formData.fullName}</strong>. Our admissions and engineering team will review your profile and reach out within 24 hours.
              </p>

              <div className="enrollment-ref-card">
                <span className="ref-label">Application Reference ID</span>
                <span className="ref-number">{refId}</span>
              </div>

              <div className="success-actions-row">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa btn-lg modal-wa-btn"
                >
                  <MessageSquare size={18} aria-hidden="true" />
                  <span>Connect with Us on WhatsApp</span>
                </a>
                <button
                  type="button"
                  className="btn btn-outline btn-lg modal-close-action-btn"
                  onClick={closeEnrollmentModal}
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="enrollment-modal-form" noValidate>
              {/* API Error Banner */}
              {apiError && (
                <div className="modal-api-error-banner" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className={`modal-form-group ${formErrors.fullName ? 'has-error' : ''}`}>
                <label htmlFor="modal-full-name" className="modal-form-label">
                  Full Name <span className="req-asterisk">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="modal-full-name"
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="modal-form-input"
                  disabled={isSubmitting}
                  autoComplete="name"
                />
                {formErrors.fullName && (
                  <span className="modal-field-error" role="alert">{formErrors.fullName}</span>
                )}
              </div>

              {/* Mobile Number */}
              <div className={`modal-form-group ${formErrors.phone ? 'has-error' : ''}`}>
                <label htmlFor="modal-phone" className="modal-form-label">
                  Mobile Number <span className="req-asterisk">*</span>
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="modal-form-input"
                  disabled={isSubmitting}
                  autoComplete="tel"
                />
                {formErrors.phone && (
                  <span className="modal-field-error" role="alert">{formErrors.phone}</span>
                )}
              </div>

              {/* Email Address */}
              <div className={`modal-form-group ${formErrors.email ? 'has-error' : ''}`}>
                <label htmlFor="modal-email" className="modal-form-label">
                  Email Address <span className="req-asterisk">*</span>
                </label>
                <input
                  id="modal-email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="modal-form-input"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                {formErrors.email && (
                  <span className="modal-field-error" role="alert">{formErrors.email}</span>
                )}
              </div>

              {/* Course Interested In */}
              <div className={`modal-form-group ${formErrors.courseId ? 'has-error' : ''}`}>
                <label htmlFor="modal-course" className="modal-form-label">
                  Course Interested In <span className="req-asterisk">*</span>
                </label>
                <select
                  id="modal-course"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="modal-form-select"
                  disabled={isSubmitting}
                >
                  <option value="">-- Select Course --</option>
                  {courseOptions.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}{course.duration ? ` (${course.duration})` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.courseId && (
                  <span className="modal-field-error" role="alert">{formErrors.courseId}</span>
                )}
              </div>

              {/* Preferred Plan */}
              <div className="modal-form-group">
                <label htmlFor="modal-plan" className="modal-form-label">
                  Preferred Plan
                </label>
                <select
                  id="modal-plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className="modal-form-select"
                  disabled={isSubmitting}
                >
                  <option value="">-- Select Plan --</option>
                  {planOptions.map((opt) => (
                    <option key={opt.id || opt.value} value={opt.value || opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message / Enquiry */}
              <div className="modal-form-group">
                <label htmlFor="modal-message" className="modal-form-label">
                  Message / Enquiry <span className="optional-tag">(optional)</span>
                </label>
                <textarea
                  id="modal-message"
                  name="message"
                  rows="3"
                  placeholder="Any questions or specific requirements..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="modal-form-input modal-form-textarea"
                  disabled={isSubmitting}
                ></textarea>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg modal-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spinner-icon" aria-hidden="true" />
                    <span>Submitting Enrollment...</span>
                  </>
                ) : (
                  <>
                    <span>✅ Submit Enrollment</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>

              {/* Secondary WhatsApp Button */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa btn-lg modal-wa-btn"
              >
                <MessageSquare size={17} aria-hidden="true" />
                <span>💬 Or Enquire Directly on WhatsApp</span>
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
