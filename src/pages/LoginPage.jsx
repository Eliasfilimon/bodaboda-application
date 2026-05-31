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
      const response = await login(phone);
      const role = response?.role || response?.user?.role || "user";
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "rider") {
        navigate("/rider/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-twende-light to-sand-50 text-twende-text flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-twende-white rounded-2xl shadow-card p-8 border border-sand-200">
        <Link
          to="/"
          className="text-twende-text hover:text-twende-primary transition mb-4 inline-flex items-center gap-2 font-medium"
        >
          ← Back
        </Link>

        <div className="text-center mb-6">
          <p className="text-xl font-bold text-twende-primary mb-3">BodaBoda</p>
          <div className="w-16 h-16 bg-twende-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPhone className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-twende-text mb-2">
            Customer Login
          </h1>
          <p className="text-sm text-twende-gray">
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
            <label className="block text-sm font-semibold text-twende-text mb-2">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-twende-gray" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255 7XX XXX XXX"
                required
                className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-xl focus:outline-none focus:border-twende-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-twende-primary hover:bg-twende-dark text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-twende-gray mt-4">
          New here?{' '}
          <Link to="/register" className="text-twende-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
