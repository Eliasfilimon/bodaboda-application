import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMapPin, FiMenu, FiX } from "react-icons/fi";
import { LanguageToggle } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { useLanguage } from "../context/LanguageContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 bg-gradient-to-r from-navy-900 to-navy-800 dark:from-navy-950 dark:to-navy-900 text-white shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <FiMapPin className="text-white text-lg" />
            </div>
            <span className="hidden sm:inline">BodaBoda Digital</span>
            <span className="sm:hidden">BodaBoda</span>
            <span className="hidden md:inline text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
              🇹🇿 Dodoma
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`pb-2 font-medium transition ${
                isActive("/") ? "border-b-2 border-amber-500 text-amber-500" : "hover:text-amber-500"
              }`}
            >
              {t('home')}
            </Link>
            <Link
              to="/request"
              className={`pb-2 font-medium transition ${
                isActive("/request")
                  ? "border-b-2 border-amber-500 text-amber-500"
                  : "hover:text-amber-500"
              }`}
            >
              {t('requestRide')}
            </Link>
            <Link
              to="/login"
              className={`pb-2 font-medium transition ${
                isActive("/login")
                  ? "border-b-2 border-amber-500 text-amber-500"
                  : "hover:text-amber-500"
              }`}
            >
              Login
            </Link>
            <Link
              to="/dashboard"
              className={`pb-2 font-medium transition ${
                isActive("/dashboard")
                  ? "border-b-2 border-amber-500 text-amber-500"
                  : "hover:text-amber-500"
              }`}
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/profile"
              className={`pb-2 font-medium transition ${
                isActive("/profile")
                  ? "border-b-2 border-amber-500 text-amber-500"
                  : "hover:text-amber-500"
              }`}
            >
              {t('profile')}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <LanguageToggle />
              <DarkModeToggle />
            </div>
            <button
              className="md:hidden text-2xl p-2 hover:bg-white/10 rounded-lg transition"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <Link
              to="/"
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition"
              onClick={() => setIsOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              to="/request"
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition"
              onClick={() => setIsOpen(false)}
            >
              {t('requestRide')}
            </Link>
            <Link
              to="/login"
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/dashboard"
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition"
              onClick={() => setIsOpen(false)}
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/profile"
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition"
              onClick={() => setIsOpen(false)}
            >
              {t('profile')}
            </Link>
            <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 mt-2">
              <LanguageToggle />
              <DarkModeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
