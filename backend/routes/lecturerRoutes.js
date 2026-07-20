const express = require('express');
const router = express.Router();

const lecturerController = require('../controllers/lecturerController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.use(requireAdmin);

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/import/preview', upload.single('file'), lecturerController.previewImportLecturers);
router.post('/import', upload.single('file'), lecturerController.importLecturers);

router.get('/', lecturerController.getAllLecturers);
router.post('/', lecturerController.createLecturer);
router.put('/:id', lecturerController.updateLecturer);
router.delete('/:id', lecturerController.deleteLecturer);
router.put('/:id/homeroom-classes', lecturerController.assignHomeroomClasses);

module.exports = router;