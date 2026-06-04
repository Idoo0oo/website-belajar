const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getWeeklySessions, logSession } = require('../controllers/sessionController');

router.get('/weekly', auth, getWeeklySessions);
router.post('/', auth, logSession);

module.exports = router;
