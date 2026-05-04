const express = require('express');
const router = express.Router();

const lecturerController = require('../controllers/lecturerController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.use(requireAdmin);

router.get('/', lecturerController.getAllLecturers);
router.post('/', lecturerController.createLecturer);
router.put('/:id', lecturerController.updateLecturer);
router.delete('/:id', lecturerController.deleteLecturer);
router.put('/:id/homeroom-classes', lecturerController.assignHomeroomClasses);

module.exports = router;