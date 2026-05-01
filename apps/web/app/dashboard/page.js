"use client";
import { useEffect, useState } from "react";
import useWorkspaceStore from "../../store/workspaceStore";
import useAuthStore from "../../store/authStore";
import api from "../../lib/api";

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) return;
    setLoading(true);
    api.get(`/workspaces/${currentWorkspace.id}/analytics/stats`)
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentWorkspace]);

  if (!currentWorkspace) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Welcome, {user?.name}!</h1>
        <p className="text-slate-500">Create or select a workspace to get started.</p>
        <CreateWorkspaceInline />
      </div>
    );
  }

  const statCards = [
    { label: "Total Goals", value: stats?.totalGoals || 0, icon: "🎯", color: "from-blue-600 to-blue-500" },
    { label: "Completed This Week", value: stats?.completedThisWeek || 0, icon: "✅", color: "from-green-500 to-emerald-500" },
    { label: "Overdue Items", value: stats?.overdueCount || 0, icon: "⚠️", color: "from-amber-500 to-orange-500" },
    { label: "Members", value: currentWorkspace.members?.length || 0, icon: "👥", color: "from-sky-500 to-blue-500" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{currentWorkspace.name} overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-500/30 transition-all group shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.color}`}></div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? "—" : card.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Goal Distribution */}
      {stats?.goalsByStatus && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Goal Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.goalsByStatus.map((g) => (
              <div key={g.status} className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{g._count}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium uppercase tracking-wider">{g.status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Members */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Team Members</h2>
        <div className="space-y-3">
          {currentWorkspace.members?.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {m.user.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-900 dark:text-white font-semibold">{m.user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.user.email}</p>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${m.role === 'ADMIN' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateWorkspaceInline() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [loading, setLoading] = useState(false);
  const { createWorkspace } = useWorkspaceStore();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try { await createWorkspace({ name, description: desc, accentColor: color }); } catch {}
    setLoading(false);
  };

  return (
    <form onSubmit={handleCreate} className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md space-y-4 shadow-xl transition-all">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Create Your First Workspace</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Workspace name" required
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
      <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)"
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-500 dark:text-slate-400 font-medium">Theme Color</label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
        {loading ? "Creating..." : "Create Workspace"}
      </button>
    </form>

  );
}
