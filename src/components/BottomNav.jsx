import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaMotorcycle, FaClipboardList, FaBell, FaUser, FaCog } from 'react-icons/fa';

export function BottomNav() {
  const location = useLocation();
  const { isAuthenticated, userType, user } = useAuth();

  if (!isAuthenticated) return null;

  const p = location.pathname;

  const passengerTabs = [
    { to: '/passenger-dashboard', icon: FaHome, label: 'Home' },
    { to: '/request',             icon: FaMotorcycle, label: 'Book' },
    { to: '/history',             icon: FaClipboardList, label: 'Trips' },
    { to: '/notifications',       icon: FaBell, label: 'Alerts' },
    { to: '/profile',             icon: FaUser, label: 'Profile' },
  ];

  const riderTabs = [
    { to: '/dashboard', icon: FaHome, label: 'Home' },
    { to: '/history',   icon: FaClipboardList, label: 'Trips' },
    { to: '/profile',   icon: FaUser, label: 'Profile' },
  ];

  const adminTabs = [
    { to: '/admin', icon: FaCog, label: 'Admin' },
  ];

  const tabs =
    user?.role === 'admin' ? adminTabs :
    userType === 'rider'   ? riderTabs :
    passengerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-twende-navy border-t border-twende-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map(tab => {
          const active = p === tab.to;
          return (
            <Link key={tab.to} to={tab.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
                active ? 'text-[#2563EB]' : 'text-twende-text-secondary'
              }`}>
              <tab.icon className="text-xl leading-none" />
              <span className={`text-xs font-semibold ${ active ? 'text-[#2563EB]' : 'text-twende-text-secondary' }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
