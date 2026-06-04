const db = require('../config/db');

/**
 * GET /api/flashcards
 * Get flashcards for the logged-in user
 * ?filter=weak → only flashcards linked to REVIEW or FOCUS tagged materials
 */
const getFlashcards = async (req, res) => {
  const { filter, material_id } = req.query;

  try {
    let query;
    let params;

    if (filter === 'weak') {
      // Join with MaterialTags to only return cards from REVIEW/FOCUS materials
      query = `
        SELECT DISTINCT f.*
        FROM Flashcards f
        JOIN Materials m ON f.material_id = m.id
        JOIN MaterialTags mt ON mt.material_id = m.id
        WHERE m.user_id = ?
          AND mt.status IN ('REVIEW', 'FOCUS')
        ORDER BY f.created_at DESC
      `;
      params = [req.user.id];
    } else if (material_id) {
      query = `
        SELECT f.* FROM Flashcards f
        JOIN Materials m ON f.material_id = m.id
        WHERE f.material_id = ? AND m.user_id = ?
        ORDER BY f.created_at DESC
      `;
      params = [material_id, req.user.id];
    } else {
      query = `
        SELECT f.* FROM Flashcards f
        JOIN Materials m ON f.material_id = m.id
        WHERE m.user_id = ?
        ORDER BY f.created_at DESC
      `;
      params = [req.user.id];
    }

    const [rows] = await db.query(query, params);
    return res.status(200).json({ flashcards: rows });
  } catch (err) {
    console.error('[getFlashcards]', err);
    return res.status(500).json({ message: 'Failed to fetch flashcards.' });
  }
};

/**
 * POST /api/flashcards
 * Manually create a flashcard linked to a material
 */
const createFlashcard = async (req, res) => {
  const { material_id, question, answer } = req.body;

  if (!material_id || !question || !answer) {
    return res.status(400).json({ message: 'material_id, question, and answer are required.' });
  }

  try {
    // Verify ownership
    const [materials] = await db.query(
      'SELECT id FROM Materials WHERE id = ? AND user_id = ?',
      [material_id, req.user.id]
    );
    if (materials.length === 0) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const [result] = await db.query(
      'INSERT INTO Flashcards (material_id, question, answer) VALUES (?, ?, ?)',
      [material_id, question, answer]
    );
    const [rows] = await db.query('SELECT * FROM Flashcards WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Flashcard created.', flashcard: rows[0] });
  } catch (err) {
    console.error('[createFlashcard]', err);
    return res.status(500).json({ message: 'Failed to create flashcard.' });
  }
};

/**
 * POST /api/flashcards/auto-generate
 * Auto-generate flashcards from pages tagged REVIEW or FOCUS
 * Creates a placeholder card for each tagged page that doesn't already have one
 */
const autoGenerateFlashcards = async (req, res) => {
  const { material_id } = req.body;

  if (!material_id) {
    return res.status(400).json({ message: 'material_id is required.' });
  }

  try {
    // Verify ownership
    const [materials] = await db.query(
      'SELECT id, title FROM Materials WHERE id = ? AND user_id = ?',
      [material_id, req.user.id]
    );
    if (materials.length === 0) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    // Get tagged pages that need flashcards
    const [tags] = await db.query(
      `SELECT mt.page_number, mt.status
       FROM MaterialTags mt
       WHERE mt.material_id = ?
         AND mt.status IN ('REVIEW', 'FOCUS')
         AND mt.page_number IS NOT NULL`,
      [material_id]
    );

    if (tags.length === 0) {
      return res.status(200).json({ message: 'No REVIEW/FOCUS pages found to generate from.', generated: 0 });
    }

    const insertValues = tags.map((tag) => [
      material_id,
      `Review page ${tag.page_number} of "${materials[0].title}" [${tag.status}]`,
      'Write your answer here...',
    ]);

    const [result] = await db.query(
      'INSERT INTO Flashcards (material_id, question, answer) VALUES ?',
      [insertValues]
    );

    return res.status(201).json({
      message: `Generated ${result.affectedRows} flashcard(s).`,
      generated: result.affectedRows,
    });
  } catch (err) {
    console.error('[autoGenerateFlashcards]', err);
    return res.status(500).json({ message: 'Failed to auto-generate flashcards.' });
  }
};

/**
 * DELETE /api/flashcards/:id
 * Delete a flashcard (must belong to user via material ownership)
 */
const deleteFlashcard = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.id FROM Flashcards f
       JOIN Materials m ON f.material_id = m.id
       WHERE f.id = ? AND m.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Flashcard not found.' });
    }

    await db.query('DELETE FROM Flashcards WHERE id = ?', [req.params.id]);
    return res.status(200).json({ message: 'Flashcard deleted.' });
  } catch (err) {
    console.error('[deleteFlashcard]', err);
    return res.status(500).json({ message: 'Failed to delete flashcard.' });
  }
};

module.exports = { getFlashcards, createFlashcard, autoGenerateFlashcards, deleteFlashcard };
