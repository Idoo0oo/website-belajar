const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/verify-email', auth.verifyEmail);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/resend-verification', auth.resendVerification);

// Authenticated routes
router.post('/change-password', authMiddleware, auth.changePassword);

module.exports = router;
