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
  const role = userType === "user" ? "passenger" : userType;

  const roleNavItems = {
    passenger: [
      { to: "/", label: "Home" },
      { to: "/request", label: "Book Ride" },
      { to: "/history", label: "My Trips" },
      { to: "/profile", label: "Profile" },
    ],
    rider: [
      { to: "/rider/dashboard", label: "Dashboard" },
      { to: "/history", label: "My Trips" },
      { to: "/rider/dashboard#earnings", label: "Earnings" },
      { to: "/profile", label: "Profile" },
    ],
    admin: [
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/admin/dashboard?tab=riders", label: "Riders" },
      { to: "/admin/dashboard?tab=trips", label: "Trips" },
      { to: "/admin/dashboard?tab=overview", label: "Settings" },
    ],
  };

  const desktopNavItems = isAuthenticated
    ? roleNavItems[role] || roleNavItems.passenger
    : [
      { to: "/", label: t('home') || "Home" },
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
    ];

  const linkCls = (path) =>
    `pb-1 font-medium transition ${
      isActive(path)
        ? 'border-b-2 border-twende-accent text-twende-accent'
        : 'hover:text-twende-light'
    }`;

  return (
    <nav className="sticky top-0 bg-twende-text text-white shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition">
            <div className="w-8 h-8 bg-twende-primary rounded-lg flex items-center justify-center">
              <FiMapPin className="text-white text-lg" />
            </div>
            <span className="hidden sm:inline">BodaBoda</span>
            <span className="sm:hidden">BodaBoda</span>
            <span className="hidden md:inline text-xs bg-twende-primary/20 text-twende-light px-2 py-0.5 rounded-full">
              🇹🇿 Dodoma
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {desktopNavItems.map((item) => (
              <Link key={item.label} to={item.to} className={linkCls(item.to)}>
                {item.label}
              </Link>
            ))}
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
                <Link to="/profile" className="flex items-center gap-1.5 text-sm font-medium hover:text-twende-light transition px-2 py-1 hover:bg-white/10 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-twende-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
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
            {desktopNavItems.map((item) => (
              <Link key={item.label} to={item.to} className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link to="/rider-login" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition text-twende-light" onClick={close}>Rider Login</Link>
            )}
            {isAuthenticated && (
              <>
                <Link to="/notifications" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition" onClick={close}>Notifications</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-500/20 rounded-lg transition text-red-400 flex items-center gap-2"
                >
                  <FiLogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
