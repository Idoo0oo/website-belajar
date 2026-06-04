const db = require('../config/db');

/**
 * POST /api/materials/:id/tags
 * Upsert a tag for a specific page (or document-level if page_number omitted)
 * Uses INSERT ... ON DUPLICATE KEY UPDATE for atomic upsert
 */
const upsertTag = async (req, res) => {
  const material_id = req.params.id;
  const { page_number = null, status } = req.body;

  const validStatuses = ['UNDERSTOOD', 'REVIEW', 'FOCUS'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'status must be UNDERSTOOD, REVIEW, or FOCUS.' });
  }

  try {
    // Verify material belongs to user
    const [materials] = await db.query(
      'SELECT id FROM Materials WHERE id = ? AND user_id = ?',
      [material_id, req.user.id]
    );
    if (materials.length === 0) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    await db.query(
      `INSERT INTO MaterialTags (material_id, page_number, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), tagged_at = CURRENT_TIMESTAMP`,
      [material_id, page_number, status]
    );

    return res.status(200).json({ message: 'Tag saved.', tag: { material_id, page_number, status } });
  } catch (err) {
    console.error('[upsertTag]', err);
    return res.status(500).json({ message: 'Failed to save tag.' });
  }
};

/**
 * GET /api/materials/:id/tags
 * Get all tags for a material (both doc-level and page-level)
 */
const getTagsForMaterial = async (req, res) => {
  try {
    const [materials] = await db.query(
      'SELECT id FROM Materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (materials.length === 0) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const [tags] = await db.query(
      'SELECT * FROM MaterialTags WHERE material_id = ? ORDER BY page_number ASC',
      [req.params.id]
    );
    return res.status(200).json({ tags });
  } catch (err) {
    console.error('[getTagsForMaterial]', err);
    return res.status(500).json({ message: 'Failed to fetch tags.' });
  }
};

module.exports = { upsertTag, getTagsForMaterial };
