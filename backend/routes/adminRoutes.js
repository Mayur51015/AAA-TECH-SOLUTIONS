const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getMe,
  getDashboardStats
} = require('../controllers/adminController');
const {
  getEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus
} = require('../controllers/enrollmentController');
const {
  getContacts,
  updateContactStatus
} = require('../controllers/contactController');
const {
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReview
} = require('../controllers/reviewController');
const { validateAdminLogin } = require('../middleware/validationMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// ==================================================
// 1. Public Routes
// ==================================================
router.post('/login', loginRateLimiter(), validateAdminLogin, adminLogin);

// ==================================================
// 2. Protected Admin Routes (Requires valid JWT & role === 'admin')
// ==================================================
router.use(protect, authorize('admin'));

// Identity & Stats
router.get('/me', getMe);
router.get('/stats', getDashboardStats);

// Enrollments Management
router.route('/enrollments')
  .get(getEnrollments);

router.route('/enrollments/:id')
  .get(getEnrollmentById);

router.route('/enrollments/:id/status')
  .patch(updateEnrollmentStatus);

// Contacts Management
router.route('/contacts')
  .get(getContacts);

router.route('/contacts/:id/status')
  .patch(updateContactStatus);

// Reviews Moderation
router.route('/reviews')
  .get(getAllReviewsAdmin);

router.route('/reviews/:id/status')
  .patch(updateReviewStatus);

router.route('/reviews/:id')
  .delete(deleteReview);

module.exports = router;
