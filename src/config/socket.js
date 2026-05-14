import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const socketEvents = {
  joinTrip: (tripId) => {
    const sock = getSocket();
    sock.emit('join_trip', tripId);
  },

  leaveTrip: (tripId) => {
    const sock = getSocket();
    sock.emit('leave_trip', tripId);
  },

  joinRider: (riderId) => {
    const sock = getSocket();
    sock.emit('join_rider', riderId);
  },

  joinUser: (userId) => {
    const sock = getSocket();
    sock.emit('join_user', userId);
  },

  onRiderLocationUpdate: (callback) => {
    const sock = getSocket();
    sock.on('rider_location_update', callback);
  },

  onTripStatusUpdate: (callback) => {
    const sock = getSocket();
    sock.on('trip_status_update', callback);
  },

  offRiderLocationUpdate: () => {
    const sock = getSocket();
    sock.off('rider_location_update');
  },

  offTripStatusUpdate: () => {
    const sock = getSocket();
    sock.off('trip_status_update');
  }
};
