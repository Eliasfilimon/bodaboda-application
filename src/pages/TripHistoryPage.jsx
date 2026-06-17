import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { FaMotorcycle } from 'react-icons/fa';
import { HiOutlineArrowLeft, HiOutlineClock, HiOutlineUser, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineStar, HiOutlineMapPin, HiOutlineCreditCard, HiOutlineCalendarDays } from 'react-icons/hi2';

const STATUS_STYLE = {
  completed: { bg: 'bg-twende-success/10 text-twende-success', Icon: HiOutlineCheckCircle },
  cancelled: { bg: 'bg-twende-error/10 text-twende-error', Icon: HiOutlineXCircle },
  started:   { bg: 'bg-twende-info/10 text-twende-info', Icon: FaMotorcycle },
  in_progress: { bg: 'bg-twende-info/10 text-twende-info', Icon: FaMotorcycle },
  accepted:  { bg: 'bg-twende-accent/10 text-twende-accent', Icon: HiOutlineClock },
  pending:   { bg: 'bg-twende-accent/10 text-twende-accent', Icon: HiOutlineClock },
};

export const TripHistoryPage = () => {
  const { user, rider, userType, token } = useAuth();
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const isRider = userType === 'rider';

  const fetchTrips = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      let data;
      if (isRider) {
        const riderId = rider?.id;
        if (!riderId) { setTrips([]); setLoading(false); return; }
        data = await api.trips.getRiderTrips(riderId);
      } else {
        const userId = user?.id;
        if (!userId) { setTrips([]); setLoading(false); return; }
        data = await api.trips.getUserTrips(userId);
      }
      setTrips(
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : []
      );
    } catch {
      setError('Failed to load trip history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, rider?.id, isRider]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const handleRetry = () => { setError(null); setLoading(true); fetchTrips(); };

  if (loading) return <LoadingSpinner message="Loading trip history..." />;
  if (error)   return <ErrorMessage message={error} onRetry={handleRetry} />;

  return (
    <div className="min-h-screen bg-twende-background font-poppins pb-12">
      <header className="bg-white border-b border-twende-border sticky top-0 z-30">
        <div className="px-6 py-4 max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={isRider ? '/dashboard' : '/passenger-dashboard'} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-twende-text hover:bg-gray-200 transition-colors">
              <HiOutlineArrowLeft className="text-lg" />
            </Link>
            <h1 className="font-bold text-xl text-twende-text">{isRider ? 'My Rides' : 'Your Trips'}</h1>
          </div>
          <span className="text-sm font-bold text-twende-text-secondary bg-gray-100 px-3 py-1 rounded-md">{trips.length}</span>
        </div>
      </header>

      <main className="px-6 py-6 max-w-lg mx-auto space-y-4">
        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-twende-border mt-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-twende-text-secondary text-3xl mx-auto mb-4">
              <HiOutlineClock />
            </div>
            <p className="font-bold text-twende-text text-xl mb-2">No trips yet</p>
            {!isRider ? (
              <>
                <p className="text-sm text-twende-text-secondary mb-6">You haven't taken any rides with us yet.</p>
                <Link to="/request" className="inline-block w-full bg-twende-primary hover:bg-twende-primary-hover text-white font-bold py-4 rounded-xl shadow-sm transition-all active:scale-[0.98]">
                  Book a Ride
                </Link>
              </>
            ) : (
              <p className="text-sm text-twende-text-secondary">Go online to start accepting rides.</p>
            )}
          </div>
        ) : trips.map(trip => {
          const s = STATUS_STYLE[trip.status] || { bg: 'bg-gray-100 text-twende-text-secondary', Icon: HiOutlineClock };
          return (
            <div key={trip.id} className="bg-white rounded-2xl p-5 shadow-sm border border-twende-border hover:shadow-md transition-shadow">
              
              <div className="flex items-start justify-between mb-4 border-b border-twende-border pb-4">
                <div>
                  <p className="font-black text-xl text-twende-text mb-1">TZS {parseFloat(trip.fare || 0).toLocaleString()}</p>
                  <span className="text-xs font-bold text-twende-text-secondary flex items-center gap-1.5">
                    <HiOutlineCalendarDays /> {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${s.bg}`}>
                  <s.Icon className="text-[10px]" /> {trip.status.replace('_', ' ')}
                </span>
              </div>

              <div className="relative pl-6 space-y-4 mb-4">
                <div className="absolute left-2 top-1.5 bottom-1.5 w-0.5 bg-gray-200"></div>
                <div className="relative">
                  <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-twende-text border-2 border-white"></div>
                  <p className="font-semibold text-twende-text text-sm">{trip.pickupLocation || trip.pickup || '—'}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 bg-twende-primary border-2 border-white"></div>
                  <p className="font-semibold text-twende-text text-sm">{trip.dropoffLocation || trip.dropoff || '—'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs font-semibold bg-gray-50 p-3 rounded-xl border border-twende-border gap-2">
                <span className="text-twende-text-secondary flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-twende-border shadow-sm">
                  <HiOutlineCreditCard /> {trip.paymentMethod || trip.payment || 'Cash'}
                </span>
                
                {isRider && (trip.passengerName || trip.customer) && (
                  <span className="text-twende-text flex items-center gap-1.5">
                    <HiOutlineUser className="text-twende-primary" /> {trip.passengerName || trip.customer}
                  </span>
                )}
                {!isRider && (trip.riderName || trip.rider) && (
                  <span className="text-twende-text flex items-center gap-1.5">
                    <FaMotorcycle className="text-twende-primary" /> {trip.riderName || trip.rider}
                  </span>
                )}
              </div>

              {!isRider && trip.status === 'completed' && !trip.rating && (
                <Link to={`/rate/${trip.id}`} className="mt-4 flex items-center justify-center gap-2 text-twende-text-secondary hover:text-twende-text text-sm font-bold border border-twende-border bg-white rounded-xl py-3 hover:bg-gray-50 transition-colors">
                  <HiOutlineStar /> Rate your trip
                </Link>
              )}
              
              {trip.rating && (
                <div className="mt-4 flex items-center justify-between border-t border-twende-border pt-4">
                  <span className="text-xs font-bold text-twende-text-secondary uppercase tracking-wider">Rating given</span>
                  <div className="flex items-center gap-1">
                    {[...Array(trip.rating)].map((_, i) => <HiOutlineStar key={i} className="text-twende-accent text-sm fill-twende-accent" />)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};
