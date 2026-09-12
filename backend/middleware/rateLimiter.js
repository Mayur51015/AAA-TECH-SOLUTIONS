/**
 * In-memory sliding window rate limiter for login protection
 * Limits consecutive attempts per client IP
 */
const attempts = new Map();

/**
 * Login rate limiter: Max 5 attempts per 15 minutes per IP
 */
exports.loginRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxAttempts = options.max || 5;

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = attempts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    if (record.count >= maxAttempts) {
      const remainingSecs = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again in ${Math.ceil(remainingSecs / 60)} minute(s).`
      });
    }

    record.count += 1;
    attempts.set(ip, record);

    // If login succeeds, clear rate limit
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
        attempts.delete(ip);
      }
      return originalJson(body);
    };

    next();
  };
};
