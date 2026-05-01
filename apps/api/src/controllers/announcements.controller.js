const prisma = require('../lib/prisma');
const { getIO } = require('../lib/socket');

async function createAnnouncement(req, res) {
  try {
    const { title, content, pinned } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
    const announcement = await prisma.announcement.create({
      data: { title, content, pinned: pinned || false, authorId: req.user.id, workspaceId: req.params.workspaceId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } }, comments: { include: { author: { select: { id: true, name: true, avatarUrl: true } } } }, reactions: true, _count: { select: { comments: true } } },
    });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('announcement-created', { announcement }); } catch {}
    res.status(201).json({ announcement });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to create announcement' }); }
}

async function getAnnouncements(req, res) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } }, reactions: true, _count: { select: { comments: true } } },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ announcements });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to fetch announcements' }); }
}

async function getAnnouncement(req, res) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: req.params.announcementId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        comments: { include: { author: { select: { id: true, name: true, avatarUrl: true } }, mentions: { include: { user: { select: { id: true, name: true } } } } }, orderBy: { createdAt: 'asc' } },
        reactions: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ announcement });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to fetch announcement' }); }
}

async function updateAnnouncement(req, res) {
  try {
    const { title, content, pinned } = req.body;
    const announcement = await prisma.announcement.update({
      where: { id: req.params.announcementId },
      data: { title, content, pinned },
      include: { author: { select: { id: true, name: true, avatarUrl: true } }, reactions: true, _count: { select: { comments: true } } },
    });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('announcement-updated', { announcement }); } catch {}
    res.json({ announcement });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to update announcement' }); }
}

async function deleteAnnouncement(req, res) {
  try {
    await prisma.announcement.delete({ where: { id: req.params.announcementId } });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('announcement-deleted', { announcementId: req.params.announcementId }); } catch {}
    res.json({ message: 'Announcement deleted' });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to delete announcement' }); }
}

async function toggleReaction(req, res) {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: 'Emoji is required' });
    const existing = await prisma.reaction.findUnique({
      where: { userId_announcementId_emoji: { userId: req.user.id, announcementId: req.params.announcementId, emoji } },
    });
    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      try { getIO().to(`workspace:${req.params.workspaceId}`).emit('reaction-removed', { announcementId: req.params.announcementId, emoji, userId: req.user.id }); } catch {}
      return res.json({ action: 'removed' });
    }
    const reaction = await prisma.reaction.create({
      data: { emoji, userId: req.user.id, announcementId: req.params.announcementId },
    });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('reaction-added', { announcementId: req.params.announcementId, reaction }); } catch {}
    res.status(201).json({ reaction, action: 'added' });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to toggle reaction' }); }
}

async function addComment(req, res) {
  try {
    const { content, mentionIds } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const comment = await prisma.comment.create({
      data: {
        content, authorId: req.user.id, announcementId: req.params.announcementId,
        mentions: mentionIds?.length ? { create: mentionIds.map(userId => ({ userId })) } : undefined,
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } }, mentions: { include: { user: { select: { id: true, name: true } } } } },
    });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('comment-added', { announcementId: req.params.announcementId, comment }); } catch {}
    // Notify mentioned users
    if (mentionIds?.length) {
      mentionIds.forEach(uid => {
        try { getIO().to(`workspace:${req.params.workspaceId}`).emit('mention-notification', { mentionedUserId: uid, comment, announcerName: req.user.name }); } catch {}
      });
    }
    res.status(201).json({ comment });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to add comment' }); }
}

module.exports = { createAnnouncement, getAnnouncements, getAnnouncement, updateAnnouncement, deleteAnnouncement, toggleReaction, addComment };
