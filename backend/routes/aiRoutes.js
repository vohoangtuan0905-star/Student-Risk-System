const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/predict', verifyToken, aiController.predictStudentRisk);
router.post('/predict-by-student/:studentId', verifyToken, aiController.predictByStudentId);

module.exports = router;