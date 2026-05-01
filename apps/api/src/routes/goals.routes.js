const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate, requireRole } = require('../middleware/auth');
const logAudit = require('../middleware/audit.middleware');
const g = require('../controllers/goals.controller');

router.use(authenticate);

router.post('/', requireRole(), logAudit('GOAL', 'GOAL'), g.createGoal);
router.get('/', requireRole(), g.getGoals);
router.get('/:goalId', requireRole(), g.getGoal);
router.put('/:goalId', requireRole(), logAudit('GOAL', 'GOAL'), g.updateGoal);
router.delete('/:goalId', requireRole('ADMIN'), logAudit('GOAL', 'GOAL'), g.deleteGoal);

router.post('/:goalId/milestones', requireRole(), logAudit('MILESTONE', 'GOAL'), g.createMilestone);
router.put('/:goalId/milestones/:milestoneId', requireRole(), logAudit('MILESTONE', 'GOAL'), g.updateMilestone);
router.delete('/:goalId/milestones/:milestoneId', requireRole(), logAudit('MILESTONE', 'GOAL'), g.deleteMilestone);

router.post('/:goalId/activity', requireRole(), g.postActivity);

module.exports = router;
