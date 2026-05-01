const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate, requireRole } = require('../middleware/auth');
const an = require('../controllers/analytics.controller');

router.use(authenticate);

router.get('/stats', requireRole(), an.getDashboardStats);
router.get('/chart', requireRole(), an.getGoalCompletionChart);
router.get('/export', requireRole(), an.exportCSV);

module.exports = router;
