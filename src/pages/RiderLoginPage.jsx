import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPhone } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export const RiderLoginPage = () => {
  const navigate = useNavigate();
  const { riderLogin } = useAuth();
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await riderLogin(phone);
      navigate("/dashboard");
    } catch (error) {
      alert(error.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-navy-900">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2"
        >
          ← Back
        </Link>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
            Rider Login
          </h1>
          <p className="text-sm text-sand-400 mb-6">
            Enter your phone number to access your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 shadow-amber text-white font-bold py-3 rounded-xl transition"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-sand-400 mt-4">
            Not a rider?{' '}
            <Link to="/rider-register" className="text-amber-700 hover:underline">
              Register as rider
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
