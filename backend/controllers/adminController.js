const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Enrollment = require('../models/Enrollment');
const Contact = require('../models/Contact');
const Review = require('../models/Review');
const Application = require('../models/Application');

const JWT_SECRET = process.env.JWT_SECRET || 'aaa_tech_solutions_super_secret_jwt_key_2026';

// Helper to generate signed JWT token with 8h expiry
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// @desc    Admin login with secure database verification & bcrypt
// @route   POST /api/admin/login
exports.adminLogin = async (req, res, next) => {
  try {
    const { username, email, adminId, password } = req.body;
    const identifier = (username || adminId || email || '').trim();
    const cleanPassword = (password || '').trim();

    if (!identifier || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // 1. Look up admin in MySQL database by username or email
    const admin = await Admin.findByIdentifier(identifier);
    if (!admin) {
      // Generic error message: do not reveal if username exists
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // 2. Check if account is active
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // 3. Compare password using bcrypt
    const isMatch = await Admin.matchPassword(cleanPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // 4. Generate secure JWT token
    const token = generateToken(admin);

    // 5. Return success with safe admin object (never return password or password_hash)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated admin user
// @route   GET /api/admin/me
exports.getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin || !admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics & summary (Admin only)
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    let enrollments = [];
    let contacts = [];
    let reviews = [];
    let applications = [];

    try {
      [enrollments, contacts, reviews, applications] = await Promise.all([
        Enrollment.findAll().catch(() => []),
        Contact.findAll().catch(() => []),
        Review.findAll().catch(() => []),
        Application.findAll().catch(() => [])
      ]);
    } catch (err) {
      console.warn('Database error in getDashboardStats:', err.message);
    }

    res.status(200).json({
      success: true,
      data: {
        totalEnrollments: enrollments.length,
        totalContacts: contacts.length,
        totalReviews: reviews.length,
        totalApplications: applications.length,
        recentEnrollments: enrollments.slice(0, 5),
        recentContacts: contacts.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
};
