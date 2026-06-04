const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
require('dotenv').config();

const SALT_ROUNDS = 10;

// ─── Register ────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const verification_token = crypto.randomBytes(32).toString('hex');

    const [result] = await db.query(
      'INSERT INTO Users (name, email, password_hash, verification_token) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, verification_token]
    );

    // Send verification email (non-blocking)
    sendVerificationEmail(email, name, verification_token).catch(err =>
      console.warn('[register] Email send failed:', err.message)
    );

    return res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account before logging in.',
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in. Check your inbox.',
        unverified: true,
        email: user.email
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, email_verified: !!user.email_verified },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, email_verified: !!user.email_verified },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }

  try {
    const [rows] = await db.query('SELECT id FROM Users WHERE verification_token = ?', [token]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    await db.query(
      'UPDATE Users SET email_verified = TRUE, verification_token = NULL WHERE id = ?',
      [rows[0].id]
    );

    return res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('[verifyEmail]', err);
    return res.status(500).json({ message: 'Server error during email verification.' });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const [rows] = await db.query('SELECT id, name FROM Users WHERE email = ?', [email]);

    // Always return success to prevent email enumeration attacks
    if (rows.length === 0) {
      return res.status(200).json({ message: 'If this email is registered, you will receive a reset link.' });
    }

    const user = rows[0];
    const reset_token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE Users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [reset_token, expires, user.id]
    );

    await sendPasswordResetEmail(email, user.name, reset_token);

    return res.status(200).json({ message: 'If this email is registered, you will receive a reset link.' });
  } catch (err) {
    console.error('[forgotPassword]', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id FROM Users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new one.' });
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query(
      'UPDATE Users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [password_hash, rows[0].id]
    );

    return res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('[resetPassword]', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── Change Password (authenticated) ─────────────────────────────────────────
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }

  try {
    const [rows] = await db.query('SELECT password_hash FROM Users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query('UPDATE Users SET password_hash = ? WHERE id = ?', [password_hash, req.user.id]);

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[changePassword]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── Resend Verification Email (Public) ──────────────────────────────────────
const resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, email_verified FROM Users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(200).json({ message: 'If this email is registered, a new verification link will be sent.' });
    }

    if (rows[0].email_verified) {
      return res.status(400).json({ message: 'Email is already verified. You can log in.' });
    }

    const verification_token = crypto.randomBytes(32).toString('hex');
    await db.query('UPDATE Users SET verification_token = ? WHERE id = ?', [verification_token, rows[0].id]);
    await sendVerificationEmail(rows[0].email, rows[0].name, verification_token);

    return res.status(200).json({ message: 'A new verification email has been sent.' });
  } catch (err) {
    console.error('[resendVerification]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, changePassword, resendVerification };
