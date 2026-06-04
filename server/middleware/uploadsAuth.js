const jwt = require('jsonwebtoken');
const path = require('path');

/**
 * Middleware to protect /uploads/* file access.
 * Reads token from Authorization header OR from ?token= query param
 * (query param useful for direct browser URL access / PDF embed src).
 */
const uploadsAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1];
  const tokenFromQuery = req.query.token;

  const token = tokenFromHeader || tokenFromQuery;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Authentication required to view this file.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = uploadsAuth;
