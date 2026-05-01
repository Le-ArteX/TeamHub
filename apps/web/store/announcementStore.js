import { create } from 'zustand';
import api from '../lib/api';

const useAnnouncementStore = create((set) => ({
  announcements: [],
  currentAnnouncement: null,
  loading: false,

  fetchAnnouncements: async (workspaceId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/workspaces/${workspaceId}/announcements`);
      set({ announcements: res.data.announcements, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchAnnouncement: async (workspaceId, id) => {
    const res = await api.get(`/workspaces/${workspaceId}/announcements/${id}`);
    set({ currentAnnouncement: res.data.announcement });
    return res.data.announcement;
  },

  createAnnouncement: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/announcements`, data);
    set((s) => ({ announcements: [res.data.announcement, ...s.announcements] }));
    return res.data.announcement;
  },

  updateAnnouncement: async (workspaceId, id, data) => {
    const res = await api.put(`/workspaces/${workspaceId}/announcements/${id}`, data);
    set((s) => ({ announcements: s.announcements.map(a => a.id === id ? res.data.announcement : a) }));
    return res.data.announcement;
  },

  deleteAnnouncement: async (workspaceId, id) => {
    set((s) => ({ announcements: s.announcements.filter(a => a.id !== id) }));
    await api.delete(`/workspaces/${workspaceId}/announcements/${id}`);
  },

  toggleReaction: async (workspaceId, announcementId, emoji) => {
    await api.post(`/workspaces/${workspaceId}/announcements/${announcementId}/reactions`, { emoji });
  },

  addComment: async (workspaceId, announcementId, content, mentionIds) => {
    const res = await api.post(`/workspaces/${workspaceId}/announcements/${announcementId}/comments`, { content, mentionIds });
    return res.data.comment;
  },
}));

export default useAnnouncementStore;
