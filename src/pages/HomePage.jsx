import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiStar,
  FiUsers,
} from "react-icons/fi";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-sand-50 text-navy-900">
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50/50 to-sand-50 overflow-hidden">
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold text-amber-700 tracking-widest uppercase mb-3">
              Dodoma Boda Association
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
              Welcome to BodaBoda Digital
            </h1>
            <p className="text-lg sm:text-xl text-navy-800 mb-8 max-w-xl">
              Fast, safe boda boda rides across Dodoma with trusted riders, clear pricing, and real-time matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/request"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl shadow-amber transition inline-flex items-center justify-center transform hover:scale-105"
              >
                Request a Ride <FiArrowRight className="inline-block ml-2" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-navy-900 text-navy-900 font-bold py-3 px-8 rounded-xl hover:bg-navy-900 hover:text-white transition inline-flex items-center justify-center"
              >
                Customer Login
              </Link>
              <Link
                to="/dashboard"
                className="border-2 border-navy-900 text-navy-900 font-bold py-3 px-8 rounded-xl hover:bg-navy-900 hover:text-white transition inline-flex items-center justify-center"
              >
                Rider Dashboard
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 border border-sand-200">
            <h3 className="text-lg font-bold text-navy-900 mb-4">
              Today at a glance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 text-center border border-amber-200">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500 flex items-center justify-center">
                  <FiUsers className="text-white" />
                </div>
                <p className="text-2xl font-bold text-navy-900">24</p>
                <p className="text-sand-600 text-xs">Active Riders</p>
              </div>
              <div className="bg-gradient-to-br from-savanna-50 to-savanna-100/50 rounded-xl p-4 text-center border border-savanna-200">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-savanna-700 flex items-center justify-center">
                  <FiCheckCircle className="text-white" />
                </div>
                <p className="text-2xl font-bold text-navy-900">1,284</p>
                <p className="text-sand-600 text-xs">Trips Completed</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 text-center border border-amber-200">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500 flex items-center justify-center">
                  <FiStar className="text-white" />
                </div>
                <p className="text-2xl font-bold text-navy-900">4.8</p>
                <p className="text-sand-600 text-xs">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-50 text-navy-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <span className="hidden md:block text-sand-400 text-sm">
              Simple steps, fast service
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-card p-6 border border-sand-200 hover:shadow-lg transition hover:border-amber-300">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mb-4">
                <FiMapPin className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Enter Your Details</h3>
              <p className="text-navy-800">
                Choose your pickup and destination from Dodoma locations.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-6 border border-sand-200 hover:shadow-lg transition hover:border-amber-300">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mb-4">
                <FiUsers className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Get Matched</h3>
              <p className="text-navy-800">
                We assign a nearby rider with the best availability.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-6 border border-sand-200 hover:shadow-lg transition hover:border-amber-300">
              <div className="w-12 h-12 rounded-full bg-savanna-700 flex items-center justify-center mb-4">
                <FiCheckCircle className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Ride Safely</h3>
              <p className="text-navy-800">Track your ride and pay on arrival.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-navy-900 text-sand-400 py-12 px-4 sm:px-6 lg:px-8 text-center border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FiMapPin className="text-amber-500 text-xl" />
            <span className="text-white font-bold text-lg">BodaBoda Digital</span>
          </div>
          <p className="mb-4">🇹🇿 Proudly serving Dodoma, Tanzania</p>
          <p className="text-sm">© 2025 BodaBoda Digital — Powering Dodoma's Streets</p>
        </div>
      </footer>
    </div>
  );
};
