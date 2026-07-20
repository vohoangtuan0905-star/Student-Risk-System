const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Read operations - available to all authenticated users
router.get('/', verifyToken, departmentController.getAllDepartments);

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Write operations - admin only
router.post('/import/preview', verifyToken, requireAdmin, upload.single('file'), departmentController.previewImportDepartments);
router.post('/import', verifyToken, requireAdmin, upload.single('file'), departmentController.importDepartments);
router.post('/', verifyToken, requireAdmin, departmentController.createDepartment);
router.put('/:id', verifyToken, requireAdmin, departmentController.updateDepartment); 
router.delete('/:id', verifyToken, requireAdmin, departmentController.deleteDepartment); 

module.exports = router;