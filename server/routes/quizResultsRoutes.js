const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { saveQuizResult, getResultsByMaterial, getAllResults } = require('../controllers/quizResultsController');

router.use(auth);

router.post('/', saveQuizResult);
router.get('/', getAllResults);
router.get('/:materialId', getResultsByMaterial);

module.exports = router;
