"use client";
import { useEffect, useState } from "react";
import useActionStore from "../../../store/actionStore";
import useWorkspaceStore from "../../../store/workspaceStore";
import useGoalStore from "../../../store/goalStore";

const PRIORITY_COLORS = { 
  LOW: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400", 
  MEDIUM: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", 
  HIGH: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", 
  URGENT: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
};
const COLUMNS = [
  { status: "TODO", label: "To Do", color: "border-slate-200" },
  { status: "IN_PROGRESS", label: "In Progress", color: "border-blue-400" },
  { status: "DONE", label: "Done", color: "border-green-400" },
];

export default function ActionsPage() {
  const { items, loading, fetchActions, createAction, updateAction, deleteAction } = useActionStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { goals, fetchGoals } = useGoalStore();
  const [view, setView] = useState("kanban");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "MEDIUM", dueDate: "", assigneeId: "", goalId: "" });

  useEffect(() => {
    if (currentWorkspace) {
      fetchActions(currentWorkspace.id);
      fetchGoals(currentWorkspace.id);
    }
  }, [currentWorkspace, fetchActions, fetchGoals]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = { ...form, assigneeId: form.assigneeId || undefined, goalId: form.goalId || undefined, dueDate: form.dueDate || undefined };
    await createAction(currentWorkspace.id, data);
    setForm({ title: "", priority: "MEDIUM", dueDate: "", assigneeId: "", goalId: "" });
    setShowCreate(false);
  };

  const handleStatusChange = async (itemId, status) => {
    await updateAction(currentWorkspace.id, itemId, { status });
  };

  if (!currentWorkspace) return <p className="text-slate-500 font-medium text-center py-12">Select a workspace first.</p>;

  const members = currentWorkspace.members || [];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Action Items</h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1">Track tasks and assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button onClick={() => setView("kanban")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${view === "kanban" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>Kanban</button>
            <button onClick={() => setView("list")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${view === "list" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>List</button>
          </div>
          <button id="create-action-btn" onClick={() => setShowCreate(!showCreate)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all">+ New Task</button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl p-8 space-y-5 animate-slide-in shadow-2xl shadow-blue-500/5 transition-all">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Add a New Task</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Task Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="What needs to be done?" required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all">
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Assignee</label>
              <select value={form.assigneeId} onChange={e => setForm({...form, assigneeId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Linked Goal</label>
              <select value={form.goalId} onChange={e => setForm({...form, goalId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all">
                <option value="">No linked goal</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">Create Task</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching actions...</p>
        </div>
      ) : view === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map(col => {
              const colItems = items.filter(i => i.status === col.status);
              return (
                <div key={col.status} className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 flex flex-col h-full min-h-[500px] border border-transparent dark:border-slate-800/50 transition-all">
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col.status === 'DONE' ? 'bg-green-500' : col.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{col.label}</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">{colItems.length}</span>
                  </div>
                  <div className="space-y-3 flex-1 overflow-auto">
                    {colItems.map(item => (
                      <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-sm text-slate-900 dark:text-white font-bold leading-snug">{item.title}</h4>
                          <button onClick={() => { if(confirm('Delete this task?')) deleteAction(currentWorkspace.id, item.id); }}
                            className="text-slate-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
                          {item.dueDate && <span className="text-[10px] font-bold text-slate-400 uppercase">📅 {new Date(item.dueDate).toLocaleDateString()}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            {item.assignee ? (
                              <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-400 font-black shadow-sm" title={item.assignee.name}>
                                {item.assignee.name?.[0]?.toUpperCase()}
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-black">?</div>
                            )}
                            {item.goal && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate max-w-[100px]">🎯 {item.goal.title}</span>}
                          </div>
                          
                          <div className="flex gap-1">
                            {COLUMNS.filter(c => c.status !== col.status).map(c => (
                              <button key={c.status} onClick={() => handleStatusChange(item.id, c.status)}
                                className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all flex items-center justify-center text-xs" title={`Move to ${c.label}`}>→</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Due</th>
                <th className="px-6 py-4"></th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-medium italic">No action items found.</td></tr>
                ) : items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{item.title}</td>
                    <td className="px-6 py-4">
                      <select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)}
                        className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none cursor-pointer transition-all border-none">
                        <option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option>
                      </select>
                    </td>
                    <td className="px-6 py-4"><span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.assignee && (
                          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-400 font-black">
                            {item.assignee.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">{item.assignee?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-bold">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { if(confirm('Delete this task?')) deleteAction(currentWorkspace.id, item.id); }} className="text-slate-300 hover:text-red-500 transition-colors p-2">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}
