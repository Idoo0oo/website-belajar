const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.use(auth);
router.use(adminAuth);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/password', adminController.changeUserPassword);
router.get('/materials', adminController.getMaterials);
router.delete('/materials/:id', adminController.deleteMaterial);

module.exports = router;
