import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dodoma_locations } from '../data/mockData';
import { validateName, validatePhoneNumber, validateForm } from '../utils/validation';

import { HiOutlineArrowLeft, HiOutlineUser, HiOutlinePhone, HiOutlineArrowPath } from 'react-icons/hi2';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    defaultLocation: 'Dodoma CBD',
    paymentMethod: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    if (name === 'name')  return validateName(value);
    if (name === 'phone') return validatePhoneNumber(value);
    if (name === 'emergencyContact' && value) return validatePhoneNumber(value);
    return { isValid: true };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    const v = validateField(name, value);
    if (!v.isValid) setErrors(p => ({ ...p, [name]: v.error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nv = validateName(formData.name);
    const pv = validatePhoneNumber(formData.phone);
    const { isValid, errors: ve } = validateForm({ name: nv, phone: pv });
    
    if (formData.emergencyContact) {
       const ev = validatePhoneNumber(formData.emergencyContact);
       if (!ev.isValid) { ve.emergencyContact = ev.error; }
    }

    if (!isValid || Object.keys(ve).length > 0) { 
      setErrors(ve); 
      setTouched({ name: true, phone: true, emergencyContact: true }); 
      return; 
    }

    setIsLoading(true);
    try {
      await register({
        name: nv.normalizedName,
        phone: pv.normalizedPhone,
        emergencyContact: formData.emergencyContact || null,
        defaultLocation: formData.defaultLocation,
        paymentMethod: formData.paymentMethod,
      });
      // In a real app, redirect to OTP verification here.
      navigate('/passenger-dashboard', { replace: true });
    } catch (err) {
      setErrors({ submit: err.error || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-twende-background font-poppins flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center bg-white border-b border-twende-border sticky top-0 z-50">
        <Link to="/" className="p-2 -ml-2 text-twende-text hover:bg-gray-50 rounded-full transition-colors">
          <HiOutlineArrowLeft className="text-xl" />
        </Link>
        <span className="ml-2 font-bold text-lg text-twende-text">Sign up</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full bg-white sm:my-8 sm:rounded-2xl sm:border sm:border-twende-border sm:shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-twende-text mb-2 tracking-tight">Create account</h1>
          <p className="text-twende-text-secondary text-base">Fill in your details to start riding.</p>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-twende-error rounded-xl p-4 mb-6 text-sm flex items-start gap-2">
            <span className="font-bold text-red-500 mt-0.5">!</span>
            <p>{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-twende-text mb-2">Full Name</label>
            <div className="relative">
              <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-twende-text-secondary text-lg" />
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required 
                placeholder="John Doe"
                className={`w-full bg-white border ${touched.name && errors.name ? 'border-twende-error focus:ring-twende-error' : 'border-twende-border focus:border-twende-brand focus:ring-twende-brand'} rounded-xl pl-12 pr-4 py-4 text-base font-medium text-twende-text placeholder:text-gray-400 focus:ring-1 outline-none transition-all`} 
              />
            </div>
            {touched.name && errors.name && <p className="text-twende-error text-xs mt-1.5 font-medium pl-1">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-twende-text mb-2">Phone Number</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center gap-2">
                <span className="text-twende-text-secondary text-base font-medium">🇹🇿</span>
                <span className="text-twende-text font-medium border-r border-twende-border pr-2">+255</span>
              </div>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required 
                placeholder="7XX XXX XXX"
                className={`w-full bg-white border ${touched.phone && errors.phone ? 'border-twende-error focus:ring-twende-error' : 'border-twende-border focus:border-twende-brand focus:ring-twende-brand'} rounded-xl pl-[88px] pr-4 py-4 text-base font-medium text-twende-text placeholder:text-gray-400 focus:ring-1 outline-none transition-all`} 
              />
            </div>
            {touched.phone && errors.phone && <p className="text-twende-error text-xs mt-1.5 font-medium pl-1">{errors.phone}</p>}
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-semibold text-twende-text mb-2 flex items-center gap-2">
              Emergency Contact <span className="text-twende-text-secondary text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-md">Optional</span>
            </label>
            <div className="relative">
              <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-twende-text-secondary text-lg" />
              <input 
                type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} onBlur={handleBlur}
                placeholder="07XX XXX XXX"
                className={`w-full bg-white border ${touched.emergencyContact && errors.emergencyContact ? 'border-twende-error focus:ring-twende-error' : 'border-twende-border focus:border-twende-brand focus:ring-twende-brand'} rounded-xl pl-12 pr-4 py-4 text-base font-medium text-twende-text placeholder:text-gray-400 focus:ring-1 outline-none transition-all`} 
              />
            </div>
            {touched.emergencyContact && errors.emergencyContact && <p className="text-twende-error text-xs mt-1.5 font-medium pl-1">{errors.emergencyContact}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-twende-text mb-2">Primary Area</label>
              <select name="defaultLocation" value={formData.defaultLocation} onChange={handleChange}
                className="w-full bg-white border border-twende-border focus:border-twende-brand focus:ring-1 focus:ring-twende-brand rounded-xl px-4 py-4 text-sm font-medium text-twende-text outline-none appearance-none">
                {dodoma_locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-twende-text mb-2">Payment</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}
                className="w-full bg-white border border-twende-border focus:border-twende-brand focus:ring-1 focus:ring-twende-brand rounded-xl px-4 py-4 text-sm font-medium text-twende-text outline-none appearance-none">
                <option value="">Cash</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Tigo Pesa">Tigo Pesa</option>
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-4 pt-4">
            <button type="submit" disabled={isLoading}
              className="w-full bg-twende-brand text-white py-4 rounded-xl font-bold text-lg hover:bg-twende-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
              {isLoading ? <><HiOutlineArrowPath className="animate-spin" /> Creating account...</> : 'Continue'}
            </button>
            
            <p className="text-center text-sm text-twende-text-secondary mt-4">
              Already have an account? <Link to="/login" className="text-twende-brand font-bold hover:underline">Log in</Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};
