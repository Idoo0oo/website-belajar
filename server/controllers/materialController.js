const fs = require('fs');
const path = require('path');
const db = require('../config/db');

/**
 * GET /api/materials
 * Fetch all materials for the logged-in user
 */
const getMaterials = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Materials WHERE user_id = ? ORDER BY uploaded_at DESC',
      [req.user.id]
    );
    return res.status(200).json({ materials: rows });
  } catch (err) {
    console.error('[getMaterials]', err);
    return res.status(500).json({ message: 'Failed to fetch materials.' });
  }
};

/**
 * GET /api/materials/:id
 * Fetch a single material by ID (must belong to logged-in user)
 */
const getMaterialById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Material not found.' });
    }
    return res.status(200).json({ material: rows[0] });
  } catch (err) {
    console.error('[getMaterialById]', err);
    return res.status(500).json({ message: 'Failed to fetch material.' });
  }
};

/**
 * POST /api/materials/upload
 * Accept a PDF file via Multer, save to /uploads/, insert record to DB
 */
const uploadMaterial = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No PDF file uploaded.' });
  }

  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  const filePath = req.file.filename; // stored relative, served via /uploads
  const fileType = req.file.mimetype;

  try {
    const [result] = await db.query(
      'INSERT INTO Materials (user_id, title, file_path, file_type) VALUES (?, ?, ?, ?)',
      [req.user.id, title, filePath, fileType]
    );
    const [rows] = await db.query('SELECT * FROM Materials WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Material uploaded.', material: rows[0] });
  } catch (err) {
    console.error('[uploadMaterial]', err);
    return res.status(500).json({ message: 'Failed to save material.' });
  }
};

/**
 * DELETE /api/materials/:id
 * Delete material record and its file from disk
 */
const deleteMaterial = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Materials WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    const material = rows[0];
    const filePath = path.join(__dirname, '..', 'uploads', material.file_path);

    // Delete from DB first
    await db.query('DELETE FROM Materials WHERE id = ?', [material.id]);

    // Delete file from disk (non-blocking, best effort)
    fs.unlink(filePath, (err) => {
      if (err) console.warn('[deleteMaterial] File not found on disk:', filePath);
    });

    return res.status(200).json({ message: 'Material deleted.' });
  } catch (err) {
    console.error('[deleteMaterial]', err);
    return res.status(500).json({ message: 'Failed to delete material.' });
  }
};

module.exports = { getMaterials, getMaterialById, uploadMaterial, deleteMaterial };
