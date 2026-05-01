const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ws = require('../controllers/workspace.controller');

router.use(authenticate);

router.post('/', ws.createWorkspace);
router.get('/', ws.getWorkspaces);
router.get('/:workspaceId', requireRole(), ws.getWorkspace);
router.put('/:workspaceId', requireRole('ADMIN'), ws.updateWorkspace);
router.delete('/:workspaceId', requireRole('ADMIN'), ws.deleteWorkspace);
router.post('/:workspaceId/invite', requireRole('ADMIN'), ws.inviteMember);
router.put('/:workspaceId/members/:memberId/role', requireRole('ADMIN'), ws.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', requireRole('ADMIN'), ws.removeMember);
router.get('/:workspaceId/audit-logs', requireRole('ADMIN'), ws.getAuditLogs);

module.exports = router;
