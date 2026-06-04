const express = require('express');
const router = express.Router();
const { getOrGenerateQuiz, regenerateQuiz } = require('../controllers/quizController');
const auth = require('../middleware/auth');

router.use(auth);

// Returns cached quiz or generates + caches a new one
router.get('/:materialId', getOrGenerateQuiz);

// Force-regenerates quiz regardless of cache
router.post('/:materialId/regenerate', regenerateQuiz);

module.exports = router;
