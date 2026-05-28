import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : '';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (token) => {
  const s = getSocket();
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const joinTripRoom = (tripId) => {
  const s = getSocket();
  if (s.connected && tripId) {
    s.emit('join_trip', tripId);
  }
};

export const leaveTripRoom = (tripId) => {
  const s = getSocket();
  if (s.connected && tripId) {
    s.emit('leave_trip', tripId);
  }
};

export const joinRiderRoom = (riderId) => {
  const s = getSocket();
  if (s.connected && riderId) {
    s.emit('join_rider', riderId);
  }
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  if (s.connected && userId) {
    s.emit('join_user', userId);
  }
};

export const emitRiderLocation = (riderId, coordinates) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('rider_location_update', { riderId, coordinates });
  }
};
