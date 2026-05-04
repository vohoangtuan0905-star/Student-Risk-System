const express = require('express');
const router = express.Router();

const semesterController = require('../controllers/semesterController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, requireAdmin, semesterController.getAllSemesters);
router.get('/:id', verifyToken, requireAdmin, semesterController.getSemesterById);
router.post('/', verifyToken, requireAdmin, semesterController.createSemester);
router.put('/:id', verifyToken, requireAdmin, semesterController.updateSemester);
router.delete('/:id', verifyToken, requireAdmin, semesterController.deleteSemester);

module.exports = router;