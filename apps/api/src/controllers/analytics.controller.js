const prisma = require('../lib/prisma');

async function getDashboardStats(req, res) {
  try {
    const wId = req.params.workspaceId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalGoals, completedThisWeek, overdueCount, actionsByStatus] = await Promise.all([
      prisma.goal.count({ where: { workspaceId: wId } }),
      prisma.goal.count({ where: { workspaceId: wId, status: 'COMPLETED', updatedAt: { gte: weekAgo } } }),
      prisma.actionItem.count({ where: { workspaceId: wId, dueDate: { lt: now }, status: { not: 'DONE' } } }),
      prisma.actionItem.groupBy({ by: ['status'], where: { workspaceId: wId }, _count: true }),
    ]);

    const goalsByStatus = await prisma.goal.groupBy({ by: ['status'], where: { workspaceId: wId }, _count: true });

    res.json({ stats: { totalGoals, completedThisWeek, overdueCount, goalsByStatus, actionsByStatus } });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to fetch stats' }); }
}

async function getGoalCompletionChart(req, res) {
  try {
    const wId = req.params.workspaceId;
    const goals = await prisma.goal.findMany({
      where: { workspaceId: wId },
      select: { status: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthMap = {};
    goals.forEach(g => {
      const month = g.createdAt.toISOString().slice(0, 7);
      if (!monthMap[month]) monthMap[month] = { month, created: 0, completed: 0 };
      monthMap[month].created++;
      if (g.status === 'COMPLETED') monthMap[month].completed++;
    });

    res.json({ chartData: Object.values(monthMap) });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to fetch chart data' }); }
}

async function exportCSV(req, res) {
  try {
    const wId = req.params.workspaceId;
    const [goals, actions] = await Promise.all([
      prisma.goal.findMany({ where: { workspaceId: wId }, include: { owner: { select: { name: true } } } }),
      prisma.actionItem.findMany({ where: { workspaceId: wId }, include: { assignee: { select: { name: true } } } }),
    ]);

    let csv = 'Type,Title,Status,Owner/Assignee,Due Date,Created At\n';
    goals.forEach(g => { csv += `Goal,"${g.title}",${g.status},${g.owner.name},${g.dueDate || ''},${g.createdAt}\n`; });
    actions.forEach(a => { csv += `Action,"${a.title}",${a.status},${a.assignee?.name || 'Unassigned'},${a.dueDate || ''},${a.createdAt}\n`; });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=workspace-export.csv');
    res.send(csv);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to export CSV' }); }
}

module.exports = { getDashboardStats, getGoalCompletionChart, exportCSV };
