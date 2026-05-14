import { useState, useCallback } from 'react';
import { FiAlertTriangle, FiPhone, FiMapPin, FiX, FiShield } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const EMERGENCY_CONTACTS = {
  police: { number: '112', name: 'Police', icon: FiShield },
  ambulance: { number: '114', name: 'Ambulance', icon: FiPhone },
  fire: { number: '115', name: 'Fire Department', icon: FiAlertTriangle },
};

export const SOSButton = ({ trip, location, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const { t } = useLanguage();

  const handleSOS = useCallback(async () => {
    setIsSending(true);
    
    try {
      // Get current position if not provided
      let currentLocation = location;
      if (!currentLocation && navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      }

      // Prepare emergency data
      const emergencyData = {
        type: 'SOS',
        timestamp: new Date().toISOString(),
        userId: user?.id,
        userName: user?.name,
        userPhone: user?.phone,
        tripId: trip?.id,
        riderId: trip?.riderId,
        location: currentLocation,
        address: trip?.pickup || 'Unknown location'
      };

      // Send to backend
      const response = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyData)
      });

      if (response.ok) {
        setAlertSent(true);
        
        // Also send SMS if available
        if (user?.emergencyContacts?.length > 0) {
          await sendEmergencySMS(emergencyData, user.emergencyContacts);
        }
        
        // Trigger device vibration if available
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
      }
    } catch (error) {
      console.error('SOS failed:', error);
      // Fallback: Try to open dialer directly
      window.location.href = `tel:${EMERGENCY_CONTACTS.police.number}`;
    } finally {
      setIsSending(false);
    }
  }, [trip, location, user]);

  const sendEmergencySMS = async (data, contacts) => {
    const message = `🚨 EMERGENCY ALERT from BodaBoda Digital\n\n` +
      `User: ${data.userName}\n` +
      `Phone: ${data.userPhone}\n` +
      `Location: ${data.address}\n` +
      `Coordinates: ${data.location?.lat}, ${data.location?.lng}\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `Please contact user immediately or call police: 112`;

    // This would integrate with SMS API
    console.log('Emergency SMS to be sent:', message, contacts);
  };

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  const shareLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          
          if (navigator.share) {
            navigator.share({
              title: 'My Location - Emergency',
              text: `I am here: ${trip?.pickup || 'Current location'}`,
              url: mapsUrl
            });
          } else {
            navigator.clipboard.writeText(mapsUrl);
            alert('Location link copied to clipboard!');
          }
        },
        (error) => {
          console.error('Location error:', error);
          alert('Could not get location. Please enable GPS.');
        }
      );
    }
  };

  if (alertSent) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-flame-500 text-white px-6 py-4 rounded-2xl shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="w-6 h-6" />
            <div>
              <p className="font-bold">{t('emergencyAlertSent')}</p>
              <p className="text-sm opacity-90">Help is on the way</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-flame-500 hover:bg-flame-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
        aria-label="Emergency SOS"
      >
        <span className="text-xs font-bold block">SOS</span>
        <FiAlertTriangle className="w-5 h-5 mx-auto" />
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-flame-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FiAlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t('emergency')}</h2>
                    <p className="text-sm opacity-90">{t('sos')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCall(EMERGENCY_CONTACTS.police.number)}
                  className="bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl p-4 text-center transition"
                >
                  <FiShield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-bold text-red-700">{t('callPolice')}</p>
                  <p className="text-sm text-red-600">{EMERGENCY_CONTACTS.police.number}</p>
                </button>
                
                <button
                  onClick={() => handleCall(EMERGENCY_CONTACTS.ambulance.number)}
                  className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl p-4 text-center transition"
                >
                  <FiPhone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-bold text-blue-700">{t('callAmbulance')}</p>
                  <p className="text-sm text-blue-600">{EMERGENCY_CONTACTS.ambulance.number}</p>
                </button>
              </div>

              {/* Share Location */}
              <button
                onClick={shareLocation}
                className="w-full flex items-center justify-center gap-2 bg-sand-50 hover:bg-sand-100 border border-sand-200 rounded-xl p-4 transition"
              >
                <FiMapPin className="w-5 h-5 text-navy-700" />
                <span className="font-semibold text-navy-700">{t('shareLocation')}</span>
              </button>

              {/* Trip Info */}
              {trip && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-800 font-semibold mb-1">Current Trip</p>
                  <p className="text-sm text-amber-700">From: {trip.pickup}</p>
                  <p className="text-sm text-amber-700">To: {trip.dropoff}</p>
                  {trip.riderName && (
                    <p className="text-sm text-amber-700">Rider: {trip.riderName}</p>
                  )}
                </div>
              )}

              {/* Main SOS Button */}
              <button
                onClick={handleSOS}
                disabled={isSending}
                className="w-full bg-flame-500 hover:bg-flame-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-3"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Alert...</span>
                  </>
                ) : (
                  <>
                    <FiAlertTriangle className="w-6 h-6" />
                    <span className="text-lg">SEND EMERGENCY ALERT</span>
                  </>
                )}
              </button>

              <p className="text-xs text-sand-400 text-center">
                This will notify emergency contacts and the BodaBoda Digital safety team
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
