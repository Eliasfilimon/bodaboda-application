import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { api } from "../config/api.js";
import { dodoma_locations } from "../data/mockData";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    defaultLocation: user?.defaultLocation || "Dodoma CBD",
    paymentMethods: user?.paymentMethods || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentToggle = (method) => {
    setFormData((prev) => {
      const hasMethod = prev.paymentMethods.includes(method);
      return {
        ...prev,
        paymentMethods: hasMethod
          ? prev.paymentMethods.filter((item) => item !== method)
          : [...prev.paymentMethods, method],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await api.users.update(user.id, formData, token);
      updateUser(formData);
      alert('Profile updated successfully');
    } catch (error) {
      setError(error.error || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-sand-50 text-navy-900">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/register"
            className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2"
          >
            ← Go to registration
          </Link>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <p className="text-sand-400">No profile found. Register first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 text-navy-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2"
        >
          ← Back
        </Link>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
            Your Profile
          </h1>
          <p className="text-sm text-sand-400 mb-6">
            Update your details and linked payment methods.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Default Pickup Location
              </label>
              <select
                name="defaultLocation"
                value={formData.defaultLocation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-sand-300 rounded-xl focus:outline-none focus:border-amber-500"
              >
                {dodoma_locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-semibold text-navy-900 mb-2">Payment methods</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "M-Pesa",
                  "Tigo Pesa",
                  "Airtel Money",
                ].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handlePaymentToggle(method)}
                    className={`border rounded-xl px-3 py-2 text-sm font-medium transition ${
                      formData.paymentMethods.includes(method)
                        ? "border-amber-500 bg-amber-300/30 text-amber-700"
                        : "border-sand-300 text-navy-800"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-amber-500 hover:bg-amber-600 shadow-amber text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full border-2 border-flame-500 text-flame-500 font-bold py-3 rounded-xl hover:bg-flame-50 transition"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
