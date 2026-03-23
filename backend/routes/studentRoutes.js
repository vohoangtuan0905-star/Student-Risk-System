const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const verifyToken = require('../middleware/authMiddleware');

// Lấy danh sách sinh viên
router.get('/', verifyToken, studentController.getAllStudents);

// Lấy chi tiết 1 sinh viên
router.get('/:id', verifyToken, studentController.getStudentById);

// Lấy lịch sử học tập của sinh viên
router.get('/:id/history', verifyToken, studentController.getStudentHistory);

// Thêm sinh viên
router.post('/', verifyToken, studentController.createStudent);

// Cập nhật sinh viên
router.put('/:id', verifyToken, studentController.updateStudent);

// Xóa sinh viên
router.delete('/:id', verifyToken, studentController.deleteStudent);

module.exports = router;