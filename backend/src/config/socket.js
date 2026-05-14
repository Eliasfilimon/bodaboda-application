import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_trip', (tripId) => {
      socket.join(`trip:${tripId}`);
      console.log(`Socket ${socket.id} joined trip:${tripId}`);
    });

    socket.on('leave_trip', (tripId) => {
      socket.leave(`trip:${tripId}`);
      console.log(`Socket ${socket.id} left trip:${tripId}`);
    });

    socket.on('join_rider', (riderId) => {
      socket.join(`rider:${riderId}`);
      console.log(`Socket ${socket.id} joined rider:${riderId}`);
    });

    socket.on('join_user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user:${userId}`);
    });

    socket.on('rider_location_update', (data) => {
      const { riderId, coordinates } = data;
      io.to(`rider:${riderId}`).emit('rider_location_update', {
        riderId,
        coordinates
      });
    });

    socket.on('trip_status_update', (data) => {
      const { tripId, status } = data;
      io.to(`trip:${tripId}`).emit('trip_status_update', {
        tripId,
        status
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitTripStatusUpdate = (tripId, status, extra = {}) => {
  if (!io) return;
  io.to(`trip:${tripId}`).emit('trip_status_update', {
    tripId,
    status,
    ...extra,
  });
};

export const emitRiderLocationUpdate = (riderId, coordinates) => {
  if (!io) return;
  io.to(`rider:${riderId}`).emit('rider_location_update', {
    riderId,
    coordinates,
  });
};

