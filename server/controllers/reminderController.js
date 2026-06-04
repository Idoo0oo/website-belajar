const db = require('../config/db');

/**
 * GET /api/reminders
 * Get all reminders for the logged-in user
 */
const getReminders = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Reminders WHERE user_id = ? ORDER BY remind_at ASC',
      [req.user.id]
    );
    return res.status(200).json({ reminders: rows });
  } catch (err) {
    console.error('[getReminders]', err);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};

/**
 * POST /api/reminders
 * Create a new reminder
 */
const createReminder = async (req, res) => {
  const { title, remind_at } = req.body;

  if (!title || !remind_at) {
    return res.status(400).json({ message: 'title and remind_at are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO Reminders (user_id, title, remind_at) VALUES (?, ?, ?)',
      [req.user.id, title, remind_at]
    );
    const [rows] = await db.query('SELECT * FROM Reminders WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Reminder created.', reminder: rows[0] });
  } catch (err) {
    console.error('[createReminder]', err);
    return res.status(500).json({ message: 'Failed to create reminder.' });
  }
};

/**
 * PUT /api/reminders/:id
 * Update a reminder (title, remind_at, or is_sent)
 */
const updateReminder = async (req, res) => {
  const { title, remind_at, is_sent } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT id FROM Reminders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found.' });
    }

    await db.query(
      `UPDATE Reminders
       SET title = COALESCE(?, title),
           remind_at = COALESCE(?, remind_at),
           is_sent = COALESCE(?, is_sent)
       WHERE id = ?`,
      [title || null, remind_at || null, is_sent != null ? is_sent : null, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM Reminders WHERE id = ?', [req.params.id]);
    return res.status(200).json({ message: 'Reminder updated.', reminder: updated[0] });
  } catch (err) {
    console.error('[updateReminder]', err);
    return res.status(500).json({ message: 'Failed to update reminder.' });
  }
};

/**
 * DELETE /api/reminders/:id
 * Delete a reminder
 */
const deleteReminder = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM Reminders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found.' });
    }

    await db.query('DELETE FROM Reminders WHERE id = ?', [req.params.id]);
    return res.status(200).json({ message: 'Reminder deleted.' });
  } catch (err) {
    console.error('[deleteReminder]', err);
    return res.status(500).json({ message: 'Failed to delete reminder.' });
  }
};

module.exports = { getReminders, createReminder, updateReminder, deleteReminder };
