const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const {
  getMaterials,
  getMaterialById,
  uploadMaterial,
  deleteMaterial,
} = require('../controllers/materialController');
const { upsertTag, getTagsForMaterial } = require('../controllers/tagController');

// All material routes are protected
router.get('/', auth, getMaterials);
router.get('/:id', auth, getMaterialById);
router.post('/upload', auth, upload.single('pdf'), uploadMaterial);
router.delete('/:id', auth, deleteMaterial);

// Tag sub-routes under a material
router.post('/:id/tags', auth, upsertTag);
router.get('/:id/tags', auth, getTagsForMaterial);

module.exports = router;
