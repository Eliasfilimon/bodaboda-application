import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket, joinRiderRoom, joinTripRoom, joinUserRoom } from '../utils/socket';
import { useAuth } from '../context/AuthContext';

export const useSocket = ({ tripId, onTripUpdate, onRiderLocation, onNewTrip } = {}) => {
  const { token, user, rider, userType } = useAuth();
  const listenersRef = useRef({});

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    if (user && userType === 'user') joinUserRoom(user.id);
    if (rider && userType === 'rider') joinRiderRoom(rider.id);
    if (tripId) joinTripRoom(tripId);

    const handleTripUpdate = (data) => {
      if (onTripUpdate) onTripUpdate(data);
    };

    const handleRiderLocation = (data) => {
      if (onRiderLocation) onRiderLocation(data);
    };

    const handleNewTrip = (data) => {
      if (onNewTrip) onNewTrip(data);
    };

    socket.on('trip_status_update', handleTripUpdate);
    socket.on('rider_location_update', handleRiderLocation);
    socket.on('new_trip_request', handleNewTrip);

    listenersRef.current = { handleTripUpdate, handleRiderLocation, handleNewTrip };

    return () => {
      socket.off('trip_status_update', handleTripUpdate);
      socket.off('rider_location_update', handleRiderLocation);
      socket.off('new_trip_request', handleNewTrip);
    };
  }, [token, tripId, user, rider, userType, onTripUpdate, onRiderLocation, onNewTrip]);

  return getSocket;
};
