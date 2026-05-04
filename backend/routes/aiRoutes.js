const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.get('/current-model', verifyToken, aiController.getCurrentModel);
router.post('/predict', verifyToken, aiController.predictStudentRisk);
router.post('/predict-approx', verifyToken, aiController.predictStudentRiskApprox);
router.post('/predict-by-student/:studentId', verifyToken, aiController.predictByStudentId);
router.post('/retrain', verifyToken, requireAdmin, aiController.retrainModel);

module.exports = router;