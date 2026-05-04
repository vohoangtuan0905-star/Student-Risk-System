const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Read operations - available to all authenticated users
router.get('/', verifyToken, departmentController.getAllDepartments);

// Write operations - admin only
router.post('/', verifyToken, requireAdmin, departmentController.createDepartment);
router.put('/:id', verifyToken, requireAdmin, departmentController.updateDepartment); 
router.delete('/:id', verifyToken, requireAdmin, departmentController.deleteDepartment); 

module.exports = router;