import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPhone } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(phone);
      navigate("/request");
    } catch (err) {
      setError(err.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-amber-50 text-navy-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 border border-sand-200">
        <Link
          to="/"
          className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2 font-medium"
        >
          ← Back
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPhone className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
            Customer Login
          </h1>
          <p className="text-sm text-sand-400">
            Use your phone number to access your ride history and requests.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

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
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 shadow-amber text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-sand-400 mt-4">
          New here?{' '}
          <Link to="/register" className="text-amber-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
