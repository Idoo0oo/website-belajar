const adminAuth = (req, res, next) => {
  // auth.js middleware must run before this to attach req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden. Superadmin access required.' });
  }

  next();
};

module.exports = adminAuth;
