require('dotenv').config();
const nodemailer = require('nodemailer');

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '', // Auto-remove spaces
    },
  });
};

const getFromEmail = () => `"StudyFlow" <${process.env.SMTP_USER}>`;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const sendVerificationEmail = async (toEmail, name, token) => {
  const link = `${CLIENT_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: getFromEmail(),
    to: toEmail,
    subject: 'Verify your StudyFlow email',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f1a; color: #e8e0ff; border-radius: 16px;">
        <h2 style="color: #b8a9e8; margin-bottom: 8px;">Hello, ${name}! 👋</h2>
        <p style="color: #9b8ec4; margin-bottom: 24px;">Please verify your email address to get started with StudyFlow.</p>
        <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #8b7acc, #6b9b8e); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold;">
          Verify My Email
        </a>
        <p style="color: #6b6080; font-size: 12px; margin-top: 24px;">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  };

  return getTransporter().sendMail(mailOptions);
};

const sendPasswordResetEmail = async (toEmail, name, token) => {
  const link = `${CLIENT_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: getFromEmail(),
    to: toEmail,
    subject: 'Reset your StudyFlow password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f1a; color: #e8e0ff; border-radius: 16px;">
        <h2 style="color: #b8a9e8; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #9b8ec4; margin-bottom: 24px;">Hi ${name}, we received a request to reset your StudyFlow password.</p>
        <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #e07070, #c05050); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold;">
          Reset My Password
        </a>
        <p style="color: #6b6080; font-size: 12px; margin-top: 24px;">Link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  return getTransporter().sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
