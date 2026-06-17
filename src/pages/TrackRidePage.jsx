import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import mqtt from 'mqtt';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api.js';
import { locationCoordinates } from '../data/mockData';
import { FaMotorcycle, FaPhone } from 'react-icons/fa';

import { HiOutlineArrowLeft, HiOutlineClock, HiOutlineCheckCircle, HiOutlineStar, HiOutlinePaperAirplane } from 'react-icons/hi2';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});



const MQTT_WS = import.meta.env.VITE_MQTT_WS || 'ws://localhost:9010';

export function TrackRidePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useAuth();
  const mqttRef = useRef(null);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mqttLive, setMqttLive] = useState(false);
  const [eta, setEta] = useState('~5 min');

  useEffect(() => {
    const tripId = searchParams.get('tripId') || localStorage.getItem('activeTripId');
    if (!tripId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false); return; }
    api.trips.get(tripId)
      .then(data => setTrip(data))
      .catch((e) => { console.error(e); })
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    const client = mqtt.connect(MQTT_WS, { reconnectPeriod: 3000 });
    mqttRef.current = client;
    client.on('connect', () => {
      setMqttLive(true);
      client.subscribe('bodaboda/ride/status');
    });
    client.on('message', (_topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        const currentId = trip?.id || searchParams.get('tripId') || localStorage.getItem('activeTripId');
        if (String(data.id) !== String(currentId) && String(data.tripId) !== String(currentId)) return;
        setTrip(prev => prev ? { ...prev, ...data } : data);
        
        if (data.event === 'accepted') setEta('~3 min');
        if (data.event === 'completed') {
          localStorage.removeItem('activeTripId');
          setTimeout(() => navigate(`/rate?tripId=${currentId}`), 2500);
        }
      } catch (e) {
        console.error('Error parsing MQTT message:', e);
      }
    });
    client.on('close', () => setMqttLive(false));
    return () => client.end();
  }, [trip?.id, searchParams, navigate]);

  const pCoords = trip?.pickupCoords ? [trip.pickupCoords.lat, trip.pickupCoords.lng] : (locationCoordinates[trip?.pickup] || [-6.1722, 35.7395]);
  const dCoords = trip?.dropoffCoords ? [trip.dropoffCoords.lat, trip.dropoffCoords.lng] : (locationCoordinates[trip?.dropoff] || [-6.175, 35.745]);
  const centerCoords = [(pCoords[0] + dCoords[0]) / 2, (pCoords[1] + dCoords[1]) / 2];

  if (loading) {
    return (
      <div className="h-screen bg-twende-background flex items-center justify-center">
        <span className="animate-spin border-4 border-twende-primary/30 border-t-twende-primary rounded-full w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-twende-background font-poppins relative overflow-hidden">
      
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={centerCoords} zoom={14} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <Marker position={pCoords} />
          {trip?.status !== 'pending' && <Marker position={dCoords} />}
          {trip?.status !== 'pending' && (
            <Polyline positions={[pCoords, dCoords]} color="#2563EB" weight={4} dashArray="8, 8" />
          )}
        </MapContainer>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
        <Link to="/passenger-dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-twende-text hover:bg-gray-50 transition-colors pointer-events-auto">
          <HiOutlineArrowLeft className="text-xl" />
        </Link>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-twende-border pointer-events-auto">
          <span className={`w-2 h-2 rounded-full ${mqttLive ? 'bg-twende-success animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-xs font-bold text-twende-text-secondary">{mqttLive ? 'Live' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 max-w-lg mx-auto w-full pb-10 border-t border-twende-border animate-[slideUp_0.3s_ease-out]">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

          {!trip ? (
            <div className="text-center py-8">
              <FaMotorcycle className="text-5xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-twende-text mb-2">No active ride</h2>
              <p className="text-twende-text-secondary mb-6">You don't have a ride in progress.</p>
              <Link to="/request" className="inline-block bg-twende-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-twende-primary-hover shadow-sm">
                Book a Ride
              </Link>
            </div>
          ) : trip.status === 'pending' ? (
            <div className="text-center py-4">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-twende-primary rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl text-twende-primary"><FaMotorcycle /></div>
              </div>
              <h2 className="text-2xl font-bold text-twende-text mb-2">Finding your rider...</h2>
              <p className="text-twende-text-secondary font-medium">Connecting you to nearby drivers.</p>
              <button onClick={() => { localStorage.removeItem('activeTripId'); navigate('/passenger-dashboard'); }} className="mt-8 text-twende-error font-bold text-sm bg-twende-error/10 px-6 py-3 rounded-full">
                Cancel Request
              </button>
            </div>
          ) : (
            <div>
              {/* Status Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-twende-text mb-1">
                    {trip.status === 'accepted' ? 'Rider on the way' : trip.status === 'started' || trip.status === 'in_progress' ? 'Trip in progress' : 'Trip completed'}
                  </h2>
                  {trip.status === 'accepted' && (
                    <div className="flex items-center gap-1 text-sm font-bold text-twende-text-secondary">
                      <HiOutlineClock /> ETA {eta}
                    </div>
                  )}
                </div>
                {trip.status === 'completed' && <HiOutlineCheckCircle className="text-4xl text-twende-success" />}
              </div>

              {/* Rider Info Card */}
              <div className="bg-gray-50 border border-twende-border rounded-2xl p-4 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white border border-twende-border shadow-sm rounded-full flex items-center justify-center text-xl font-black text-twende-primary">
                    {(trip.riderName || trip.rider || 'R')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-twende-text text-lg">{trip.riderName || trip.rider}</p>
                    <p className="text-sm text-twende-text-secondary flex items-center gap-1 font-semibold mt-0.5">
                      <HiOutlineStar className="text-twende-accent fill-twende-accent" /> {trip.riderRating || '4.8'}
                      <span className="mx-1.5">•</span>
                      {trip.vehicleModel || 'Motorcycle'}
                    </p>
                  </div>
                </div>
                <a href={`tel:${trip.riderPhone || ''}`} className="w-12 h-12 bg-white border border-twende-border shadow-sm rounded-full flex items-center justify-center text-twende-text hover:bg-gray-100 transition-colors">
                  <FaPhone className="text-lg" />
                </a>
              </div>

              {/* Trip Details */}
              <div className="relative pl-6 space-y-5 mb-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                <div className="relative">
                  <div className="absolute -left-5 top-2 w-2.5 h-2.5 rounded-full bg-twende-text border-2 border-white"></div>
                  <p className="font-semibold text-twende-text text-sm">{trip.pickupLocation || trip.pickup}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-5 top-2 w-2.5 h-2.5 bg-twende-primary border-2 border-white"></div>
                  <p className="font-semibold text-twende-text text-sm">{trip.dropoffLocation || trip.dropoff}</p>
                </div>
              </div>

              {/* Fare & CTA */}
              <div className="flex items-center justify-between border-t border-twende-border pt-6 mt-2">
                <div>
                  <p className="text-xs font-bold text-twende-text-secondary uppercase tracking-wider mb-1">Total Fare</p>
                  <p className="text-2xl font-black text-twende-text">TZS {parseFloat(trip.fare || 0).toLocaleString()}</p>
                </div>
                
                {trip.status === 'completed' ? (
                  <Link to={`/rate?tripId=${trip.id}`} className="bg-twende-primary text-white font-bold px-6 py-3.5 rounded-xl hover:bg-twende-primary-hover shadow-sm transition-colors">
                    Rate Trip
                  </Link>
                ) : (
                  <button className="bg-gray-100 text-twende-text-secondary font-bold px-6 py-3.5 rounded-xl hover:bg-gray-200 border border-twende-border transition-colors flex items-center gap-2">
                    <HiOutlinePaperAirplane /> Share
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
