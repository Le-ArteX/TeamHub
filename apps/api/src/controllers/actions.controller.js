const prisma = require('../lib/prisma');
const { getIO } = require('../lib/socket');

async function createActionItem(req, res) {
  try {
    const { title, priority, status, dueDate, assigneeId, goalId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const item = await prisma.actionItem.create({
      data: { title, priority: priority || 'MEDIUM', status: status || 'TODO', dueDate: dueDate ? new Date(dueDate) : null, assigneeId, workspaceId: req.params.workspaceId, goalId },
      include: { assignee: { select: { id: true, name: true, avatarUrl: true } }, goal: { select: { id: true, title: true } } },
    });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('action-created', { item }); } catch {}
    res.status(201).json({ item });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to create action item' }); }
}

async function getActionItems(req, res) {
  try {
    const { status, priority, goalId } = req.query;
    const where = { workspaceId: req.params.workspaceId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (goalId) where.goalId = goalId;
    const items = await prisma.actionItem.findMany({
      where, include: { assignee: { select: { id: true, name: true, avatarUrl: true } }, goal: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to fetch action items' }); }
}

async function updateActionItem(req, res) {
  try {
    const { title, priority, status, dueDate, assigneeId, goalId } = req.body;
    const item = await prisma.actionItem.update({
      where: { id: req.params.itemId },
      data: { title, priority, status, dueDate: dueDate ? new Date(dueDate) : undefined, assigneeId, goalId },
      include: { assignee: { select: { id: true, name: true, avatarUrl: true } }, goal: { select: { id: true, title: true } } },
    });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('action-updated', { item }); } catch {}
    res.json({ item });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to update action item' }); }
}

async function deleteActionItem(req, res) {
  try {
    await prisma.actionItem.delete({ where: { id: req.params.itemId } });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('action-deleted', { itemId: req.params.itemId }); } catch {}
    res.json({ message: 'Action item deleted' });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to delete action item' }); }
}

module.exports = { createActionItem, getActionItems, updateActionItem, deleteActionItem };
