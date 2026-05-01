import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000').replace(/\/$/, '');

const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  notifications: [],

  connect: (token) => {
    if (get().socket) return;
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on('connect', () => console.log('Socket connected'));
    socket.on('user-online', ({ userId }) => {
      set((s) => ({ onlineUsers: [...new Set([...s.onlineUsers, userId])] }));
    });
    socket.on('user-offline', ({ userId }) => {
      set((s) => ({ onlineUsers: s.onlineUsers.filter(id => id !== userId) }));
    });
    socket.on('mention-notification', (data) => {
      set((s) => ({ notifications: [data, ...s.notifications] }));
    });

    socket.on('collaboration-update', (data) => {
      // Broadcast events for other components to listen to
      window.dispatchEvent(new CustomEvent('socket-collaboration', { detail: data }));
    });

    set({ socket });
  },

  emitCollaboration: (workspaceId, data) => {
    get().socket?.emit('collaboration-event', { workspaceId, ...data });
  },

  joinWorkspace: (workspaceId) => {
    get().socket?.emit('join-workspace', workspaceId);
  },

  leaveWorkspace: (workspaceId) => {
    get().socket?.emit('leave-workspace', workspaceId);
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, onlineUsers: [] });
  },

  clearNotification: (index) => {
    set((s) => ({ notifications: s.notifications.filter((_, i) => i !== index) }));
  },
}));

export default useSocketStore;
