import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { FiMapPin, FiNavigation, FiClock, FiCreditCard, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useNotifications } from "../components/PushNotifications";
import { api } from "../config/api.js";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { SOSButton } from "../components/SOSButton";
import { ShareTrip } from "../components/ShareTrip";
import { TripChat } from "../components/TripChat";
import { ContactButtons } from "../components/VoiceCall";
import { RiderVerificationBadges } from "../components/RiderVerification";
import { Toast } from "../components/Toast";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export const TrackRidePage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { notifyTripUpdate } = useNotifications();
  const [searchParams] = useSearchParams();
  const [trip, setTrip] = useState(null);
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTripId] = useState(
    searchParams.get('tripId') || localStorage.getItem('activeTripId')
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [tripStatus, setTripStatus] = useState('rider_assigned');
  const [eta, setEta] = useState(5);

  const pickupCoords = useMemo(
    () => (trip?.pickupCoords ? [trip.pickupCoords.lat, trip.pickupCoords.lng] : [-6.1722, 35.7395]),
    [trip]
  );
  const destCoords = useMemo(
    () => (trip?.dropoffCoords ? [trip.dropoffCoords.lat, trip.dropoffCoords.lng] : [-6.1500, 35.7500]),
    [trip]
  );
  const riderStart = rider?.coordinates ? [rider.coordinates.lat, rider.coordinates.lng] : [-6.1800, 35.7400];

  const [riderPos, setRiderPos] = useState(riderStart);

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      if (activeTripId) {
        try {
          const tripData = await api.trips.get(activeTripId);
          setTrip(tripData);
          if (tripData.riderId) {
            const riderData = await api.riders.get(tripData.riderId);
            setRider(riderData);
          }
        } catch (error) {
          console.error('Failed to fetch trip:', error);
          setError(t('networkError'));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [activeTripId, t]);

  // Simulate rider movement and status updates
  useEffect(() => {
    if (!trip) return;

    const stages = [
      { status: 'rider_assigned', duration: 3000, message: t('riderOnTheWay') },
      { status: 'rider_arrived', duration: 5000, message: t('arrived') },
      { status: 'trip_started', duration: 3000, message: t('inProgress') },
    ];

    let currentStage = 0;
    
    const simulateTrip = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setTripStatus(stage.status);
        notifyTripUpdate(trip, stage.status);
        setToast({ show: true, message: stage.message });
        
        currentStage++;
        setTimeout(simulateTrip, stage.duration);
      }
    };

    const timer = setTimeout(simulateTrip, 2000);

    // Simulate rider movement
    const interval = setInterval(() => {
      setRiderPos((prev) => {
        const [lat, lng] = prev;
        let targetCoords = tripStatus === 'trip_started' ? destCoords : pickupCoords;
        const [tLat, tLng] = targetCoords;
        
        const distance = Math.sqrt(Math.pow(tLat - lat, 2) + Math.pow(tLng - lng, 2));
        if (distance < 0.001) return prev;
        
        const nextLat = lat + (tLat - lat) * 0.03;
        const nextLng = lng + (tLng - lng) * 0.03;
        
        // Update ETA
        const remainingDistance = Math.sqrt(Math.pow(tLat - nextLat, 2) + Math.pow(tLng - nextLng, 2));
        setEta(Math.max(1, Math.round(remainingDistance * 100)));
        
        return [nextLat, nextLng];
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [trip, tripStatus, notifyTripUpdate, t, destCoords, pickupCoords]);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  }, []);

  if (loading) {
    return <LoadingSpinner message={t('loading')} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-navy-900 text-navy-900 dark:text-sand-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/"
            className="text-navy-900 dark:text-sand-100 hover:text-amber-500 transition mb-6 inline-flex items-center gap-2"
          >
            ← {t('back')}
          </Link>
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-card p-6">
            <p className="text-sand-400 dark:text-sand-500">{t('noActiveTrip')}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusMessages = {
    rider_assigned: t('riderOnTheWay'),
    rider_arrived: t('arrived'),
    trip_started: t('inProgress'),
  };

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-navy-900 text-navy-900 dark:text-sand-100">
      {/* SOS Button */}
      <SOSButton trip={trip} location={{ lat: riderPos[0], lng: riderPos[1] }} user={user} />

      {/* Chat Modal */}
      {isChatOpen && (
        <TripChat
          trip={trip}
          user={user}
          rider={rider}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userType="customer"
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-sand-400 dark:text-sand-500">
              {t('trackRide')}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900 dark:text-sand-100">
              {statusMessages[tripStatus] || t('riderOnTheWay')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ShareTrip trip={trip} user={user} rider={rider} />
            <Link
              to="/"
              className="text-navy-900 dark:text-sand-100 hover:text-amber-500 transition"
            >
              ← {t('home')}
            </Link>
          </div>
        </div>

        {/* Status Banner */}
        <div className="mb-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiNavigation className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">{statusMessages[tripStatus]}</p>
                <p className="text-sm opacity-90 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  {tripStatus !== 'rider_arrived' && (
                    <>
                      {language === 'sw' ? 'Anafika katika' : 'Arriving in'} {eta} {t('minutes')}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">TZS {trip.fare?.toLocaleString()}</p>
              <p className="text-sm opacity-90">{trip.paymentMethod || t('cash')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            {/* Rider Info Card */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xl">
                  {rider?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-sand-400 dark:text-sand-500 uppercase tracking-wide">
                    {t('requestRide')}
                  </p>
                  <h3 className="text-xl font-bold text-navy-900 dark:text-sand-100">
                    {rider?.name || t('assignedRider')}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-amber-500">★</span>
                    <span className="text-sm text-sand-500 dark:text-sand-400">
                      {rider?.rating || '4.5'} • {rider?.trips || 0} {t('trips')}
                    </span>
                  </div>
                  <p className="text-sm text-sand-400 dark:text-sand-500 mt-1">
                    {rider?.vehicleInfo?.model || 'Motorcycle'} • {rider?.vehicleInfo?.plateNumber}
                  </p>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="mt-4">
                <RiderVerificationBadges rider={rider} />
              </div>

              {/* Contact Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <ContactButtons
                  phoneNumber={rider?.phone}
                  name={rider?.name}
                  onMessage={() => setIsChatOpen(true)}
                />
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-card p-6 space-y-4">
              <h3 className="font-bold text-navy-900 dark:text-sand-100 flex items-center gap-2">
                <FiMapPin className="text-amber-500" />
                {t('tripDetails')}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-xs text-sand-400 dark:text-sand-500">{t('pickupLocation')}</p>
                    <p className="font-medium text-navy-900 dark:text-sand-100">{trip.pickup}</p>
                  </div>
                </div>

                <div className="w-0.5 h-6 bg-sand-200 dark:bg-sand-700 ml-4" />

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-xs text-sand-400 dark:text-sand-500">{t('destination')}</p>
                    <p className="font-medium text-navy-900 dark:text-sand-100">{trip.dropoff}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-sand-100 dark:border-sand-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="text-sand-400" />
                    <span className="text-sand-500">{t('paymentMethod')}</span>
                  </div>
                  <span className="font-semibold text-navy-900 dark:text-sand-100">
                    {trip.paymentMethod || t('cash')}
                  </span>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                <FiCheckCircle /> {t('safetyTips')}
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• {t('verifyRider')}</li>
                <li>• {t('wearHelmet')}</li>
                <li>• {t('shareWithFamily')}</li>
              </ul>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => {
                if (confirm(language === 'sw' ? 'Una uhakika unataka kughairi safari?' : 'Are you sure you want to cancel this trip?')) {
                  // Handle cancel
                  showToast(t('tripCancelled'));
                }
              }}
              className="w-full bg-sand-100 dark:bg-navy-700 hover:bg-sand-200 dark:hover:bg-navy-600 text-sand-600 dark:text-sand-300 font-semibold py-3 rounded-xl transition"
            >
              {t('cancel')} {t('requestRide')}
            </button>
          </div>

          {/* Map */}
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-card overflow-hidden h-125 lg:h-150">
            <MapContainer
              center={riderPos}
              zoom={14}
              className="h-full w-full"
              attributionControl
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Pickup Marker */}
              <Marker position={pickupCoords}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">{t('pickupLocation')}</p>
                    <p className="text-sm">{trip.pickup}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={destCoords}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">{t('destination')}</p>
                    <p className="text-sm">{trip.dropoff}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Rider Marker */}
              <Marker position={riderPos}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">{rider?.name}</p>
                    <p className="text-sm">{statusMessages[tripStatus]}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Route Line */}
              <Polyline 
                positions={[riderPos, tripStatus === 'trip_started' ? destCoords : pickupCoords]} 
                color="#F5A623" 
                weight={4}
                dashArray={tripStatus === 'rider_arrived' ? '10, 10' : null}
              />
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};
