const express = require('express');
const multer = require('multer');

const router = express.Router();

const studentController = require('../controllers/studentController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }
});

// Lấy danh sách sinh viên
router.get('/', verifyToken, studentController.getAllStudents);

// Xem trước import Excel
router.post('/import/preview', verifyToken, requireAdmin, upload.single('file'), studentController.previewImportStudents);

// Import Excel sinh viên
router.post('/import', verifyToken, requireAdmin, upload.single('file'), studentController.importStudents);

// Lấy chi tiết 1 sinh viên
router.get('/:id', verifyToken, studentController.getStudentById);

// Lấy lịch sử học tập của sinh viên
router.get('/:id/history', verifyToken, studentController.getStudentHistory);

// Thêm sinh viên
router.post('/', verifyToken, requireAdmin, studentController.createStudent);

// Cập nhật sinh viên
router.put('/:id', verifyToken, requireAdmin, studentController.updateStudent);

// Xóa sinh viên
router.delete('/:id', verifyToken, requireAdmin, studentController.deleteStudent);

module.exports = router;