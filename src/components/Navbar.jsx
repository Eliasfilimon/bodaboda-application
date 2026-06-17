import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { FaMotorcycle, FaCog, FaBars, FaSignOutAlt } from 'react-icons/fa';

export function Navbar() {
  const { isAuthenticated, userType, user, rider, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide Navbar on pages that have their own full-screen headers
  const hiddenOn = ['/dashboard', '/admin', '/passenger-dashboard'];
  if (hiddenOn.includes(location.pathname)) return null;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const name = userType === 'rider'
    ? (rider?.fullName || rider?.name || 'Rider')
    : (user?.name || user?.fullName || 'User');

  const passengerLinks = [
    { to: '/passenger-dashboard', label: 'Dashboard' },
    { to: '/request',             label: 'Book Ride' },
    { to: '/history',             label: 'My Trips' },
    { to: '/notifications',       label: 'Notifications' },
  ];

  const riderLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/history',   label: 'My Trips' },
    { to: '/profile',   label: 'Profile' },
  ];

  const links = userType === 'rider' ? riderLinks : passengerLinks;

  return (
    <nav className="bg-white sticky top-0 z-40 shadow-sm border-b border-twende-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <FaMotorcycle className="text-[#2563EB] text-xl" />
          <span className="text-[#2563EB] font-black text-lg">BodaBoda</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated && links.map(l => (
            <Link key={l.to} to={l.to} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              location.pathname === l.to ? 'bg-twende-primary/10 text-twende-primary' : 'text-twende-text-secondary hover:text-twende-text hover:bg-gray-50'
            }`}>{l.label}</Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[#2563EB] hover:bg-gray-100 flex items-center gap-1"><FaCog /> Admin</Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden md:block text-twende-text-secondary text-sm">{name}</span>
              <button onClick={handleLogout} className="hidden md:block text-sm text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100">Logout</button>
            </>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link to="/login"    className="text-sm font-bold text-twende-text-secondary hover:text-twende-text px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Login</Link>
              <Link to="/register" className="text-sm bg-twende-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-twende-primary-hover shadow-sm transition-colors">Register</Link>
            </div>
          )}
          <button className="md:hidden text-twende-text text-xl p-1" onClick={() => setMenuOpen(o => !o)}><FaBars /></button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-twende-border px-4 py-3 space-y-1 shadow-md">
          {isAuthenticated ? (
            <>
              <p className="text-twende-text-secondary text-xs mb-2 font-semibold uppercase tracking-widest">{name}</p>
              {links.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-bold ${
                    location.pathname === l.to ? 'bg-twende-primary/10 text-twende-primary' : 'text-twende-text-secondary hover:bg-gray-50 hover:text-twende-text'
                  }`}>{l.label}</Link>
              ))}
              {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-[#2563EB] text-sm font-semibold flex items-center gap-2"><FaCog /> Admin Panel</Link>}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-red-400 text-sm font-semibold flex items-center gap-2"><FaSignOutAlt /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"       onClick={() => setMenuOpen(false)} className="block px-3 py-3 font-bold text-twende-text-secondary text-sm hover:bg-gray-50 rounded-xl">Login</Link>
              <Link to="/register"    onClick={() => setMenuOpen(false)} className="block px-3 py-3 bg-twende-primary text-white text-sm rounded-xl font-bold text-center shadow-sm">Register</Link>
              <Link to="/rider-login" onClick={() => setMenuOpen(false)} className="block px-3 py-3 border-2 border-twende-primary text-twende-primary text-sm rounded-xl font-bold text-center mt-2 hover:bg-twende-primary/5">Rider Login</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
