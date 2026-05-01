"use client";
import { useEffect, useState } from "react";
import useAnnouncementStore from "../../../store/announcementStore";
import useWorkspaceStore from "../../../store/workspaceStore";
import useAuthStore from "../../../store/authStore";
import Link from "next/link";

const EMOJIS = ["👍", "🎉", "❤️", "🚀", "👀", "💯"];

export default function AnnouncementsPage() {
  const { announcements, loading, fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, toggleReaction, addComment, fetchAnnouncement, currentAnnouncement } = useAnnouncementStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", pinned: false });
  const [selectedId, setSelectedId] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (currentWorkspace) fetchAnnouncements(currentWorkspace.id);
  }, [currentWorkspace, fetchAnnouncements]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    await createAnnouncement(currentWorkspace.id, form);
    setForm({ title: "", content: "", pinned: false });
    setShowCreate(false);
  };

  const handleReaction = async (announcementId, emoji) => {
    await toggleReaction(currentWorkspace.id, announcementId, emoji);
    fetchAnnouncements(currentWorkspace.id);
  };

  const openDetail = async (id) => {
    await fetchAnnouncement(currentWorkspace.id, id);
    setSelectedId(id);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    // Detect @mentions
    const mentionRegex = /@(\w+)/g;
    let match;
    const mentionNames = [];
    while ((match = mentionRegex.exec(commentText)) !== null) mentionNames.push(match[1]);
    const mentionIds = currentWorkspace.members?.filter(m => mentionNames.includes(m.user.name.split(' ')[0])).map(m => m.user.id) || [];
    await addComment(currentWorkspace.id, selectedId, commentText, mentionIds);
    setCommentText("");
    await fetchAnnouncement(currentWorkspace.id, selectedId);
  };

  if (!currentWorkspace) return <p className="text-slate-500 font-medium text-center py-12">Select a workspace first.</p>;

  // Detail View
  if (selectedId && currentAnnouncement) {
    return (
      <div className="animate-fade-in space-y-6">
        <button onClick={() => setSelectedId(null)} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1 transition-colors">
          <span className="text-lg">←</span> Back to Feed
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm transition-all">
          <div className="flex items-start justify-between mb-6">
            <div>
              {currentAnnouncement.pinned && (
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-amber-100 mb-3">
                  📌 Pinned Update
                </span>
              )}
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{currentAnnouncement.title}</h1>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(currentAnnouncement.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-400 font-black">
              {currentAnnouncement.author?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{currentAnnouncement.author?.name}</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Announcement Author</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: currentAnnouncement.content }} />

          {/* Reactions */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-50">
            {EMOJIS.map(emoji => {
              const count = (currentAnnouncement.reactions || []).filter(r => r.emoji === emoji).length;
              const reacted = (currentAnnouncement.reactions || []).some(r => r.emoji === emoji && r.userId === user?.id);
              return (
                <button key={emoji} onClick={() => handleReaction(currentAnnouncement.id, emoji)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${reacted ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 text-slate-600 dark:text-slate-400'}`}>
                  <span>{emoji}</span> 
                  {count > 0 && <span className="text-xs">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm transition-all">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">Comments & Discussion</h2>
          
          <div className="space-y-6 mb-8 relative before:absolute before:left-[14px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
            {(currentAnnouncement.comments || []).length === 0 ? (
              <p className="text-slate-400 text-sm font-medium italic pl-8">No comments yet. Start the conversation!</p>
            ) : (currentAnnouncement.comments || []).map(c => (
              <div key={c.id} className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0 shadow-sm z-10">
                  {c.author?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-slate-900">{c.author?.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-6 border-t border-slate-50 dark:border-slate-800">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Type a message... (use @name to mention)"
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              onKeyDown={e => e.key === 'Enter' && handleComment()} />
            <button onClick={handleComment} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">Send</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Announcements</h1>
          <p className="text-slate-500 font-semibold mt-1">Workspace-wide updates and discussions</p>
        </div>
        <button id="create-announcement-btn" onClick={() => setShowCreate(!showCreate)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center gap-2">
          <span className="text-lg">+</span> New Announcement
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl p-8 space-y-5 animate-slide-in shadow-2xl shadow-blue-500/5 transition-all">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Post an Update</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Subject</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="What's happening?" required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Content</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Tell the team more..." rows={5} required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.pinned ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-amber-400'}`}>
                {form.pinned && <span className="text-white text-[10px]">📌</span>}
              </div>
              <input type="checkbox" checked={form.pinned} onChange={e => setForm({...form, pinned: e.target.checked})} className="hidden" />
              Pin to workspace top
            </label>
            <div className="flex gap-3">
              <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">Publish Update</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching updates...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl transition-all">
          <div className="text-5xl mb-4">📢</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No announcements yet</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Share your first update with the team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {announcements.map(a => (
            <div key={a.id} onClick={() => openDetail(a.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 ${a.pinned ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500 shadow-lg shadow-amber-500/10' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                  {a.pinned ? "📌" : "📢"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight mb-1">{a.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="text-slate-600">{a.author?.name}</span>
                    <span>•</span>
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:pl-4">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 font-bold text-xs transition-all">
                  <span>💬</span> {a._count?.comments || 0}
                </div>
                {(a.reactions || []).length > 0 && (
                  <div className="flex -space-x-1.5">
                    {[...new Set(a.reactions.map(r => r.emoji))].slice(0, 3).map(e => (
                      <span key={e} className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-xs shadow-sm transition-all">{e}</span>
                    ))}
                  </div>
                )}
                <button onClick={e => { e.stopPropagation(); if(confirm('Delete this announcement?')) deleteAnnouncement(currentWorkspace.id, a.id); }}
                  className="text-slate-300 hover:text-red-500 text-xs p-2 transition-colors ml-2">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
