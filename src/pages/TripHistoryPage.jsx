import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiCheckCircle, FiXCircle, FiMapPin } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { api } from "../config/api.js";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

export const TripHistoryPage = () => {
  const { user } = useAuth();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const trips = await api.trips.getUserTrips(user.id);
      setUserTrips(trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      setError('Failed to load trip history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchTrips();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-savanna-700" />;
      case 'cancelled':
        return <FiXCircle className="text-flame-500" />;
      default:
        return <FiClock className="text-amber-700" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-savanna-700 bg-savanna-100';
      case 'cancelled':
        return 'text-flame-500 bg-flame-100';
      default:
        return 'text-amber-700 bg-amber-100';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading trip history..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sand-50 text-navy-900">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/register"
            className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2"
          >
            ← Go to registration
          </Link>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <p className="text-sand-400">Please register to view your trip history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 text-navy-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2"
        >
          ← Back
        </Link>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
            Trip History
          </h1>
          <p className="text-sm text-sand-400 mb-6">
            Your past rides and their status.
          </p>

          {userTrips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sand-400">No trips yet. Request your first ride!</p>
              <Link
                to="/request"
                className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-xl transition"
              >
                Request a Ride
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userTrips.map((trip) => (
                <div key={trip.id} className="border border-sand-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                        {getStatusIcon(trip.status)}
                        {trip.status}
                      </span>
                      <span className="text-xs text-sand-400">{trip.time}</span>
                    </div>
                    <p className="text-lg font-bold text-navy-900">
                      TZS {trip.fare.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <FiMapPin className="text-amber-700 mt-0.5" />
                    <div>
                      <p className="text-navy-800">{trip.pickup}</p>
                      <p className="text-sand-400">→ {trip.dropoff}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-sand-400">
                    <span>Rider: {trip.rider || 'Not assigned'}</span>
                    <span>Payment: {trip.payment}</span>
                  </div>

                  {trip.status === 'completed' && !trip.rating && (
                    <Link
                      to={`/rate/${trip.id}`}
                      className="mt-3 inline-block text-amber-700 text-sm font-semibold hover:underline"
                    >
                      Rate this trip
                    </Link>
                  )}

                  {trip.rating && (
                    <div className="mt-2 text-xs text-sand-400">
                      Rating: {trip.rating}★
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
