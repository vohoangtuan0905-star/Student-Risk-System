const express = require('express');
const router = express.Router();
const academicRecordController = require('../controllers/academicRecordController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/student/:studentId', verifyToken, academicRecordController.getAcademicRecordsByStudentId);
router.post('/', verifyToken, academicRecordController.createAcademicRecord);
router.put('/:id', verifyToken, academicRecordController.updateAcademicRecord);
router.delete('/:id', verifyToken, academicRecordController.deleteAcademicRecord);

module.exports = router;