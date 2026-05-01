import { create } from 'zustand';
import api from '../lib/api';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  loading: false,

  fetchWorkspaces: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/workspaces');
      set({ workspaces: res.data.workspaces, loading: false });
    } catch { set({ loading: false }); }
  },

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  createWorkspace: async (data) => {
    const res = await api.post('/workspaces', data);
    set((s) => ({ workspaces: [res.data.workspace, ...s.workspaces], currentWorkspace: res.data.workspace }));
    return res.data.workspace;
  },

  updateWorkspace: async (id, data) => {
    const res = await api.put(`/workspaces/${id}`, data);
    set((s) => ({
      workspaces: s.workspaces.map(w => w.id === id ? res.data.workspace : w),
      currentWorkspace: s.currentWorkspace?.id === id ? res.data.workspace : s.currentWorkspace,
    }));
    return res.data.workspace;
  },

  deleteWorkspace: async (id) => {
    await api.delete(`/workspaces/${id}`);
    set((s) => ({
      workspaces: s.workspaces.filter(w => w.id !== id),
      currentWorkspace: s.currentWorkspace?.id === id ? null : s.currentWorkspace,
    }));
  },

  inviteMember: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/invite`, data);
    return res.data.member;
  },

  updateMemberRole: async (workspaceId, memberId, role) => {
    const res = await api.put(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });
    return res.data.member;
  },

  removeMember: async (workspaceId, memberId) => {
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
}));

export default useWorkspaceStore;
