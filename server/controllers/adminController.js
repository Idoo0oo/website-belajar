const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const getStats = async (req, res) => {
  try {
    const [[users]] = await db.query('SELECT COUNT(*) as count FROM Users');
    const [[materials]] = await db.query('SELECT COUNT(*) as count FROM Materials');
    const [[flashcards]] = await db.query('SELECT COUNT(*) as count FROM Flashcards');

    res.json({
      stats: {
        users: users.count,
        materials: materials.count,
        flashcards: flashcards.count
      }
    });
  } catch (err) {
    console.error('[admin/getStats]', err);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM Users ORDER BY created_at DESC');
    res.json({ users });
  } catch (err) {
    console.error('[admin/getUsers]', err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId == req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself.' });
    }

    // Must delete the user's materials' files from disk before deleting the DB records
    // since DB delete will cascade.
    const [materials] = await db.query('SELECT file_path FROM Materials WHERE user_id = ?', [userId]);
    for (const mat of materials) {
      const fullPath = path.join(__dirname, '../uploads', mat.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await db.query('DELETE FROM Users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('[admin/deleteUser]', err);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE Users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

    res.json({ message: 'User password updated successfully.' });
  } catch (err) {
    console.error('[admin/changeUserPassword]', err);
    res.status(500).json({ message: 'Server error changing password.' });
  }
};

const getMaterials = async (req, res) => {
  try {
    const [materials] = await db.query(`
      SELECT m.*, u.name as user_name, u.email as user_email
      FROM Materials m
      JOIN Users u ON m.user_id = u.id
      ORDER BY m.uploaded_at DESC
    `);
    res.json({ materials });
  } catch (err) {
    console.error('[admin/getMaterials]', err);
    res.status(500).json({ message: 'Server error fetching materials.' });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;
    const [rows] = await db.query('SELECT file_path FROM Materials WHERE id = ?', [materialId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Material not found.' });

    const fullPath = path.join(__dirname, '../uploads', rows[0].file_path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await db.query('DELETE FROM Materials WHERE id = ?', [materialId]);
    res.json({ message: 'Material deleted successfully.' });
  } catch (err) {
    console.error('[admin/deleteMaterial]', err);
    res.status(500).json({ message: 'Server error deleting material.' });
  }
};

module.exports = {
  getStats,
  getUsers,
  deleteUser,
  changeUserPassword,
  getMaterials,
  deleteMaterial
};
