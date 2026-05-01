import { create } from 'zustand';
import api from '../lib/api';

const useGoalStore = create((set) => ({
  goals: [],
  currentGoal: null,
  loading: false,

  fetchGoals: async (workspaceId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/workspaces/${workspaceId}/goals`);
      set({ goals: res.data.goals, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchGoal: async (workspaceId, goalId) => {
    const res = await api.get(`/workspaces/${workspaceId}/goals/${goalId}`);
    set({ currentGoal: res.data.goal });
    return res.data.goal;
  },

  createGoal: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/goals`, data);
    set((s) => ({ goals: [res.data.goal, ...s.goals] }));
    return res.data.goal;
  },

  // Optimistic UI: update locally first then sync
  updateGoal: async (workspaceId, goalId, data) => {
    // Optimistic update
    set((s) => ({ goals: s.goals.map(g => g.id === goalId ? { ...g, ...data } : g) }));
    try {
      const res = await api.put(`/workspaces/${workspaceId}/goals/${goalId}`, data);
      set((s) => ({ goals: s.goals.map(g => g.id === goalId ? res.data.goal : g) }));
      return res.data.goal;
    } catch (error) {
      // Rollback: re-fetch
      const res = await api.get(`/workspaces/${workspaceId}/goals`);
      set({ goals: res.data.goals });
      throw error;
    }
  },

  deleteGoal: async (workspaceId, goalId) => {
    set((s) => ({ goals: s.goals.filter(g => g.id !== goalId) }));
    try {
      await api.delete(`/workspaces/${workspaceId}/goals/${goalId}`);
    } catch (error) {
      const res = await api.get(`/workspaces/${workspaceId}/goals`);
      set({ goals: res.data.goals });
      throw error;
    }
  },

  createMilestone: async (workspaceId, goalId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/goals/${goalId}/milestones`, data);
    return res.data.milestone;
  },

  updateMilestone: async (workspaceId, goalId, milestoneId, data) => {
    const res = await api.put(`/workspaces/${workspaceId}/goals/${goalId}/milestones/${milestoneId}`, data);
    return res.data.milestone;
  },

  deleteMilestone: async (workspaceId, goalId, milestoneId) => {
    await api.delete(`/workspaces/${workspaceId}/goals/${goalId}/milestones/${milestoneId}`);
  },

  postActivity: async (workspaceId, goalId, message) => {
    const res = await api.post(`/workspaces/${workspaceId}/goals/${goalId}/activity`, { message });
    return res.data.activity;
  },
}));

export default useGoalStore;
