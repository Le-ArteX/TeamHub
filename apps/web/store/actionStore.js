import { create } from 'zustand';
import api from '../lib/api';

const useActionStore = create((set) => ({
  items: [],
  loading: false,

  fetchActions: async (workspaceId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/workspaces/${workspaceId}/actions`);
      set({ items: res.data.items, loading: false });
    } catch { set({ loading: false }); }
  },

  createAction: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/actions`, data);
    set((s) => ({ items: [res.data.item, ...s.items] }));
    return res.data.item;
  },

  // Optimistic UI
  updateAction: async (workspaceId, itemId, data) => {
    set((s) => ({ items: s.items.map(i => i.id === itemId ? { ...i, ...data } : i) }));
    try {
      const res = await api.put(`/workspaces/${workspaceId}/actions/${itemId}`, data);
      set((s) => ({ items: s.items.map(i => i.id === itemId ? res.data.item : i) }));
      return res.data.item;
    } catch (error) {
      const res = await api.get(`/workspaces/${workspaceId}/actions`);
      set({ items: res.data.items });
      throw error;
    }
  },

  deleteAction: async (workspaceId, itemId) => {
    set((s) => ({ items: s.items.filter(i => i.id !== itemId) }));
    try {
      await api.delete(`/workspaces/${workspaceId}/actions/${itemId}`);
    } catch (error) {
      const res = await api.get(`/workspaces/${workspaceId}/actions`);
      set({ items: res.data.items });
      throw error;
    }
  },
}));

export default useActionStore;
