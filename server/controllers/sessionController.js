const db = require('../config/db');

/**
 * GET /api/sessions/weekly
 * Returns last 7 days of study + rest minutes, grouped by date
 * Used by the Dashboard AreaChart
 */
const getWeeklySessions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         session_date,
         SUM(study_minutes) AS study_minutes,
         SUM(rest_minutes)  AS rest_minutes
       FROM StudySessions
       WHERE user_id = ?
         AND session_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY session_date
       ORDER BY session_date ASC`,
      [req.user.id]
    );

    // Fill missing days with 0s so chart always shows 7 data points
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = rows.find((r) => {
        const rowDate = new Date(r.session_date).toISOString().split('T')[0];
        return rowDate === dateStr;
      });
      last7Days.push({
        date: dateStr,
        study_minutes: found ? Number(found.study_minutes) : 0,
        rest_minutes: found ? Number(found.rest_minutes) : 0,
      });
    }

    return res.status(200).json({ sessions: last7Days });
  } catch (err) {
    console.error('[getWeeklySessions]', err);
    return res.status(500).json({ message: 'Failed to fetch weekly sessions.' });
  }
};

/**
 * POST /api/sessions
 * Log a completed study session
 */
const logSession = async (req, res) => {
  const { subject, study_minutes, rest_minutes, session_date } = req.body;

  if (!subject || study_minutes == null) {
    return res.status(400).json({ message: 'subject and study_minutes are required.' });
  }

  const date = session_date || new Date().toISOString().split('T')[0];

  try {
    const [result] = await db.query(
      'INSERT INTO StudySessions (user_id, subject, study_minutes, rest_minutes, session_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, subject, study_minutes, rest_minutes || 0, date]
    );
    return res.status(201).json({ message: 'Session logged.', session_id: result.insertId });
  } catch (err) {
    console.error('[logSession]', err);
    return res.status(500).json({ message: 'Failed to log session.' });
  }
};

module.exports = { getWeeklySessions, logSession };
