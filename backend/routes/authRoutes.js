const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getCurrentUser);
router.put('/change-password', verifyToken, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;