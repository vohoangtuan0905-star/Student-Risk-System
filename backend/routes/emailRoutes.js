const express = require('express');
const router = express.Router();

const emailController = require('../controllers/emailController');
const verifyToken = require('../middleware/authMiddleware');

// Gửi email cảnh báo cho giảng viên chủ nhiệm
router.post('/send-warning', verifyToken, emailController.sendWarningEmail);

module.exports = router;
