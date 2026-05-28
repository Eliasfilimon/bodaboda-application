import { useEffect, useMemo, useState } from 'react';
import { FiUsers, FiTruck, FiTrendingUp, FiMap, FiRefreshCw } from 'react-icons/fi';
import { api } from '../config/api.js';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

export const AdminDashboardPage = () => {
  const [trips, setTrips] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const [riderData] = await Promise.all([
        api.riders.getOnline(),
      ]);
      setRiders(riderData || []);
      // In a real deployment, fetch all trips via admin API
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => { load(); }, []);

  const onlineCount = useMemo(() => riders.filter((r) => r.status === 'online').length, [riders]);
  const onTripCount = useMemo(() => riders.filter((r) => r.status === 'on_trip').length, [riders]);

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-5">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={FiTruck} label="Online Riders" value={onlineCount} color="bg-green-500" />
              <StatCard icon={FiMap} label="On Trip" value={onTripCount} color="bg-blue-500" />
              <StatCard icon={FiUsers} label="Total Riders" value={riders.length} color="bg-purple-500" />
              <StatCard icon={FiTrendingUp} label="Today's Trips" value="—" sub="Connect backend" color="bg-orange-500" />
            </div>

            {/* Rider Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiTruck size={16} /> Active Riders
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                      <th className="px-4 py-3 text-gray-500 font-medium">Name</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Phone</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Location</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Status</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Rating</th>
                      <th className="px-4 py-3 text-gray-500 font-medium">Trips</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {riders.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.phone}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.location}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3 text-yellow-600">{Number(r.rating).toFixed(1)} ⭐</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.trips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
