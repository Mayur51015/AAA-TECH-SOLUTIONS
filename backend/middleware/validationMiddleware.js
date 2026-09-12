/**
 * Validation middlewares for backend input sanitization and verification
 */

// Email regex helper
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Indian 10-digit phone regex helper
const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10;
};

exports.validateEnrollment = (req, res, next) => {
  const { fullName, student_name, full_name, mobile, phone, email, course, course_id, courseId } = req.body;
  const candidateName = (fullName || student_name || full_name || '').trim();
  const candidatePhone = (mobile || phone || '').trim();
  const candidateEmail = (email || '').trim();
  const candidateCourse = course || course_id || courseId;

  if (!candidateName) {
    return res.status(400).json({ success: false, message: 'Full Name is required.' });
  }

  if (!candidatePhone || !isValidPhone(candidatePhone)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
  }

  if (!candidateEmail || !isValidEmail(candidateEmail)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (!candidateCourse) {
    return res.status(400).json({ success: false, message: 'Course selection is required.' });
  }

  next();
};

exports.validateContact = (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  if (!email || !isValidEmail(email.trim())) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  next();
};

exports.validateReview = (req, res, next) => {
  const { name, rating, stars, review_text, text } = req.body;
  const reviewerName = (name || '').trim();
  const numRating = parseInt(rating || stars, 10);
  const reviewContent = (review_text || text || '').trim();

  if (!reviewerName) {
    return res.status(400).json({ success: false, message: 'Name is required to post a review.' });
  }

  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
  }

  if (!reviewContent) {
    return res.status(400).json({ success: false, message: 'Review text cannot be empty.' });
  }

  next();
};

exports.validateAdminLogin = (req, res, next) => {
  const { username, email, adminId, password } = req.body;
  const userIdentifier = (username || adminId || email || '').trim();

  if (!userIdentifier) {
    return res.status(400).json({ success: false, message: 'Username is required.' });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  next();
};
