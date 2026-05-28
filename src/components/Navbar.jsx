import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiLogOut, FiMapPin, FiMenu, FiX } from "react-icons/fi";
import { LanguageToggle } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, userType, user, rider, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const close = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  const profile = user || rider;
  const displayName = profile?.name?.split(' ')[0] || null;

  const linkCls = (path) =>
    `pb-1 font-medium transition ${
      isActive(path)
        ? 'border-b-2 border-amber-500 text-amber-400'
        : 'hover:text-amber-400'
    }`;

  return (
    <nav className="sticky top-0 bg-gradient-to-r from-navy-900 to-navy-800 dark:from-gray-950 dark:to-gray-900 text-white shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <FiMapPin className="text-white text-lg" />
            </div>
            <span className="hidden sm:inline">BodaBoda Digital</span>
            <span className="sm:hidden">BodaBoda</span>
            <span className="hidden md:inline text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              🇹🇿 Dodoma
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={linkCls('/')}>{t('home') || 'Home'}</Link>
            <Link to="/request" className={linkCls('/request')}>{t('requestRide') || 'Request Ride'}</Link>
            <Link to="/history" className={linkCls('/history')}>History</Link>
            {isAuthenticated && userType === 'rider' && (
              <Link to="/dashboard" className={linkCls('/dashboard')}>{t('dashboard') || 'Dashboard'}</Link>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className={linkCls('/login')}>Login</Link>
                <Link to="/register" className={linkCls('/register')}>Register</Link>
              </>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <DarkModeToggle />

            {isAuthenticated && (
              <>
                <Link to="/notifications" className="relative p-2 hover:bg-white/10 rounded-lg transition" title="Notifications">
                  <FiBell size={20} />
                </Link>
                <Link to="/profile" className="flex items-center gap-1.5 text-sm font-medium hover:text-amber-400 transition px-2 py-1 hover:bg-white/10 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {displayName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="hidden lg:inline">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/10 rounded-lg transition text-red-400 hover:text-red-300"
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>
              </>
            )}

            <button
              className="md:hidden text-2xl p-2 hover:bg-white/10 rounded-lg transition"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-white/10 pt-3">
            <Link to="/" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>{t('home') || 'Home'}</Link>
            <Link to="/request" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>{t('requestRide') || 'Request Ride'}</Link>
            <Link to="/history" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>Trip History</Link>

            {isAuthenticated ? (
              <>
                {userType === 'rider' && (
                  <Link to="/dashboard" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>Dashboard</Link>
                )}
                <Link to="/notifications" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>Notifications</Link>
                <Link to="/profile" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>Profile</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-500/20 rounded-lg transition text-red-400 flex items-center gap-2"
                >
                  <FiLogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>Login</Link>
                <Link to="/register" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>Register</Link>
                <Link to="/rider-login" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition text-amber-400" onClick={close}>Rider Login</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
