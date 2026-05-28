import { NavLink } from "react-router-dom";
import { FiBell, FiGrid, FiHome, FiList, FiMapPin, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const navItemClass = ({ isActive }) =>
  `flex flex-col items-center gap-0.5 text-xs font-medium transition px-2 ${
    isActive ? "text-amber-500" : "text-navy-800 dark:text-gray-300 hover:text-amber-500"
  }`;

export const BottomNav = () => {
  const { isAuthenticated, userType } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-sand-200 dark:border-gray-800 shadow-lg md:hidden">
      <div className="max-w-md mx-auto px-2 py-2 flex items-end justify-between">
        <NavLink to="/" className={navItemClass}>
          <FiHome size={22} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/history" className={navItemClass}>
          <FiList size={22} />
          <span>History</span>
        </NavLink>

        {/* Center FAB */}
        <NavLink to="/request" className="flex flex-col items-center -mt-5">
          <div className="w-14 h-14 bg-amber-500 hover:bg-amber-600 transition rounded-2xl shadow-lg flex items-center justify-center">
            <FiMapPin size={26} className="text-white" />
          </div>
          <span className="text-xs font-medium text-amber-600 mt-1">Ride</span>
        </NavLink>

        {isAuthenticated && userType === 'rider' ? (
          <NavLink to="/dashboard" className={navItemClass}>
            <FiGrid size={22} />
            <span>Dashboard</span>
          </NavLink>
        ) : (
          <NavLink to="/notifications" className={navItemClass}>
            <FiBell size={22} />
            <span>Alerts</span>
          </NavLink>
        )}

        <NavLink to={isAuthenticated ? "/profile" : "/login"} className={navItemClass}>
          <FiUser size={22} />
          <span>{isAuthenticated ? 'Profile' : 'Login'}</span>
        </NavLink>
      </div>
    </nav>
  );
};
