import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import SectionHeader from '../../common/SectionHeader/SectionHeader';
import { getReviews, submitReview } from '../../../services';
import './ReviewsSection.css';

const initialReviews = [
  {
    id: 1,
    name: "Priya S.",
    date: "June 2025",
    stars: 5,
    course: "Full-Stack Software Engineering",
    text: "The practical training was transformative! The engineering mentor explained full-stack architectures clearly with real examples and code reviews. Got placed within 2 months of completing the cohort. Highly recommend AAA Tech Solutions!",
    avatarBg: "linear-gradient(135deg, #1565C0, #00B4D8)"
  },
  {
    id: 2,
    name: "Rahul M.",
    date: "May 2025",
    stars: 5,
    course: "Cloud Infrastructure & DevOps",
    text: "Took the Cloud & DevOps mastery track. The hands-on labs with AWS and Docker are industry-level. The trainer's mentoring and WhatsApp group support made doubt clearing seamless. Exceptional value!",
    avatarBg: "linear-gradient(135deg, #F9A825, #F57F17)"
  },
  {
    id: 3,
    name: "Kavitha R.",
    date: "April 2025",
    stars: 5,
    course: "Data Engineering & Analytics",
    text: "The data pipelines and SQL course was excellent. 100% online, flexible schedule, and the mock technical interview sessions really helped me crack my first engineering role. Thank you AAA Tech!",
    avatarBg: "linear-gradient(135deg, #00B4D8, #0D2157)"
  },
  {
    id: 4,
    name: "Arjun T.",
    date: "March 2025",
    stars: 5,
    course: "UI/UX & Design Systems",
    text: "Hands-on, component-driven design systems curriculum with React and Figma. The mentor was patient, knowledgeable, and gave deep feedback on real production portfolio pieces.",
    avatarBg: "linear-gradient(135deg, #25D366, #128C7E)"
  }
];

const ratingLabels = {
  1: "1 out of 5 — Needs Improvement",
  2: "2 out of 5 — Fair Experience",
  3: "3 out of 5 — Good Program",
  4: "4 out of 5 — Very Good",
  5: "5 out of 5 — Excellent"
};

export default function ReviewsSection() {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('aaa_reviews');
      return saved ? JSON.parse(saved) : initialReviews;
    } catch {
      return initialReviews;
    }
  });

  const [formName, setFormName] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formStars, setFormStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [formText, setFormText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch approved reviews from MySQL backend on component load
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      const apiReviews = await getReviews();
      if (apiReviews && apiReviews.length > 0 && isMounted) {
        const formatted = apiReviews.map((r, idx) => ({
          id: r.id,
          name: r.name,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Verified Student',
          stars: r.rating || 5,
          course: r.course_title || 'Technology Program',
          text: r.review_text,
          avatarBg: idx % 2 === 0 ? "linear-gradient(135deg, #1565C0, #00B4D8)" : "linear-gradient(135deg, #F9A825, #F57F17)"
        }));
        setReviews(formatted);
      }
    }
    loadReviews();
    return () => { isMounted = false; };
  }, []);

  const activeRating = hoverStars || formStars;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const res = await submitReview({
        name: formName.trim(),
        course: formCourse.trim(),
        rating: formStars,
        review_text: formText.trim()
      });

      if (res && res.success === false) {
        setApiError(res.message || 'Failed to submit review. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setFormName('');
      setFormCourse('');
      setFormText('');
      setFormStars(5);
      setHoverStars(0);
      setIsSubmitting(false);
      setFormSubmitted(true);
    } catch (err) {
      console.error('Review submission error:', err);
      setApiError(err.message || 'Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleKeyDownStar = (e, starVal) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFormStars(starVal);
    } else if (e.key === 'ArrowRight' && starVal < 5) {
      e.preventDefault();
      setFormStars(starVal + 1);
    } else if (e.key === 'ArrowLeft' && starVal > 1) {
      e.preventDefault();
      setFormStars(starVal - 1);
    }
  };

  return (
    <section className="section reviews-section" id="reviews" aria-label="Student and Client Reviews">
      <div className="container">
        <SectionHeader
          tag="💬 Student & Learner Feedback"
          title="What Our Learners Say"
          subtitle="Real experiences from engineers and professionals who transformed their skills with AAA Tech Solutions."
        />

        <div className="reviews-layout-grid">
          {/* Left Column: Reviews List & Metrics */}
          <div className="reviews-list-col">
            <div className="reviews-score-card">
              <div className="score-box">
                <div className="score-number">{reviews.length}</div>
                <div className="score-label">Verified Reviews</div>
              </div>
              <div className="score-divider" aria-hidden="true"></div>
              <div className="score-box">
                <div className="score-rating">
                  <span>5.0</span>
                  <div className="stars-mini" aria-hidden="true">★★★★★</div>
                </div>
                <div className="score-label">Average Satisfaction</div>
              </div>
            </div>

            <div className="reviews-scroll-container" aria-label="List of student reviews">
              {reviews.map((rev) => (
                <article key={rev.id} className="review-item-card card">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: rev.avatarBg }} aria-hidden="true">
                      {rev.name.charAt(0)}
                    </div>
                    <div className="review-meta">
                      <div className="review-author">{rev.name}</div>
                      <div className="review-date">{rev.date}</div>
                    </div>
                  </div>

                  <div className="review-rating-line">
                    <div
                      className="review-stars-row"
                      role="img"
                      aria-label={`Rated ${rev.stars} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((starIndex) => (
                        <Star
                          key={starIndex}
                          size={16}
                          className={starIndex <= rev.stars ? "star-filled" : "star-empty"}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="review-numeric-score">{rev.stars}.0 / 5.0</span>
                  </div>

                  <p className="review-body-text">"{rev.text}"</p>

                  <div className="review-footer-row">
                    <span className="review-course-badge">{rev.course}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right Column: Review Submission Form */}
          <div className="review-form-col">
            <div className="review-form-card card">
              <h3 className="review-form-title">✍️ Leave a Review</h3>
              <p className="review-form-sub">Share your feedback about your learning or project experience with AAA Tech Solutions.</p>

              {formSubmitted ? (
                <div className="review-success-state">
                  <CheckCircle2 size={44} className="review-success-icon" />
                  <h4>Thank You!</h4>
                  <p>Your review has been submitted for approval and will appear once verified by our team.</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm write-another-btn"
                    onClick={() => {
                      setFormSubmitted(false);
                      setApiError('');
                    }}
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    <span>Write Another Review</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="review-form">
                  {apiError && (
                    <div className="modal-api-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
                      <AlertCircle size={16} aria-hidden="true" />
                      <span>{apiError}</span>
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="reviewer-name" className="form-label">
                      Your Name <span className="req-star">*</span>
                    </label>
                    <input
                      id="reviewer-name"
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reviewer-course" className="form-label">
                      Course or Service Taken
                    </label>
                    <input
                      id="reviewer-course"
                      type="text"
                      placeholder="e.g. Full-Stack Software Engineering"
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value)}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" id="rating-label">
                      Rating <span className="req-star">*</span>
                    </label>
                    <div
                      className="star-rating-selector"
                      role="radiogroup"
                      aria-labelledby="rating-label"
                    >
                      <div className="stars-interactive-group">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isFilled = starVal <= activeRating;
                          return (
                            <button
                              key={starVal}
                              type="button"
                              role="radio"
                              aria-checked={formStars === starVal}
                              tabIndex={formStars === starVal ? 0 : -1}
                              className={`star-select-btn ${isFilled ? 'active' : ''}`}
                              onClick={() => setFormStars(starVal)}
                              onMouseEnter={() => setHoverStars(starVal)}
                              onMouseLeave={() => setHoverStars(0)}
                              onKeyDown={(e) => handleKeyDownStar(e, starVal)}
                              aria-label={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
                              disabled={isSubmitting}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                      <span className="rating-text-label" aria-live="polite">
                        {ratingLabels[activeRating]}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reviewer-feedback" className="form-label">
                      Your Feedback / Review <span className="req-star">*</span>
                    </label>
                    <textarea
                      id="reviewer-feedback"
                      required
                      rows="4"
                      placeholder="Share your experience with our mentorship, curriculum, projects, and career support..."
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      className="form-input form-textarea"
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg submit-review-btn"
                    disabled={isSubmitting || !formName.trim() || !formText.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="spinner-icon" aria-hidden="true" />
                        <span>Posting Review...</span>
                      </>
                    ) : (
                      <>
                        <span>Post Review</span>
                        <Send size={16} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
