import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { dodoma_locations } from "../data/mockData";
import { validateName, validatePhoneNumber, validateForm } from "../utils/validation";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    defaultLocation: "Dodoma CBD",
    paymentMethod: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'phone':
        return validatePhoneNumber(value);
      default:
        return { isValid: true };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const validation = validateField(name, value);
    if (!validation.isValid) {
      setErrors((prev) => ({ ...prev, [name]: validation.error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const nameValidation = validateName(formData.name);
    const phoneValidation = validatePhoneNumber(formData.phone);
    
    const { isValid, errors: validationErrors } = validateForm({
      name: nameValidation,
      phone: phoneValidation
    });
    
    if (!isValid) {
      setErrors(validationErrors);
      setTouched({ name: true, phone: true });
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        name: nameValidation.normalizedName,
        phone: phoneValidation.normalizedPhone,
        defaultLocation: formData.defaultLocation,
        paymentMethod: formData.paymentMethod
      });
      navigate("/request");
    } catch (error) {
      setErrors({ submit: error.error || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    alert('Google sign-in is not available yet. Please register with your phone number.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-amber-50 text-navy-900">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2 font-medium"
        >
          ← Back
        </Link>
        <div className="bg-white rounded-2xl shadow-card p-8 border border-sand-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
              Create your account
            </h1>
            <p className="text-sm text-sand-400">
              Register to request rides and save your pickup location.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full border border-sand-300 rounded-xl py-3 text-sm font-semibold text-navy-900 hover:bg-sand-50 transition flex items-center justify-center gap-2"
          >
            <FiMail /> Google Sign-In Coming Soon
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-sand-400">
            <div className="h-px flex-1 bg-sand-200" />
            or register with your details
            <div className="h-px flex-1 bg-sand-200" />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onBlur={handleBlur}
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none transition ${
                    touched.name && errors.name
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-sand-300 focus:border-amber-500'
                  }`}
                />
              </div>
              {touched.name && errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
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
                  onBlur={handleBlur}
                  placeholder="+255 7XX XXX XXX or 07XX XXX XXX"
                  required
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none transition ${
                    touched.phone && errors.phone
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-sand-300 focus:border-amber-500'
                  }`}
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
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
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Optional Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-sand-300 rounded-xl focus:outline-none focus:border-amber-500"
              >
                <option value="">Cash only</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Tigo Pesa">Tigo Pesa</option>
                <option value="Airtel Money">Airtel Money</option>
              </select>
              <p className="text-xs text-sand-400 mt-2">
                You can link a payment method later in your profile.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 shadow-amber text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
