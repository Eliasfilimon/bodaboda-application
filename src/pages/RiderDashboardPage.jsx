import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import mqtt from 'mqtt';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaMotorcycle, FaPhone } from 'react-icons/fa';


import 'leaflet/dist/leaflet.css';
import { HiOutlineClock, HiOutlineStar, HiOutlinePaperAirplane, HiOutlineMapPin, HiOutlineBars3, HiOutlineArrowRightOnRectangle, HiOutlineMap } from 'react-icons/hi2';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MQTT_WS = import.meta.env.VITE_MQTT_WS || 'ws://localhost:9010';
const TRIP_STATUS = { IDLE: 'idle', REQUEST: 'request', ACCEPTED: 'accepted', STARTED: 'started' };

// Component to recenter map
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export function RiderDashboardPage() {
  const navigate = useNavigate();
  const { rider, token, logout } = useAuth();
  const mqttRef = useRef(null);

  const [online, setOnline]                 = useState(false);
  const [tripState, setTripState]           = useState(TRIP_STATUS.IDLE);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [activeTrip, setActiveTrip]         = useState(null);
  const [recentTrips, setRecentTrips]       = useState([]);
  const [earnings, setEarnings]             = useState({ today: 0, week: 0, total: 0 });
  const [tripCount, setTripCount]           = useState(0);
  const [mqttConnected, setMqttConnected]   = useState(false);
  const [toast, setToast]                   = useState(null);
  const [loading, setLoading]               = useState(false);
  const [gpsStatus, setGpsStatus]           = useState('off');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { if (!token) navigate('/rider-login'); }, [token, navigate]);

  const loadTrips = () => {
    if (!rider?.id) return;
    api.trips.getRiderTrips(rider.id)
      .then(data => {
        const trips = Array.isArray(data) ? data : [];
        setRecentTrips(trips.slice(0, 5));
        setTripCount(trips.length);
        const done = trips.filter(t => t.status === 'completed');
        const total = done.reduce((s, t) => s + parseFloat(t.fare || 0), 0);
        const todayStr = new Date().toDateString();
        const todayFare = done
          .filter(t => new Date(t.updatedAt || t.createdAt).toDateString() === todayStr)
          .reduce((s, t) => s + parseFloat(t.fare || 0), 0);
        setEarnings({ today: todayFare, week: total * 0.3, total });
      })
      .catch(() => {});
  };

  useEffect(() => { loadTrips(); }, [rider?.id]);

  useEffect(() => {
    if (!rider?.id) return; 
    
    const client = mqtt.connect(MQTT_WS, { 
      reconnectPeriod: 3000,
      connectTimeout: 5000,
    });
    mqttRef.current = client;
    
    client.on('connect', () => {
      setMqttConnected(true);
      client.subscribe('bodaboda/ride/request');
      client.subscribe(`bodaboda/rider/${rider?.id}/request`);
    });
    
    client.on('error', () => setMqttConnected(false));
    client.on('message', (_topic, payload) => {
      if (!online) return; 
      try {
        const data = JSON.parse(payload.toString());
        if (tripState === TRIP_STATUS.IDLE) {
          setCurrentRequest(data);
          setTripState(TRIP_STATUS.REQUEST);
        }
      } catch (e) {}
    });
    
    client.on('close', () => setMqttConnected(false));
    client.on('offline', () => setMqttConnected(false));
    return () => client.end();
  }, [rider?.id, online, tripState]);

  const publish = (topic, data) => mqttRef.current?.publish(topic, JSON.stringify(data));

  const handleLocationUpdate = useCallback(async (location) => {
    if (!rider?.id || !online) return;
    try {
      await api.riders.updateLocation(rider.id, {
        lat: location.lat,
        lng: location.lng,
        location: `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`,
      });
      mqttRef.current?.publish('bodaboda/driver/location', JSON.stringify({
        driver_id: rider.id,
        driver_name: rider.name,
        lat: location.lat,
        lng: location.lng,
        timestamp: location.timestamp,
      }));
      setGpsStatus('active');
    } catch (err) {}
  }, [rider?.id, rider?.name, online]);

  const { position, error: gpsError, loading: gpsLoading } = useGeolocation({
    enabled: online,
    onLocationUpdate: handleLocationUpdate,
    interval: 5000,
  });

  useEffect(() => {
    if (gpsError) setGpsStatus('error');
    else if (gpsLoading) setGpsStatus('searching');
    else if (position) setGpsStatus('active');
    else if (!online) setGpsStatus('off');
  }, [position, gpsError, gpsLoading, online]);

  const handleToggleOnline = async () => {
    if (!rider?.id) return;
    const newStatus = online ? 'offline' : 'online';
    
    if (!online && navigator.geolocation && gpsStatus === 'off') {
      setGpsStatus('searching');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await api.riders.updateLocation(rider.id, { lat: pos.coords.latitude, lng: pos.coords.longitude });
            await api.riders.updateStatus(rider.id, { status: 'online' });
            setOnline(true);
            setGpsStatus('active');
          } catch (err) {
            showToast('Failed to update location', 'warning');
          }
        },
        async (err) => {
          try {
            await api.riders.updateStatus(rider.id, { status: 'online' });
            setOnline(true);
            setGpsStatus('error');
          } catch (err) {}
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
      return;
    }
    
    try {
      await api.riders.updateStatus(rider.id, { status: newStatus });
      setOnline(!online);
      if (newStatus === 'offline') setGpsStatus('off');
    } catch (err) {}
  };

  const handleAccept = async () => {
    if (!currentRequest || loading) return;
    const tripId = currentRequest.tripId || currentRequest.id;
    setLoading(true);
    try {
      const trip = tripId
        ? await api.trips.accept(tripId, rider?.id)
        : { ...currentRequest, status: 'accepted', riderId: rider?.id };

      setActiveTrip({ ...currentRequest, ...trip, id: trip.id || tripId });
      setTripState(TRIP_STATUS.ACCEPTED);
      setCurrentRequest(null);
      publish('bodaboda/ride/status', { ...trip, event: 'accepted', riderId: rider?.id });
    } catch (err) {
      showToast('Could not accept ride.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!currentRequest || loading) return;
    const tripId = currentRequest.tripId || currentRequest.id;
    setLoading(true);
    try {
      if (tripId) await api.trips.decline(tripId, rider?.id);
      publish('bodaboda/ride/status', { tripId, event: 'declined', riderId: rider?.id });
    } catch (err) {
    } finally {
      setCurrentRequest(null);
      setTripState(TRIP_STATUS.IDLE);
      setLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (!activeTrip || loading) return;
    const tripId = activeTrip.id || activeTrip.tripId;
    setLoading(true);
    try {
      if (tripId) await api.trips.start(tripId);
      setActiveTrip(prev => ({ ...prev, status: 'in_progress' }));
      setTripState(TRIP_STATUS.STARTED);
      publish('bodaboda/ride/status', { tripId, event: 'started', riderId: rider?.id });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip || loading) return;
    const tripId = activeTrip.id || activeTrip.tripId;
    const fare = activeTrip?.fare || activeTrip?.estimatedFare || 2500;
    setLoading(true);
    try {
      const completed = tripId
        ? await api.trips.complete(tripId, rider?.id)
        : { ...activeTrip, status: 'completed', fare };

      publish('bodaboda/ride/status', { ...completed, event: 'completed', fare });
      
      setEarnings(prev => ({ ...prev, today: prev.today + parseFloat(fare) }));
      setActiveTrip(null);
      setTripState(TRIP_STATUS.IDLE);
      showToast(`Trip done! Collected TZS ${parseFloat(fare).toLocaleString()}`);
      setTimeout(loadTrips, 800);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/rider-login'); };
  const pCoords = position ? [position.lat, position.lng] : [-6.1722, 35.7395];

  return (
    <div className="h-screen flex flex-col bg-twende-background font-poppins relative overflow-hidden">
      
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={pCoords} zoom={15} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <RecenterMap lat={position?.lat} lng={position?.lng} />
          {position && <Marker position={pCoords} icon={riderIcon} />}
          {activeTrip?.pickupCoords && (
            <>
              <Marker position={[activeTrip.pickupCoords.lat, activeTrip.pickupCoords.lng]} icon={pickupIcon} />
              <Polyline positions={[pCoords, [activeTrip.pickupCoords.lat, activeTrip.pickupCoords.lng]]} color="#2563EB" weight={5} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Top Overlay UI */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
        {/* Earnings Pill */}
        <div className="bg-white rounded-full shadow-md px-4 py-2 flex items-center gap-2 pointer-events-auto border border-twende-border">
          <span className="text-twende-text-secondary text-sm font-bold">Today</span>
          <span className="text-twende-text font-black text-lg">TZS {Math.round(earnings.today).toLocaleString()}</span>
        </div>
        
        {/* Profile & Controls */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center border border-twende-border hover:bg-gray-50 text-twende-text">
            <HiOutlineBars3 className="text-xl" />
          </button>
          <button onClick={handleLogout} className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center border border-twende-border hover:bg-red-50 text-twende-error">
            <HiOutlineArrowRightOnRectangle className="text-xl" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet - Idle State */}
      {tripState === TRIP_STATUS.IDLE && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 px-6 flex flex-col items-center">
          <button onClick={handleToggleOnline}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center font-bold text-lg shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all transform hover:scale-105 active:scale-95 border-4 ${
              online ? 'bg-twende-success text-white border-white' : 'bg-white text-twende-text border-gray-100'
            }`}>
            {online ? 'GO OFFLINE' : 'GO ONLINE'}
          </button>
          {online && <p className="mt-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold text-twende-text shadow-sm border border-twende-border">Finding trips...</p>}
        </div>
      )}

      {/* Bottom Sheet - Incoming Request */}
      {tripState === TRIP_STATUS.REQUEST && currentRequest && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-6 max-w-lg mx-auto w-full pb-10 border-t border-twende-border animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-twende-primary uppercase tracking-wider mb-1">New Ride Request</p>
                <h2 className="text-2xl font-black text-twende-text">{currentRequest.passenger_name || 'Passenger'}</h2>
                <div className="flex items-center gap-1 text-sm font-bold text-twende-text mt-1">
                  <HiOutlineStar className="text-twende-accent fill-twende-accent" /> {currentRequest.rating || '4.8'}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-twende-text-secondary font-bold uppercase mb-1">Est. Fare</p>
                <p className="text-2xl font-black text-twende-text">TZS {(currentRequest.fare || 2500).toLocaleString()}</p>
              </div>
            </div>

            <div className="relative pl-8 mb-8 space-y-6">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
              <div className="relative">
                <div className="absolute -left-7 top-1 w-3 h-3 rounded-full bg-twende-text border-2 border-white"></div>
                <p className="text-xs font-bold text-twende-text-secondary uppercase mb-0.5">Pickup</p>
                <p className="font-semibold text-twende-text">{currentRequest.pickup_location || currentRequest.pickup}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-7 top-1 w-3 h-3 bg-twende-primary border-2 border-white"></div>
                <p className="text-xs font-bold text-twende-text-secondary uppercase mb-0.5">Drop-off</p>
                <p className="font-semibold text-twende-text">{currentRequest.destination || currentRequest.dropoff}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleDecline} disabled={loading} className="w-16 h-16 rounded-full bg-gray-100 text-twende-text-secondary font-bold hover:bg-gray-200 transition-colors flex items-center justify-center border border-twende-border flex-shrink-0">
                ✕
              </button>
              <button onClick={handleAccept} disabled={loading} className="flex-1 rounded-2xl bg-twende-success text-white font-bold text-xl hover:bg-twende-success-hover shadow-lg active:scale-[0.98] transition-all">
                {loading ? 'Accepting...' : 'Tap to Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet - Active Trip (Accepted / Started) */}
      {(tripState === TRIP_STATUS.ACCEPTED || tripState === TRIP_STATUS.STARTED) && activeTrip && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 max-w-lg mx-auto w-full pb-10 border-t border-twende-border">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-twende-text border border-twende-border">
                  {(activeTrip.passenger_name || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-twende-text">{activeTrip.passenger_name || 'Passenger'}</h2>
                  <p className="text-twende-text-secondary text-sm font-semibold">{tripState === TRIP_STATUS.ACCEPTED ? 'Waiting for you' : 'On trip'}</p>
                </div>
              </div>
              <a href={`tel:${activeTrip.passenger_phone || ''}`} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-twende-text hover:bg-gray-200 transition-colors border border-twende-border">
                <FaPhone className="text-lg" />
              </a>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-twende-border flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-twende-text-secondary uppercase mb-1">
                  {tripState === TRIP_STATUS.ACCEPTED ? 'Pickup Location' : 'Destination'}
                </p>
                <p className="font-semibold text-twende-text truncate max-w-[200px]">
                  {tripState === TRIP_STATUS.ACCEPTED ? (activeTrip.pickup_location || activeTrip.pickup) : (activeTrip.destination || activeTrip.dropoff)}
                </p>
              </div>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${
                  tripState === TRIP_STATUS.ACCEPTED 
                    ? `${activeTrip.pickupCoords?.lat || 0},${activeTrip.pickupCoords?.lng || 0}`
                    : `${activeTrip.dropoffCoords?.lat || 0},${activeTrip.dropoffCoords?.lng || 0}`
                }&travelmode=driving`}
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-twende-text text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-800 transition-colors"
              >
                <HiOutlinePaperAirplane />
              </a>
            </div>

            {tripState === TRIP_STATUS.ACCEPTED ? (
              <button onClick={handleStartTrip} disabled={loading} className="w-full py-4 rounded-xl bg-twende-success text-white font-bold text-lg hover:bg-twende-success-hover shadow-lg active:scale-[0.98] transition-all">
                {loading ? 'Starting...' : 'Start Trip'}
              </button>
            ) : (
              <button onClick={handleCompleteTrip} disabled={loading} className="w-full py-4 rounded-xl bg-twende-success text-white font-bold text-lg hover:bg-twende-success-hover shadow-lg active:scale-[0.98] transition-all flex justify-between px-6">
                <span>{loading ? 'Completing...' : 'Complete Trip'}</span>
                <span>TZS {(activeTrip.fare || 2500).toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 animate-[slideDown_0.3s_ease-out]">
          {toast.type === 'error' && '⚠️'}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
