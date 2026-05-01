"use client";
import { useState, useEffect } from "react";
import useWorkspaceStore from "../../../store/workspaceStore";
import useAuthStore from "../../../store/authStore";
import api from "../../../lib/api";

export default function SettingsPage() {
  const { currentWorkspace, updateWorkspace, inviteMember, updateMemberRole, removeMember, createWorkspace, deleteWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { user, updateProfile, logout } = useAuthStore();
  const [tab, setTab] = useState("workspace");
  const [wsForm, setWsForm] = useState({ name: currentWorkspace?.name || "", description: currentWorkspace?.description || "", accentColor: currentWorkspace?.accentColor || "#3b82f6" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [profileName, setProfileName] = useState(user?.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [newWsName, setNewWsName] = useState("");
  const [msg, setMsg] = useState("");
  
  // Audit Logs
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (tab === "audit" && currentWorkspace) {
      fetchLogs();
    }
  }, [tab, currentWorkspace]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get(`/workspaces/${currentWorkspace.id}/audit-logs`);
      setLogs(res.data.logs);
    } catch (err) { console.error("Logs failed", err); }
    setLoadingLogs(false);
  };

  const handleWsUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateWorkspace(currentWorkspace.id, wsForm);
      setMsg("Workspace updated!");
      setTimeout(() => setMsg(""), 3000);
    } catch { setMsg("Failed to update"); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await inviteMember(currentWorkspace.id, { email: inviteEmail, role: inviteRole });
      setInviteEmail("");
      setMsg("Member invited!");
      await fetchWorkspaces();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) { setMsg(err.response?.data?.error || "Failed to invite"); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", profileName);
    if (avatarFile) formData.append("avatar", avatarFile);
    try {
      await updateProfile(formData);
      setMsg("Profile updated!");
      setTimeout(() => setMsg(""), 3000);
    } catch { setMsg("Failed to update profile"); }
  };

  const handleCreateWs = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    await createWorkspace({ name: newWsName });
    setNewWsName("");
  };

  const tabs = [
    { id: "workspace", label: "⚙️ Workspace" },
    { id: "members", label: "👥 Members" },
    { id: "audit", label: "📜 Audit Log" },
    { id: "profile", label: "👤 Profile" },
    { id: "workspaces", label: "📂 Workspaces" },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-semibold mt-1">Manage your team and personal preferences</p>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-xl text-sm font-bold animate-slide-in flex items-center gap-2 shadow-sm">
          <span className="text-base">✨</span> {msg}
        </div>
      )}

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit overflow-x-auto max-w-full">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${tab === t.id ? "bg-white dark:bg-slate-900 text-blue-600 shadow-lg shadow-blue-500/5" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Workspace Settings */}
      {tab === "workspace" && currentWorkspace && (
        <form onSubmit={handleWsUpdate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm transition-all">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Workspace Identity</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Workspace Name</label>
            <input value={wsForm.name} onChange={e => setWsForm({...wsForm, name: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Description</label>
            <textarea value={wsForm.description} onChange={e => setWsForm({...wsForm, description: e.target.value})} rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Brand Accent Color</label>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <input type="color" value={wsForm.accentColor} onChange={e => setWsForm({...wsForm, accentColor: e.target.value})} 
                className="w-12 h-12 rounded-lg border-0 bg-transparent cursor-pointer overflow-hidden" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{wsForm.accentColor.toUpperCase()}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Primary workspace color</p>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/10">Save Changes</button>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
            <button type="button" onClick={() => { if (confirm("Delete this workspace forever?")) deleteWorkspace(currentWorkspace.id); }}
              className="px-6 py-2.5 text-red-500 border-2 border-red-100 dark:border-red-900/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete Workspace</button>
          </div>
        </form>

      )}

      {/* Members */}
      {tab === "members" && currentWorkspace && (
        <div className="space-y-6">
          <form onSubmit={handleInvite} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm transition-all">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Invite New Member</h2>
            <div className="flex gap-3">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="name@company.com" type="email" required
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none cursor-pointer">
                <option value="MEMBER">Member</option><option value="ADMIN">Admin</option>
              </select>
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">Invite</button>
            </div>
          </form>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Workspace Members</h2>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-widest">{currentWorkspace.members?.length || 0} Total</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {currentWorkspace.members?.map(m => (
                <div key={m.id} className="flex items-center gap-4 py-4 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-black shadow-sm group-hover:scale-110 transition-transform">
                    {m.user.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white font-bold">{m.user.name} {m.user.id === user?.id && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded ml-1 tracking-wider uppercase">You</span>}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{m.user.email}</p>
                  </div>
                  <select value={m.role} onChange={e => updateMemberRole(currentWorkspace.id, m.id, e.target.value)}
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg focus:outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <option value="MEMBER">MEMBER</option><option value="ADMIN">ADMIN</option>
                  </select>
                  {m.user.id !== user?.id && (
                    <button onClick={() => removeMember(currentWorkspace.id, m.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-2">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Audit Log */}
      {tab === "audit" && currentWorkspace && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Workspace Activity Log</h2>
            <button onClick={fetchLogs} className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">Refresh</button>
          </div>
          
          {loadingLogs ? (
            <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Loading Logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium italic">No activity recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-900 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shadow-sm shrink-0">
                    {log.action.includes('POST') ? '➕' : log.action.includes('PUT') ? '📝' : '🗑️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        <span className="text-blue-600 dark:text-blue-400">{log.user?.name}</span> {log.action.toLowerCase().replace('_', ' ')} <span className="text-slate-500 dark:text-slate-400 font-black uppercase text-[10px]">{log.entityType}</span>
                      </p>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    {log.details && (
                      <pre className="mt-2 p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 overflow-x-auto border border-slate-100 dark:border-slate-700">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      )}

      {/* Profile */}
      {tab === "profile" && (
        <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 max-w-2xl shadow-sm transition-all">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Your Profile</h2>
          <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/20">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Avatar</p>
              <label className="text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
                Change Photo
                <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} className="hidden" />
              </label>
              {avatarFile && <p className="text-[10px] font-bold text-green-500 mt-2 uppercase tracking-widest">✓ {avatarFile.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Display Name</label>
              <input value={profileName} onChange={e => setProfileName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <input value={user?.email} disabled className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-bold" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="submit" className="px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/10">Update Profile</button>
            <button type="button" onClick={logout} className="px-6 py-3 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">Sign Out</button>
          </div>
        </form>

      )}

      {/* Workspaces */}
      {tab === "workspaces" && (
        <div className="space-y-6">
          <form onSubmit={handleCreateWs} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-sm transition-all">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Create New Workspace</h2>
            <div className="flex gap-3">
              <input value={newWsName} onChange={e => setNewWsName(e.target.value)} placeholder="Ex: Marketing Team" required
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">Create</button>
            </div>
          </form>

        </div>
      )}
    </div>
  );
}
