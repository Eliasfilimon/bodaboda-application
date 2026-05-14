import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../config/api.js";
import { RideCard } from "../components/RideCard";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import {
  FiBell,
  FiClock,
  FiList,
  FiUser,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";

export const RiderDashboardPage = () => {
  const { rider } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [trips, setTrips] = useState([]);
  const [onlineRiders, setOnlineRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      if (rider) {
        setIsOnline(rider.status === 'online');
        try {
          const data = await api.trips.getRiderTrips(rider.id);
          setTrips(data);
          const riders = await api.riders.getOnline();
          setOnlineRiders(riders || []);
        } catch (error) {
          console.error('Failed to fetch trips:', error);
          setError('Failed to load your trips. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [rider]);

  const riderProfile = rider;
  const myTrips = useMemo(() => trips || [], [trips]);

  const pendingTrips = useMemo(
    () => myTrips.filter((t) => t.status === "pending"),
    [myTrips]
  );
  const completedTrips = useMemo(
    () => myTrips.filter((t) => t.status === "completed"),
    [myTrips]
  );
  const inProgressTrips = useMemo(
    () => myTrips.filter((t) => t.status === "in_progress"),
    [myTrips]
  );

  const earningsToday = useMemo(
    () => completedTrips.reduce((sum, trip) => sum + Math.round(trip.fare * 0.8), 0),
    [completedTrips]
  );

  const currentTrip = useMemo(
    () => inProgressTrips[0] || null,
    [inProgressTrips]
  );

  const filteredTrips = useMemo(() => {
    if (activeTab === "pending") return pendingTrips;
    if (activeTab === "in_progress") return inProgressTrips;
    if (activeTab === "completed") return completedTrips;
    return myTrips;
  }, [activeTab, pendingTrips, inProgressTrips, completedTrips, myTrips]);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-sand-50 text-navy-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sand-400 mb-4">Please log in to access the rider dashboard</p>
          <Link
            to="/rider-login"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-xl transition"
          >
            Login as Rider
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleOnline = async () => {
    if (!rider) return;

    const nextStatus = isOnline ? 'offline' : 'online';
    setIsOnline(!isOnline);

    try {
      await api.riders.updateStatus(rider.id, { status: nextStatus });
    } catch (error) {
      setIsOnline(isOnline);
      alert(error.error || 'Failed to update rider status');
    }
  };

  const handleAssignTrip = async (tripId, riderId) => {
    try {
      await api.trips.accept(tripId, riderId);
      const data = await api.trips.getRiderTrips(rider.id);
      setTrips(data);
    } catch (error) {
      alert(error.error || 'Failed to assign trip');
    }
  };


  const handleCompleteTrip = async (tripId) => {
    try {
      await api.trips.complete(tripId, rider.id);
      // Refresh trips after completing
      const data = await api.trips.getRiderTrips(rider.id);
      setTrips(data);
    } catch (error) {
      alert(error.error || 'Failed to complete trip');
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-sand-400">
              Rider console
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900">
              {riderProfile ? riderProfile.name : "Rider Dashboard"}
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <FiClock /> {time.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-300/40 flex items-center justify-center text-amber-700">
              <FiUser />
            </div>
            <div>
              <p className="text-xs text-sand-400">Status</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={isOnline ? "online" : "offline"} />
                <span className="text-xs text-sand-400">Rider only</span>
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    isOnline
                      ? "border-savanna-700 text-savanna-700 bg-savanna-100"
                      : "border-offline text-offline bg-sand-200"
                  }`}
                >
                  {isOnline ? "Go Offline" : "Go Online"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-sand-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-sand-400 mb-1">My Trips Today</p>
              <FiList className="text-sand-400" />
            </div>
            <p className="text-3xl font-bold text-navy-900">{myTrips.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card border border-sand-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-sand-400 mb-1">Completed</p>
              <FiCheckCircle className="text-savanna-700" />
            </div>
            <p className="text-3xl font-bold text-navy-900">{completedTrips.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card border border-sand-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-sand-400 mb-1">Pending</p>
              <FiBell className="text-amber-700" />
            </div>
            <p className="text-3xl font-bold text-navy-900">{pendingTrips.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card border border-sand-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-sand-400 mb-1">Earnings Today</p>
              <FiTrendingUp className="text-amber-700" />
            </div>
            <p className="text-3xl font-bold text-navy-900">
              TZS {earningsToday.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-8 mb-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
                <FiBell /> Incoming Requests
              </h2>
              <span className="text-xs text-sand-400">Assigned to you</span>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-4">
              {pendingTrips.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No assigned requests right now
                </p>
              ) : (
                pendingTrips.map((trip) => (
                  <RideCard
                    key={trip.id}
                    trip={trip}
                    onAssign={handleAssignTrip}
                    onlineRiders={onlineRiders}
                  />
                ))
              )}
            </div>

            <div className="mt-6 bg-white rounded-2xl shadow-card p-4">
              <h3 className="text-lg font-semibold text-navy-900 mb-3">
                Current Trip
              </h3>
              {currentTrip ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sand-400">Customer</span>
                    <span className="text-navy-900 font-medium">
                      {currentTrip.customer}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sand-400">Route</span>
                    <span className="text-navy-900 font-medium">
                      {currentTrip.pickup} → {currentTrip.dropoff}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sand-400">Status</span>
                    <StatusBadge status={currentTrip.status} />
                  </div>
                  <button
                    onClick={() => handleCompleteTrip(currentTrip.id)}
                    className="mt-2 w-full bg-savanna-100 text-savanna-700 px-3 py-2 rounded-xl text-sm font-semibold hover:brightness-95 transition"
                  >
                    Mark Trip Complete
                  </button>
                </div>
              ) : (
                <p className="text-sand-400 text-sm">No trip in progress.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-3 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
                <FiList /> My Trips
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "in_progress", label: "In Progress" },
                  { key: "completed", label: "Completed" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      activeTab === tab.key
                        ? "border-amber-500 bg-amber-300/30 text-amber-700"
                        : "border-sand-300 text-navy-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sand-50 border-b">
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">#</th>
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">Customer</th>
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">Pickup</th>
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">Dropoff</th>
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">Rider</th>
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">Fare</th>
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">Payment</th>
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">Status</th>
                      <th className="px-3 py-3 text-left font-semibold text-navy-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((trip, idx) => (
                      <tr key={trip.id} className="border-b hover:bg-sand-50 transition">
                        <td className="px-3 py-3 text-navy-800">{idx + 1}</td>
                        <td className="px-3 py-3 text-navy-900 font-medium">{trip.customer}</td>
                        <td className="px-3 py-3 text-navy-800">{trip.pickup}</td>
                        <td className="px-3 py-3 text-navy-800">{trip.dropoff}</td>
                        <td className="px-3 py-3 text-navy-800">{trip.rider || "—"}</td>
                        <td className="px-3 py-3 text-navy-900 font-semibold">
                          TZS {trip.fare.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-navy-800">{trip.payment}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={trip.status} />
                        </td>
                        <td className="px-3 py-3">
                          {trip.status === "in_progress" ? (
                            <button
                              onClick={() => handleCompleteTrip(trip.id)}
                              className="bg-savanna-100 text-savanna-700 px-2 py-1 rounded text-xs hover:brightness-95 transition"
                            >
                              Mark Complete
                            </button>
                          ) : (
                            <span className="text-sand-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTrips.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-sand-400" colSpan={9}>
                          No trips assigned yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
          <p className="text-sm text-sand-400">Quick tip</p>
          <p className="text-lg font-semibold text-navy-900">
            Stay online to receive more requests.
          </p>
        </div>
      </div>
    </div>
  );
};
