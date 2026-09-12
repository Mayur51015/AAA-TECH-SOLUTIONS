const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aaa_tech_solutions_super_secret_jwt_key_2026';

/**
 * Protect routes - verify JWT Bearer token
 */
exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired
        ? 'Your session has expired. Please login again.'
        : 'Authentication required. Please login.'
    });
  }
};

/**
 * Authorize specific roles (e.g. 'admin')
 * @param  {...string} roles 
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this area.'
      });
    }
    next();
  };
};
