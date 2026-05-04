const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Read operations - available to all authenticated users
router.get('/', verifyToken, classController.getAllClasses);

// Write operations - admin only
router.post('/', verifyToken, requireAdmin, classController.createClass);
router.put('/:id', verifyToken, requireAdmin, classController.updateClass);
router.delete('/:id', verifyToken, requireAdmin, classController.deleteClass);

module.exports = router;