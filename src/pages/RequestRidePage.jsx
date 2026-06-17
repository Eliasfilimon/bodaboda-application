import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";

import { FaMotorcycle } from 'react-icons/fa';
import { useAuth } from "../context/AuthContext";
import { api } from "../config/api.js";
import { dodoma_locations, getDistance, locationCoordinates } from "../data/mockData";
import { Toast } from "../components/Toast";
import { ErrorMessage } from "../components/ErrorMessage";
import { HiOutlineArrowLeft, HiOutlineClock, HiOutlineMapPin, HiOutlineCube } from 'react-icons/hi2';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export const RequestRidePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [step, setStep] = useState('search'); // 'search' | 'ride_type' | 'matching'
  
  const [pickup, setPickup] = useState(user?.defaultLocation || "Dodoma CBD");
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null);
  
  const [suggestions, setSuggestions] = useState([]);
  const [, setIsSuggesting] = useState(false);
  
  const [selectedRideType, setSelectedRideType] = useState('economy'); // 'economy' | 'express' | 'delivery'
  const [paymentMethod] = useState(user?.paymentMethods?.[0] || "Cash");

  const showToast = (message, type = "success") => setToast({ show: true, message, type });

  useEffect(() => {
    api.riders.getOnline()
      .then(data => setRiders(data))
      .catch(() => setError("Failed to load available riders."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const query = destination.trim();
    const timeout = setTimeout(async () => {
      if (query.length < 3) { setSuggestions([]); return; }
      setIsSuggesting(true);
      try {
        const localMatches = dodoma_locations
          .filter(l => l.toLowerCase().includes(query.toLowerCase()))
          .map(label => ({ label, coords: locationCoordinates[label] || null }));
        setSuggestions(localMatches.slice(0, 5));
      } catch { setSuggestions([]); }
      finally { setIsSuggesting(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [destination]);

  const fareBase = useMemo(() => {
    if (!destination || pickup === destination) return 0;
    const distance = getDistance(pickup, destination);
    return Math.round(500 + distance * 300);
  }, [pickup, destination]);

  const rideTypes = [
    { id: 'economy', name: 'Economy Boda', icon: <FaMotorcycle />, multiplier: 1, eta: '3 min', desc: 'Affordable everyday rides' },
    { id: 'express', name: 'Express Boda', icon: <FaMotorcycle className="text-twende-primary" />, multiplier: 1.5, eta: '1 min', desc: 'Priority matching & faster route' },
    { id: 'delivery', name: 'Package Delivery', icon: <HiOutlineCube />, multiplier: 1.2, eta: '5 min', desc: 'Send items safely' },
  ];

  const handleSelectDestination = (item) => {
    setDestination(item.label);
    setDestinationCoords(item.coords);
    setSuggestions([]);
    setStep('ride_type');
  };

  const handleConfirmRide = async () => {
    setStep('matching');
    
    // Simulate matching delay (Uber/Bolt style animation)
    setTimeout(async () => {
      const availableRiders = riders.filter(r => r.status === "online");
      if (!availableRiders.length) {
        setStep('ride_type');
        showToast("No riders available right now. Please try again.", "error");
        return;
      }
      
      const matchedRider = availableRiders[0]; // Simplified matching
      const finalFare = Math.round(fareBase * (rideTypes.find(r => r.id === selectedRideType)?.multiplier || 1));
      
      try {
        const pCoords = locationCoordinates[pickup] || [-6.1722, 35.7395];
        const dCoords = destinationCoords || locationCoordinates[destination] || [-6.1722, 35.7395];
        
        const tripData = {
          pickup, pickupCoords: { lat: pCoords[0], lng: pCoords[1] },
          dropoff: destination, dropoffCoords: { lat: dCoords[0], lng: dCoords[1] },
          riderId: matchedRider.id,
          fare: finalFare,
          paymentMethod,
        };
        
        const response = await api.trips.create(tripData, localStorage.getItem("token"));
        const createdTripId = response?.id || response?.trip?.id;
        if (createdTripId) localStorage.setItem("activeTripId", String(createdTripId));
        
        navigate(createdTripId ? `/track?tripId=${createdTripId}` : "/track");
      } catch (err) {
        setStep('ride_type');
        showToast(err.error || "Failed to book ride.", "error");
      }
    }, 2500);
  };

  const pCoords = locationCoordinates[pickup] || [-6.1722, 35.7395];
  const dCoords = destinationCoords || locationCoordinates[destination] || [-6.1722, 35.7395];

  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="h-screen flex flex-col bg-twende-background font-poppins relative">
      
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={pCoords} zoom={14} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <Marker position={pCoords} />
          {step === 'ride_type' && destination && (
            <>
              <Marker position={dCoords} />
              <Polyline positions={[pCoords, dCoords]} color="#2563EB" weight={4} dashArray="8, 8" className="animate-pulse" />
            </>
          )}
        </MapContainer>
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10">
        <Link to="/passenger-dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-twende-text hover:bg-gray-50 transition-colors">
          <HiOutlineArrowLeft className="text-xl" />
        </Link>
      </div>

      {/* Bottom Sheet UI */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col">
        {step === 'search' && (
          <div className="bg-white rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-6 max-w-lg mx-auto w-full pb-10">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-twende-text mb-6">Where to?</h2>
            
            <div className="relative flex flex-col gap-4">
              {/* Pickup */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-twende-text"></div>
                <input 
                  type="text" value={pickup} onChange={e => setPickup(e.target.value)}
                  className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-3.5 text-base font-medium text-twende-text outline-none focus:ring-2 focus:ring-twende-primary" 
                />
              </div>
              
              {/* Destination */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-twende-primary"></div>
                <input 
                  type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Search destination..." autoFocus
                  className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-3.5 text-base font-medium text-twende-text outline-none focus:ring-2 focus:ring-twende-primary" 
                />
              </div>

              {/* Connecting line */}
              <div className="absolute left-[19px] top-[40px] h-6 w-0.5 bg-gray-300"></div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-4 border-t border-twende-border pt-2 max-h-48 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button key={idx} onClick={() => handleSelectDestination(item)}
                    className="w-full text-left px-2 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-twende-text-secondary"><HiOutlineMapPin /></div>
                    <div className="flex-1 border-b border-twende-border pb-3">
                      <p className="font-bold text-twende-text">{item.label}</p>
                      <p className="text-xs text-twende-text-secondary">Dodoma, Tanzania</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'ride_type' && (
          <div className="bg-white rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-6 max-w-lg mx-auto w-full pb-8">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-twende-text mb-4 text-center">Choose a ride</h2>
            
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {rideTypes.map(type => {
                const isSelected = selectedRideType === type.id;
                const cost = Math.round(fareBase * type.multiplier);
                return (
                  <button key={type.id} onClick={() => setSelectedRideType(type.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-twende-primary bg-twende-primary/5' : 'border-twende-border hover:border-gray-300'}`}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl text-twende-text-secondary">{type.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-twende-text text-base">{type.name}</p>
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded-md text-twende-text-secondary"><HiOutlineClock /> {type.eta}</span>
                        </div>
                        <p className="text-xs text-twende-text-secondary mt-0.5">{type.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-twende-text">TZS {cost.toLocaleString()}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-twende-border rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                <span className="w-5 h-5 bg-twende-primary text-white rounded-full flex items-center justify-center text-[10px]">TSh</span>
                {paymentMethod}
              </button>
            </div>

            <button onClick={handleConfirmRide} disabled={loading}
              className="w-full bg-twende-success text-white py-4 rounded-xl font-bold text-lg hover:bg-twende-success-hover transition-colors shadow-sm active:scale-[0.98]">
              Confirm {rideTypes.find(r=>r.id===selectedRideType)?.name}
            </button>
          </div>
        )}

        {step === 'matching' && (
          <div className="bg-white rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-8 max-w-lg mx-auto w-full pb-12 flex flex-col items-center justify-center text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-twende-primary rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl text-twende-primary"><FaMotorcycle /></div>
            </div>
            <h2 className="text-2xl font-bold text-twende-text mb-2">Finding your ride...</h2>
            <p className="text-twende-text-secondary text-base">Matching you with the nearest {rideTypes.find(r=>r.id===selectedRideType)?.name}</p>
            
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-8 overflow-hidden">
              <div className="bg-twende-primary h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <Toast message={toast.message} show={toast.show} onClose={() => setToast(p => ({ ...p, show: false }))} />
    </div>
  );
};
