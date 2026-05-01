import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    set({ user: res.data.user, loading: false });
    return res.data;
  },

  login: async (data) => {
    const res = await api.post('/auth/login', data);
    set({ user: res.data.user, loading: false });
    return res.data;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    set({ user: null, loading: false });
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  updateProfile: async (formData) => {
    const res = await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    set({ user: res.data.user });
    return res.data;
  },
}));

export default useAuthStore;
