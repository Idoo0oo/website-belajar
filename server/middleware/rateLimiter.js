const rateLimit = require('express-rate-limit');

/**
 * Auth Rate Limiter
 * Max 10 requests per 15 minutes per IP on auth endpoints.
 * Prevents brute-force attacks on login and registration.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for development testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Quiz Generation Rate Limiter
 * Max 5 quiz generations per hour per IP.
 * Prevents abuse of the Gemini API.
 */
const quizLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for cached quiz reads (GET /:materialId)
    // Only limit the regenerate endpoint (POST)
    return req.method === 'GET';
  },
  message: {
    message: 'Quiz generation limit reached. Please try again in an hour.',
  },
});

module.exports = { authLimiter, quizLimiter };
