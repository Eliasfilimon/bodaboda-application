import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingTimeout: 60000,
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'boda-secret-key');
        socket.user = decoded;
      }
      next();
    } catch { next(); }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}${socket.user ? ` (${socket.user.type}:${socket.user.id})` : ''}`);
    if (socket.user) socket.join(`${socket.user.type}:${socket.user.id}`);

    socket.on('join_trip', (tripId) => socket.join(`trip:${tripId}`));
    socket.on('leave_trip', (tripId) => socket.leave(`trip:${tripId}`));
    socket.on('join_rider', (riderId) => socket.join(`rider:${riderId}`));
    socket.on('join_user', (userId) => socket.join(`user:${userId}`));

    socket.on('rider_location_update', ({ riderId, coordinates }) => {
      io.to(`rider:${riderId}`).emit('rider_location_update', { riderId, coordinates });
    });
    socket.on('trip_status_update', ({ tripId, status }) => {
      io.to(`trip:${tripId}`).emit('trip_status_update', { tripId, status });
    });
    socket.on('disconnect', () => console.log(`[socket] disconnected: ${socket.id}`));
  });

  return io;
};

export const getIO = () => { if (!io) throw new Error('Socket.io not initialized'); return io; };
export const emitTripStatusUpdate = (tripId, status, extra = {}) => { if (io) io.to(`trip:${tripId}`).emit('trip_status_update', { tripId, status, ...extra }); };
export const emitRiderLocationUpdate = (riderId, coordinates) => { if (io) io.to(`rider:${riderId}`).emit('rider_location_update', { riderId, coordinates }); };
export const emitNewTripRequest = (riderId, tripData) => { if (io) io.to(`rider:${riderId}`).emit('new_trip_request', tripData); };
