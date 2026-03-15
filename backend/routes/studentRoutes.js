const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middleware/authMiddleware'); // Nhập Ông Bảo Vệ

// Phải đi qua verifyToken trước, nếu OK mới được vào getAllStudents
router.get('/', verifyToken, studentController.getAllStudents);

// Lấy lịch sử 1 SV cũng cần có Token bảo vệ
router.get('/:id/history', verifyToken, studentController.getStudentHistory);

module.exports = router;