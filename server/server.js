require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const quizRoutes = require('./routes/quizRoutes');
const quizResultsRoutes = require('./routes/quizResultsRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Security Middleware
const { authLimiter, quizLimiter } = require('./middleware/rateLimiter');
const uploadsAuth = require('./middleware/uploadsAuth');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded PDFs — protected behind JWT auth
app.use('/uploads', uploadsAuth, express.static(path.join(__dirname, 'uploads')));

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);  // Rate-limited: 10 req/15min
app.use('/api/materials', materialRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quiz', quizLimiter, quizRoutes);  // Rate-limited for AI generation
app.use('/api/quiz-results', quizResultsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  // Multer errors (e.g., wrong file type)
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  console.error('[GlobalError]', err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

// ─── Start ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
