const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate, requireRole } = require('../middleware/auth');
const logAudit = require('../middleware/audit.middleware');
const a = require('../controllers/announcements.controller');

router.use(authenticate);

router.post('/', requireRole('ADMIN'), logAudit('ANNOUNCEMENT', 'ANNOUNCEMENT'), a.createAnnouncement);
router.get('/', requireRole(), a.getAnnouncements);
router.get('/:announcementId', requireRole(), a.getAnnouncement);
router.put('/:announcementId', requireRole('ADMIN'), logAudit('ANNOUNCEMENT', 'ANNOUNCEMENT'), a.updateAnnouncement);
router.delete('/:announcementId', requireRole('ADMIN'), logAudit('ANNOUNCEMENT', 'ANNOUNCEMENT'), a.deleteAnnouncement);
router.post('/:announcementId/reactions', requireRole(), a.toggleReaction);
router.post('/:announcementId/comments', requireRole(), a.addComment);

module.exports = router;
