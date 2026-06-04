const db = require('../config/db');

// POST /api/quiz-results — save a quiz attempt
const saveQuizResult = async (req, res) => {
  const { material_id, score, total } = req.body;

  if (!material_id || score === undefined || !total) {
    return res.status(400).json({ message: 'material_id, score, and total are required.' });
  }

  try {
    // Verify material ownership
    const [mat] = await db.query('SELECT id FROM Materials WHERE id = ? AND user_id = ?', [material_id, req.user.id]);
    if (mat.length === 0) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    await db.query(
      'INSERT INTO QuizResults (user_id, material_id, score, total) VALUES (?, ?, ?, ?)',
      [req.user.id, material_id, score, total]
    );

    return res.status(201).json({ message: 'Result saved.' });
  } catch (err) {
    console.error('[saveQuizResult]', err);
    return res.status(500).json({ message: 'Failed to save quiz result.' });
  }
};

// GET /api/quiz-results/:materialId — get history for a specific material
const getResultsByMaterial = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT qr.id, qr.score, qr.total, qr.created_at
       FROM QuizResults qr
       JOIN Materials m ON qr.material_id = m.id
       WHERE qr.material_id = ? AND m.user_id = ?
       ORDER BY qr.created_at DESC
       LIMIT 10`,
      [req.params.materialId, req.user.id]
    );
    return res.status(200).json({ results: rows });
  } catch (err) {
    console.error('[getResultsByMaterial]', err);
    return res.status(500).json({ message: 'Failed to fetch results.' });
  }
};

// GET /api/quiz-results — get all results for the user (dashboard summary)
const getAllResults = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT qr.id, qr.score, qr.total, qr.created_at, m.title AS material_title
       FROM QuizResults qr
       JOIN Materials m ON qr.material_id = m.id
       WHERE qr.user_id = ?
       ORDER BY qr.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    return res.status(200).json({ results: rows });
  } catch (err) {
    console.error('[getAllResults]', err);
    return res.status(500).json({ message: 'Failed to fetch results.' });
  }
};

module.exports = { saveQuizResult, getResultsByMaterial, getAllResults };
