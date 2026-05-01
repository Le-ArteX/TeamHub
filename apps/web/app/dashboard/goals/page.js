"use client";
import { useEffect, useState } from "react";
import useGoalStore from "../../../store/goalStore";
import useWorkspaceStore from "../../../store/workspaceStore";
import useAuthStore from "../../../store/authStore";
import useSocketStore from "../../../store/socketStore";

const STATUS_COLORS = {
  NOT_STARTED: "bg-slate-100 text-slate-500",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function GoalsPage() {
  const { goals, loading, fetchGoals, createGoal, updateGoal, deleteGoal, fetchGoal, createMilestone, updateMilestone, postActivity } = useGoalStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { emitCollaboration } = useSocketStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", status: "NOT_STARTED" });
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [activityMsg, setActivityMsg] = useState("");
  
  // Real-time Collaboration State
  const [activeEditors, setActiveEditors] = useState({});

  useEffect(() => {
    if (currentWorkspace) fetchGoals(currentWorkspace.id);
  }, [currentWorkspace, fetchGoals]);

  useEffect(() => {
    const handleCollab = (e) => {
      const { userId, userName, type, goalId } = e.detail;
      if (userId === user?.id) return;
      
      setActiveEditors(prev => {
        const next = { ...prev };
        if (type === 'typing') {
          next[goalId] = { userName, timestamp: Date.now() };
        } else if (type === 'stopped') {
          delete next[goalId];
        }
        return next;
      });
    };

    window.addEventListener('socket-collaboration', handleCollab);
    const interval = setInterval(() => {
      setActiveEditors(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(gid => {
          if (Date.now() - next[gid].timestamp > 3000) {
            delete next[gid];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      window.removeEventListener('socket-collaboration', handleCollab);
      clearInterval(interval);
    };
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createGoal(currentWorkspace.id, form);
    setForm({ title: "", description: "", dueDate: "", status: "NOT_STARTED" });
    setShowCreate(false);
  };

  const handleStatusChange = async (goalId, status) => {
    await updateGoal(currentWorkspace.id, goalId, { status });
  };

  const openGoalDetail = async (goalId) => {
    const goal = await fetchGoal(currentWorkspace.id, goalId);
    setSelectedGoal(goal);
  };

  const handleAddMilestone = async () => {
    if (!milestoneTitle.trim() || !selectedGoal) return;
    await createMilestone(currentWorkspace.id, selectedGoal.id, { title: milestoneTitle });
    setMilestoneTitle("");
    const g = await fetchGoal(currentWorkspace.id, selectedGoal.id);
    setSelectedGoal(g);
  };

  const handleToggleMilestone = async (ms) => {
    await updateMilestone(currentWorkspace.id, selectedGoal.id, ms.id, { completed: !ms.completed, progressPercent: ms.completed ? 0 : 100 });
    const g = await fetchGoal(currentWorkspace.id, selectedGoal.id);
    setSelectedGoal(g);
  };

  const handlePostActivity = async () => {
    if (!activityMsg.trim() || !selectedGoal) return;
    await postActivity(currentWorkspace.id, selectedGoal.id, activityMsg);
    setActivityMsg("");
    const g = await fetchGoal(currentWorkspace.id, selectedGoal.id);
    setSelectedGoal(g);
    emitCollaboration(currentWorkspace.id, { type: 'stopped', goalId: selectedGoal.id });
  };

  const handleTyping = (val) => {
    setActivityMsg(val);
    if (selectedGoal) {
      emitCollaboration(currentWorkspace.id, { 
        type: 'typing', 
        goalId: selectedGoal.id,
        userName: user?.name
      });
    }
  };

  if (!currentWorkspace) return <p className="text-slate-500 font-medium text-center py-12">Select a workspace first.</p>;

  if (selectedGoal) {
    const milestones = selectedGoal.milestones || [];
    const completedMs = milestones.filter(m => m.completed).length;
    const progress = milestones.length > 0 ? Math.round((completedMs / milestones.length) * 100) : 0;
    const editor = activeEditors[selectedGoal.id];

    return (
      <div className="animate-fade-in space-y-6">
        <button onClick={() => setSelectedGoal(null)} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1 transition-colors">
          <span className="text-lg">←</span> Back to Goals
        </button>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm transition-all">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{selectedGoal.title}</h1>
              {selectedGoal.description && <p className="text-slate-500 mt-2 text-lg font-medium">{selectedGoal.description}</p>}
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${STATUS_COLORS[selectedGoal.status]}`}>{selectedGoal.status.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-400 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                {selectedGoal.owner?.name?.[0]?.toUpperCase()}
              </div>
              <span>{selectedGoal.owner?.name}</span>
            </div>
            {selectedGoal.dueDate && <span className="flex items-center gap-1.5">📅 {new Date(selectedGoal.dueDate).toLocaleDateString()}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm h-fit transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Milestones</h2>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{progress}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-8 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="space-y-3 mb-8">
              {milestones.length === 0 ? (
                <p className="text-slate-400 text-sm font-medium italic">No milestones defined yet.</p>
              ) : milestones.map(ms => (
                <div key={ms.id} className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                  <button onClick={() => handleToggleMilestone(ms)} 
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs transition-all ${ms.completed ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20' : 'border-slate-200 bg-white group-hover:border-blue-400'}`}>
                    {ms.completed && "✓"}
                  </button>
                  <span className={`text-sm font-semibold transition-all ${ms.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{ms.title}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} placeholder="Add a milestone..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                onKeyDown={e => e.key === 'Enter' && handleAddMilestone()} />
              <button onClick={handleAddMilestone} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">Add</button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Activity Feed</h2>
              {editor && (
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg animate-pulse uppercase tracking-widest">
                  ✍️ {editor.userName} is typing...
                </span>
              )}
            </div>
            <div className="flex gap-2 mb-8">
              <input value={activityMsg} onChange={e => handleTyping(e.target.value)} placeholder="Share a progress update..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                onKeyDown={e => e.key === 'Enter' && handlePostActivity()} />
              <button onClick={handlePostActivity} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">Post</button>
            </div>
            <div className="space-y-6 relative before:absolute before:left-[14px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {(selectedGoal.activities || []).map(act => (
                <div key={act.id} className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0 shadow-sm z-10">
                    {act.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm text-slate-700 font-bold leading-snug">{act.message}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Goals</h1>
          <p className="text-slate-500 font-semibold mt-1">Track team objectives and milestones</p>
        </div>
        <button id="create-goal-btn" onClick={() => setShowCreate(!showCreate)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center gap-2">
          <span className="text-lg">+</span> New Goal
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border-2 border-blue-100 rounded-2xl p-8 space-y-5 animate-slide-in shadow-2xl shadow-blue-500/5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Set a New Objective</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Goal Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="What are we aiming for?" required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Add some context..." rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Initial Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all">
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">Create Goal</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching Goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-blue-500/5 transition-all animate-fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-500">
              🎯
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">No goals defined</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-xs mx-auto leading-relaxed mb-10">
            Every great achievement starts with a single target. Ready to set yours?
          </p>
          <button 
            onClick={() => setShowCreate(true)}
            className="px-8 py-3.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-50 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const msDone = (goal.milestones || []).filter(m => m.completed).length;
            const msTotal = (goal.milestones || []).length;
            const progress = msTotal > 0 ? Math.round((msDone / msTotal) * 100) : 0;
            return (
              <div key={goal.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group flex flex-col"
                onClick={() => openGoalDetail(goal.id)}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{goal.title}</h3>
                  <div className="flex items-center gap-2">
                    <select onClick={e => e.stopPropagation()} value={goal.status}
                      onChange={e => handleStatusChange(goal.id, e.target.value)}
                      className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-wider border-0 cursor-pointer focus:outline-none shadow-sm ${STATUS_COLORS[goal.status]}`}>
                      <option value="NOT_STARTED">NOT STARTED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete this goal?')) deleteGoal(currentWorkspace.id, goal.id); }}
                      className="text-slate-300 hover:text-red-500 text-xs p-1 transition-colors">✕</button>
                  </div>
                </div>
                {goal.description && <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 flex-1">{goal.description}</p>}
                <div className="space-y-4 mt-auto">
                  {msTotal > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-[10px] text-blue-600 font-black">
                        {goal.owner?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">{goal.owner?.name}</span>
                    </div>
                    {goal.dueDate && <span className="text-[11px] font-bold text-slate-400">📅 {new Date(goal.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
