const express = require('express');
const router = express.Router();

const semesterController = require('../controllers/semesterController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, semesterController.getAllSemesters);
router.get('/:id', verifyToken, semesterController.getSemesterById);
router.post('/', verifyToken, semesterController.createSemester);
router.put('/:id', verifyToken, semesterController.updateSemester);
router.delete('/:id', verifyToken, semesterController.deleteSemester);

module.exports = router;