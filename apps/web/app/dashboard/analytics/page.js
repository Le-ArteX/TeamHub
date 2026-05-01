"use client";
import { useEffect, useState } from "react";
import useWorkspaceStore from "../../../store/workspaceStore";
import api from "../../../lib/api";
import dynamic from "next/dynamic";

// Dynamic import Recharts to avoid SSR issues
const RechartsBar = dynamic(() => import("recharts").then(m => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = m;
  return function ChartComponent({ data }) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#1e293b' }} 
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
          <Bar dataKey="created" fill="#3b82f6" name="Created" radius={[6, 6, 0, 0]} />
          <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading analytics engine...</div> });

export default function AnalyticsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) return;
    setLoading(true);
    Promise.all([
      api.get(`/workspaces/${currentWorkspace.id}/analytics/stats`),
      api.get(`/workspaces/${currentWorkspace.id}/analytics/chart`),
    ]).then(([statsRes, chartRes]) => {
      setStats(statsRes.data.stats);
      setChartData(chartRes.data.chartData);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [currentWorkspace]);

  const handleExport = async () => {
    try {
      const res = await api.get(`/workspaces/${currentWorkspace.id}/analytics/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error('Export failed', err); }
  };

  if (!currentWorkspace) return <p className="text-slate-500 font-medium text-center py-12">Select a workspace first.</p>;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-slate-500 font-semibold mt-1">Workspace performance insights</p>
        </div>
        <button id="export-csv-btn" onClick={handleExport}
          className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm">
          📥 Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Goals", value: stats?.totalGoals || 0, icon: "🎯", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed Recent", value: stats?.completedThisWeek || 0, icon: "✅", color: "text-green-600", bg: "bg-green-50" },
          { label: "Overdue Actions", value: stats?.overdueCount || 0, icon: "⚠️", color: "text-red-600", bg: "bg-red-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
              {s.icon}
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{loading ? "—" : s.value}</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Goal Completion Velocity</h2>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Monthly Outlook</div>
          </div>
          {chartData.length > 0 ? <RechartsBar data={chartData} /> : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 font-medium italic">No data yet. Create goals to see velocity.</div>
          )}
        </div>

        {/* Action Items by Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm h-fit transition-all">
          <h2 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Task Distribution</h2>
          <div className="space-y-4">
            {stats?.actionsByStatus ? stats.actionsByStatus.map(s => {
              const statusColor = s.status === 'DONE' ? 'bg-green-500' : s.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300';
              return (
                <div key={s.status} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{s.status.replace('_', ' ')}</span>
                    </div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">{s._count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`${statusColor} h-full rounded-full transition-all duration-1000`} 
                      style={{ width: `${(s._count / (stats.totalActions || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-slate-400 text-sm font-medium italic text-center py-8">No tasks recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
