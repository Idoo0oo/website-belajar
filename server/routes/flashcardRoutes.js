const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getFlashcards,
  createFlashcard,
  autoGenerateFlashcards,
  deleteFlashcard,
} = require('../controllers/flashcardController');

router.get('/', auth, getFlashcards);
router.post('/', auth, createFlashcard);
router.post('/auto-generate', auth, autoGenerateFlashcards);
router.delete('/:id', auth, deleteFlashcard);

module.exports = router;
