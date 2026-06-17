import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../config/api.js';
import { FaMotorcycle } from 'react-icons/fa';
import { HiOutlineClock, HiOutlineUser, HiOutlineMapPin, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { FiBell, FiChevronRight } from 'react-icons/fi';

export const PassengerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentTrips, setRecentTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoadingTrips(false); return; }
    api.trips.getUserTrips(user.id)
      .then(data => setRecentTrips(
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
          : []
      ))
      .catch(() => {})
      .finally(() => setLoadingTrips(false));
  }, [user?.id]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const STATUS_COLOR = {
    completed:   'bg-twende-success/10 text-twende-success',
    cancelled:   'bg-twende-error/10 text-twende-error',
    pending:     'bg-twende-accent/10 text-twende-accent',
    in_progress: 'bg-twende-info/10 text-twende-info',
  };

  return (
    <div className="min-h-screen bg-twende-background font-poppins pb-24">
      {/* Header */}
      <header className="bg-twende-primary px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-white">
            <Link to="/profile" className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg hover:bg-white/30 transition-colors">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Link>
            <div>
              <p className="text-white/80 text-sm font-medium">{greeting()},</p>
              <p className="font-bold text-xl">{user?.name?.split(' ')[0] || 'Passenger'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <FiBell className="text-lg" />
            </Link>
          </div>
        </div>

        {/* Where to Input (Main CTA) */}
        <Link 
          to="/request" 
          className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-lg transform hover:-translate-y-1 transition-all"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-twende-text-secondary">
            <HiOutlineMagnifyingGlass className="text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-twende-text">Where to?</p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-xl text-twende-text-secondary font-semibold text-sm flex items-center gap-1">
            <HiOutlineClock /> Now
          </div>
        </Link>
      </header>

      <main className="px-6 py-8 max-w-md mx-auto space-y-8">
        
        {/* Quick Suggestions */}
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          <Link to="/request" className="flex-shrink-0 w-24 bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-twende-border shadow-sm hover:border-twende-primary transition-colors">
            <img src="https://cdn-icons-png.flaticon.com/512/3209/3209935.png" alt="Boda" className="w-10 h-10 object-contain opacity-80" />
            <span className="text-xs font-bold text-twende-text">Ride</span>
          </Link>
          <Link to="/request" className="flex-shrink-0 w-24 bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-twende-border shadow-sm hover:border-twende-primary transition-colors">
            <img src="https://cdn-icons-png.flaticon.com/512/2769/2769339.png" alt="Delivery" className="w-10 h-10 object-contain opacity-80" />
            <span className="text-xs font-bold text-twende-text">Delivery</span>
          </Link>
          <Link to="/history" className="flex-shrink-0 w-24 bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-twende-border shadow-sm hover:border-twende-primary transition-colors">
            <HiOutlineClock className="text-2xl text-twende-text-secondary" />
            <span className="text-xs font-bold text-twende-text">History</span>
          </Link>
        </div>

        {/* Saved Places */}
        <div>
          <h3 className="text-lg font-bold text-twende-text mb-3">Saved Places</h3>
          <div className="bg-white rounded-2xl border border-twende-border shadow-sm divide-y divide-twende-border">
            <Link to="/request" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-twende-text-secondary">
                <HiOutlineMapPin />
              </div>
              <div>
                <p className="font-bold text-twende-text text-base">Current Location</p>
                <p className="text-sm text-twende-text-secondary">{user?.defaultLocation || 'Dodoma CBD'}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Trips */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-twende-text">Recent Trips</h3>
            <Link to="/history" className="text-sm font-bold text-twende-primary hover:underline">See all</Link>
          </div>

          {loadingTrips ? (
            <div className="flex justify-center p-8">
              <span className="animate-spin border-4 border-twende-primary/30 border-t-twende-primary rounded-full w-8 h-8" />
            </div>
          ) : recentTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-twende-border p-8 text-center shadow-sm">
              <FaMotorcycle className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-twende-text font-bold text-base">No trips yet</p>
              <p className="text-twende-text-secondary text-sm mt-1 mb-4">Ready to take your first ride?</p>
              <Link to="/request" className="bg-twende-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-twende-primary-hover transition-colors">Book a Boda</Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-twende-border shadow-sm divide-y divide-twende-border">
              {recentTrips.map(t => (
                <Link key={t.id} to={`/history`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <FaMotorcycle className="text-twende-text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-twende-text text-base">{t.dropoff || t.dropoffLocation}</p>
                      <p className="text-sm text-twende-text-secondary flex items-center gap-2">
                        <span>{new Date(t.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${STATUS_COLOR[t.status] || 'bg-gray-100 text-twende-text-secondary'}`}>
                          {t.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-bold text-twende-text text-base">TZS {t.fare?.toLocaleString() || 0}</p>
                    <FiChevronRight className="text-twende-text-secondary mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
