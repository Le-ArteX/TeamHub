const prisma = require('../lib/prisma');
const { getIO } = require('../lib/socket');

async function createGoal(req, res) {
  try {
    const { title, description, dueDate, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const goal = await prisma.goal.create({
      data: {
        title, description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'NOT_STARTED',
        ownerId: req.user.id,
        workspaceId: req.params.workspaceId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        milestones: true, _count: { select: { actionItems: true } },
      },
    });
    await prisma.activity.create({
      data: { type: 'GOAL_CREATED', message: `${req.user.name} created goal "${title}"`, userId: req.user.id, workspaceId: req.params.workspaceId, goalId: goal.id },
    });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('goal-created', { goal }); } catch {}
    res.status(201).json({ goal });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to create goal' }); }
}

async function getGoals(req, res) {
  try {
    const where = { workspaceId: req.params.workspaceId };
    if (req.query.status) where.status = req.query.status;
    const goals = await prisma.goal.findMany({
      where, include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        milestones: true, _count: { select: { actionItems: true } },
      }, orderBy: { createdAt: 'desc' },
    });
    res.json({ goals });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to fetch goals' }); }
}

async function getGoal(req, res) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: req.params.goalId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        milestones: { orderBy: { createdAt: 'asc' } },
        actionItems: { include: { assignee: { select: { id: true, name: true, avatarUrl: true } } } },
        activities: { include: { user: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ goal });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to fetch goal' }); }
}

async function updateGoal(req, res) {
  try {
    const { title, description, dueDate, status } = req.body;
    const oldGoal = await prisma.goal.findUnique({ where: { id: req.params.goalId } });
    const goal = await prisma.goal.update({
      where: { id: req.params.goalId },
      data: { title, description, dueDate: dueDate ? new Date(dueDate) : undefined, status },
      include: { owner: { select: { id: true, name: true, email: true, avatarUrl: true } }, milestones: true, _count: { select: { actionItems: true } } },
    });
    if (status && oldGoal.status !== status) {
      await prisma.activity.create({ data: { type: 'STATUS_CHANGED', message: `${req.user.name} changed status to ${status}`, userId: req.user.id, workspaceId: req.params.workspaceId, goalId: goal.id } });
    }
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('goal-updated', { goal }); } catch {}
    res.json({ goal });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to update goal' }); }
}

async function deleteGoal(req, res) {
  try {
    await prisma.goal.delete({ where: { id: req.params.goalId } });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('goal-deleted', { goalId: req.params.goalId }); } catch {}
    res.json({ message: 'Goal deleted' });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to delete goal' }); }
}

async function createMilestone(req, res) {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const milestone = await prisma.milestone.create({ data: { title, goalId: req.params.goalId } });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('milestone-created', { milestone, goalId: req.params.goalId }); } catch {}
    res.status(201).json({ milestone });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to create milestone' }); }
}

async function updateMilestone(req, res) {
  try {
    const { title, completed, progressPercent } = req.body;
    const milestone = await prisma.milestone.update({ where: { id: req.params.milestoneId }, data: { title, completed, progressPercent } });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('milestone-updated', { milestone }); } catch {}
    res.json({ milestone });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to update milestone' }); }
}

async function deleteMilestone(req, res) {
  try {
    await prisma.milestone.delete({ where: { id: req.params.milestoneId } });
    res.json({ message: 'Milestone deleted' });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to delete milestone' }); }
}

async function postActivity(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const activity = await prisma.activity.create({
      data: { type: 'PROGRESS_UPDATE', message, userId: req.user.id, workspaceId: req.params.workspaceId, goalId: req.params.goalId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    try { getIO().to(`workspace:${req.params.workspaceId}`).emit('activity-created', { activity }); } catch {}
    res.status(201).json({ activity });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to post activity' }); }
}

module.exports = { createGoal, getGoals, getGoal, updateGoal, deleteGoal, createMilestone, updateMilestone, deleteMilestone, postActivity };
