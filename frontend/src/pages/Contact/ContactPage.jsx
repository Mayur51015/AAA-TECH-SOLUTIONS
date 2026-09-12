import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Building, MessageSquare, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
// AlertCircle already imported above
import { companyInfo } from '../../data/company';
import SectionHeader from '../../components/common/SectionHeader/SectionHeader';
import { submitContactMessage } from '../../services';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Enterprise Software Development',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please provide your name.';
    if (!formData.email.trim()) newErrors.email = 'Please provide valid email';
    if (!formData.message.trim()) newErrors.message = 'Please provide a brief description';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    try {
      const data = await submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.inquiryType,
        message: formData.message.trim()
      });
      if (data.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setApiError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      setApiError(error.message || 'Failed to send message. Please try again or contact us via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicWaUrl = `https://wa.me/917358533721?text=${encodeURIComponent(
    `💬 *New Inquiry — AAA Tech Solutions*\n\n` +
    `👤 *Name:* ${formData.name || 'Client'}\n` +
    `📱 *Phone:* ${formData.phone || 'Not provided'}\n` +
    `✉️ *Email:* ${formData.email || 'Not provided'}\n` +
    `📌 *Type:* ${formData.inquiryType}\n` +
    `📝 *Message:* ${formData.message || 'I would like to discuss our requirements.'}`
  )}`;

  return (
    <div className="contact-page-view">
      {/* Hero */}
      <section className="contact-hero-section">
        <div className="container">
          <div className="contact-hero-content">
            <span className="section-tag section-tag-dark">📞 Connect With Us</span>
            <h1 className="contact-hero-title">
              Let's discuss your technical vision or training requirements.
            </h1>
            <p className="contact-hero-lead">
              Reach out to our team directly. We provide architectural assessments, technical proposals, and cohort onboarding guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="section contact-main-section">
        <div className="container">
          <div className="contact-layout-grid">
            {/* Left: Contact Info & Location Map */}
            <div className="contact-info-column">
              <div className="contact-details-card card">
                <h2 className="info-card-title">Corporate Headquarters & Inquiries</h2>
                <p className="info-card-sub">Direct channels for clients, partners, and learners.</p>

                <div className="info-items-list">
                  {/* Official Address Info Card */}
                  <div className="info-item info-item-address">
                    <div className="info-icon-box">
                      <MapPin size={20} className="info-icon" />
                    </div>
                    <div className="info-content-wrap">
                      <div className="info-label">📍 Our Location</div>
                      <address className="contact-address-block">
                        <span className="address-line font-medium">{companyInfo.location.addressLine1}</span>
                        <span className="address-line tamil-address-line">{companyInfo.location.addressLine2}</span>
                        <span className="address-line">{companyInfo.location.area}</span>
                        <span className="address-line">{companyInfo.location.city}</span>
                        <span className="address-line">{companyInfo.location.state} {companyInfo.location.postalCode}</span>
                        <span className="address-line">{companyInfo.location.country}</span>
                      </address>
                      <a
                        href={companyInfo.location.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm get-directions-btn"
                        aria-label="Get Directions to AAA Tech Solutions on Google Maps"
                      >
                        <span>Get Directions</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon-box">
                      <Mail size={20} className="info-icon" />
                    </div>
                    <div>
                      <div className="info-label">Inquiries & Proposals</div>
                      <a href={`mailto:${companyInfo.contact.email}`} className="info-link">
                        {companyInfo.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon-box">
                      <Phone size={20} className="info-icon" />
                    </div>
                    <div>
                      <div className="info-label">Telephone</div>
                      <a href={`tel:${companyInfo.contact.phone.replace(/[^0-9+]/g, '')}`} className="info-link">
                        {companyInfo.contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon-box">
                      <Clock size={20} className="info-icon" />
                    </div>
                    <div>
                      <div className="info-label">Operating Hours</div>
                      <div className="info-value">{companyInfo.contact.hours}</div>
                    </div>
                  </div>
                </div>

                <div className="contact-wa-action-box">
                  <a href={dynamicWaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-lg contact-wa-btn">
                    <MessageSquare size={18} />
                    <span>Chat Directly on WhatsApp</span>
                  </a>
                  <p className="wa-notice">⚡ Fast response on WhatsApp for quick course & project queries</p>
                </div>
              </div>

              {/* Location & Google Map Card */}
              <div className="map-area-card card">
                <div className="map-card-header">
                  <div className="map-header-title">
                    <Building size={18} className="map-header-icon" />
                    <span>AAA Tech Solutions — Office Location</span>
                  </div>
                  <a
                    href={companyInfo.location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-header-link"
                    title="Open AAA Tech Solutions on Google Maps"
                  >
                    <span>View on Maps</span>
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>

                <div className="map-frame-wrapper">
                  <iframe
                    title="AAA Tech Solutions Office Location Map"
                    src={companyInfo.location.embedMapUrl}
                    width="100%"
                    height="210"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="map-iframe"
                  />
                </div>

                <div className="map-card-footer">
                  <div className="map-footer-text">
                    <span className="map-footer-badge">📍 Chennai, India</span>
                    <span className="map-footer-sub">MPM Street, Kakkanji Colony, Chennai 600039</span>
                  </div>
                  <a
                    href={companyInfo.location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm map-directions-btn"
                  >
                    <span>Get Directions</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-column">
              <div className="contact-form-card card">
                {!submitted ? (
                  <>
                    <h2 className="form-card-title">Send a Message</h2>
                    <p className="form-card-sub">An engineering lead will review your requirements and respond promptly.</p>

                    <form onSubmit={handleSubmit} className="contact-form" noValidate>
                      <div className="form-group">
                        <label htmlFor="contactName" className="form-label">
                          Full Name <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          id="contactName"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className={`form-input ${errors.name ? 'input-error' : ''}`}
                          required
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label htmlFor="contactEmail" className="form-label">
                            Email Address <span className="req">*</span>
                          </label>
                          <input
                            type="email"
                            id="contactEmail"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            className={`form-input ${errors.email ? 'input-error' : ''}`}
                            required
                          />
                          {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                          <label htmlFor="contactPhone" className="form-label">
                            Phone / WhatsApp (Optional)
                          </label>
                          <input
                            type="tel"
                            id="contactPhone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="inquiryType" className="form-label">
                          Inquiry Type
                        </label>
                        <select
                          id="inquiryType"
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleChange}
                          className="form-input form-select"
                        >
                          <option value="Enterprise Software Development">Enterprise Software Development</option>
                          <option value="Cloud Infrastructure & DevOps Consulting">Cloud Infrastructure & DevOps</option>
                          <option value="Academy & Course Enrollment">Academy & Course Enrollment</option>
                          <option value="Corporate Training Workshops">Corporate Training Workshops</option>
                          <option value="General Technical Inquiry">General Technical Inquiry</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="contactMessage" className="form-label">
                          Project or Technical Details <span className="req">*</span>
                        </label>
                        <textarea
                          id="contactMessage"
                          name="message"
                          rows="4"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Briefly describe your objectives, requirements, or timelines..."
                          className={`form-input form-textarea ${errors.message ? 'input-error' : ''}`}
                          required
                        ></textarea>
                        {errors.message && <span className="error-text">{errors.message}</span>}
                      </div>

                      {apiError && (
                        <div className="modal-api-error-banner" role="alert" style={{ marginBottom: '0.75rem' }}>
                          <AlertCircle size={16} aria-hidden="true" />
                          <span>{apiError}</span>
                        </div>
                      )}
                      <button type="submit" className="btn btn-primary btn-lg submit-contact-btn" disabled={isSubmitting}>
                        <span>{isSubmitting ? 'Submitting...' : 'Submit Technical Inquiry'}</span>
                        {!isSubmitting && <Send size={16} aria-hidden="true" />}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="contact-submitted-state">
                    <div className="confirm-icon-wrapper">
                      <CheckCircle2 size={48} className="confirm-icon" />
                    </div>
                    <h2 className="confirm-heading">Inquiry Received</h2>
                    <p className="confirm-message">
                      Thank you, <strong>{formData.name}</strong>. Your message regarding <strong>{formData.inquiryType}</strong> has been routed to our technical advisory team.
                    </p>
                    <p className="confirm-sub">
                      We will review your inquiry and follow up at <strong>{formData.email}</strong> within one business day.
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', inquiryType: 'Enterprise Software Development', message: '' });
                      }}
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
