const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate, requireRole } = require('../middleware/auth');
const logAudit = require('../middleware/audit.middleware');
const ac = require('../controllers/actions.controller');

router.use(authenticate);

router.post('/', requireRole(), logAudit('ACTION_ITEM', 'ACTION_ITEM'), ac.createActionItem);
router.get('/', requireRole(), ac.getActionItems);
router.put('/:itemId', requireRole(), logAudit('ACTION_ITEM', 'ACTION_ITEM'), ac.updateActionItem);
router.delete('/:itemId', requireRole(), logAudit('ACTION_ITEM', 'ACTION_ITEM'), ac.deleteActionItem);

module.exports = router;
