const prisma = require('../lib/prisma');
const { getIO } = require('../lib/socket');


async function createWorkspace(req, res) {
  try {
    const { name, description, accentColor } = req.body;
    if (!name) return res.status(400).json({ error: 'Workspace name is required' });

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description: description || null,
        accentColor: accentColor || '#6366f1',
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
      },
    });

    res.status(201).json({ workspace });
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
}


async function getWorkspaces(req, res) {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        _count: { select: { goals: true, actionItems: true, announcements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ workspaces });
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
}


async function getWorkspace(req, res) {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.workspaceId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        _count: { select: { goals: true, actionItems: true, announcements: true } },
      },
    });

    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ workspace });
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
}


async function updateWorkspace(req, res) {
  try {
    const { name, description, accentColor } = req.body;
    const workspace = await prisma.workspace.update({
      where: { id: req.params.workspaceId },
      data: { name, description, accentColor },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });

    res.json({ workspace });
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
}


async function deleteWorkspace(req, res) {
  try {
    await prisma.workspace.delete({ where: { id: req.params.workspaceId } });
    res.json({ message: 'Workspace deleted' });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
}


async function inviteMember(req, res) {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found with this email' });

    const existing = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId: req.params.workspaceId } },
    });
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: req.params.workspaceId,
        role: role || 'MEMBER',
      },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });


    try {
      getIO().to(`workspace:${req.params.workspaceId}`).emit('member-joined', { member });
    } catch { }

    res.status(201).json({ member });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
}


async function updateMemberRole(req, res) {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const member = await prisma.workspaceMember.update({
      where: { id: req.params.memberId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    res.json({ member });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
}


async function removeMember(req, res) {
  try {
    await prisma.workspaceMember.delete({ where: { id: req.params.memberId } });
    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}


async function getAuditLogs(req, res) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  updateMemberRole,
  removeMember,
  getAuditLogs,
};
