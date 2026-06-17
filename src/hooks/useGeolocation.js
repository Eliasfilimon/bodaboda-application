import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Real-time GPS tracking hook for riders
 * Tracks location and sends updates to backend via API/MQTT
 */
export const useGeolocation = ({ enabled, onLocationUpdate, interval = 5000 }) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Get current position (one-time)
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString(),
          };
          setPosition(location);
          setError(null);
          resolve(location);
        },
        (err) => {
          setError(err.message);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  // Start watching position
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setLoading(true);

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: new Date().toISOString(),
        };
        setPosition(location);
        setError(null);
        setLoading(false);

        // Call the update callback
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        console.error('[GPS] Error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Also send updates at regular intervals as backup
    intervalRef.current = setInterval(() => {
      if (position && onLocationUpdate) {
        onLocationUpdate(position);
      }
    }, interval);
  }, [onLocationUpdate, interval, position]);

  // Stop watching
  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop based on enabled prop
  useEffect(() => {
    if (enabled) {
      getCurrentPosition().then(() => {
        startWatching();
      }).catch((err) => {
        console.error('[GPS] Failed to get initial position:', err);
      });
    } else {
      stopWatching();
    }

    return () => {
      stopWatching();
    };
  }, [enabled, getCurrentPosition, startWatching, stopWatching]);

  return {
    position,
    error,
    loading,
    getCurrentPosition,
    startWatching,
    stopWatching,
  };
};

export default useGeolocation;
