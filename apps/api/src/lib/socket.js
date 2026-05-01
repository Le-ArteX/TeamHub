const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authenticate socket connections via token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join workspace rooms
    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      // Broadcast online status
      socket.to(`workspace:${workspaceId}`).emit('user-online', {
        userId: socket.userId,
      });
    });

    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      socket.to(`workspace:${workspaceId}`).emit('user-offline', {
        userId: socket.userId,
      });
    });

    socket.on('collaboration-event', (data) => {
      const { workspaceId, type, goalId, userName } = data;
      socket.to(`workspace:${workspaceId}`).emit('collaboration-update', {
        userId: socket.userId,
        userName,
        type, // 'typing', 'editing', 'stopped'
        goalId
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };
