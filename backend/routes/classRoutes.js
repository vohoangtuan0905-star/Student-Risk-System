const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Read operations - available to all authenticated users
router.get('/', verifyToken, classController.getAllClasses);

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Write operations - admin only
router.post('/import/preview', verifyToken, requireAdmin, upload.single('file'), classController.previewImportClasses);
router.post('/import', verifyToken, requireAdmin, upload.single('file'), classController.importClasses);
router.post('/', verifyToken, requireAdmin, classController.createClass);
router.put('/:id', verifyToken, requireAdmin, classController.updateClass);
router.delete('/:id', verifyToken, requireAdmin, classController.deleteClass);

module.exports = router;