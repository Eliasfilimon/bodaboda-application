import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dodoma_locations } from '../data/mockData';
import { validateName, validatePhoneNumber, validatePlateNumber, validateForm } from '../utils/validation';
import { FiInfo } from 'react-icons/fi';
import { HiOutlineArrowLeft, HiOutlineUser, HiOutlineArrowPath } from 'react-icons/hi2';

export const RiderRegisterPage = () => {
  const navigate = useNavigate();
  const { riderRegister } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: 'Dodoma CBD',
    plateNumber: '',
    vehicleModel: 'Motorcycle',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    if (name === 'name')        return validateName(value);
    if (name === 'phone')       return validatePhoneNumber(value);
    if (name === 'plateNumber') return validatePlateNumber(value);
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
    const nv  = validateName(formData.name);
    const pv  = validatePhoneNumber(formData.phone);
    const plv = validatePlateNumber(formData.plateNumber);
    const { isValid, errors: ve } = validateForm({ name: nv, phone: pv, plateNumber: plv });
    if (!isValid) { setErrors(ve); setTouched({ name: true, phone: true, plateNumber: true }); return; }

    setIsLoading(true);
    try {
      await riderRegister({
        name: nv.normalizedName,
        phone: pv.normalizedPhone,
        location: formData.location,
        plateNumber: plv.normalizedPlate,
        vehicleModel: formData.vehicleModel,
      });
      // Skip OTP and route directly
      navigate('/dashboard', { replace: true });
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
        <span className="ml-2 font-bold text-lg text-twende-text">Join as a Rider</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full bg-white sm:my-8 sm:rounded-2xl sm:border sm:border-twende-border sm:shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-twende-text mb-2 tracking-tight">Rider Registration</h1>
          <p className="text-twende-text-secondary text-base">Register to start accepting rides and earn.</p>
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
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required 
              placeholder="e.g. Juma Hassan"
              className={`w-full bg-white border ${touched.name && errors.name ? 'border-twende-error focus:ring-twende-error' : 'border-twende-border focus:border-twende-brand focus:ring-twende-brand'} rounded-xl px-4 py-4 text-base font-medium text-twende-text placeholder:text-gray-400 focus:ring-1 outline-none transition-all`} 
            />
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

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Plate Number */}
            <div>
              <label className="block text-sm font-semibold text-twende-text mb-2">Plate Number</label>
              <input 
                type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} onBlur={handleBlur} required 
                placeholder="T 123 ABC"
                className={`w-full bg-white border ${touched.plateNumber && errors.plateNumber ? 'border-twende-error focus:ring-twende-error' : 'border-twende-border focus:border-twende-brand focus:ring-twende-brand'} rounded-xl px-4 py-4 text-base font-medium text-twende-text placeholder:text-gray-400 focus:ring-1 outline-none transition-all uppercase`} 
              />
              {touched.plateNumber && errors.plateNumber && <p className="text-twende-error text-xs mt-1.5 font-medium pl-1">{errors.plateNumber}</p>}
            </div>

            {/* Operating Area */}
            <div>
              <label className="block text-sm font-semibold text-twende-text mb-2">Operating Area</label>
              <select name="location" value={formData.location} onChange={handleChange}
                className="w-full bg-white border border-twende-border focus:border-twende-brand focus:ring-1 focus:ring-twende-brand rounded-xl px-4 py-4 text-base font-medium text-twende-text outline-none appearance-none">
                {dodoma_locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Vehicle Model */}
          <div>
            <label className="block text-sm font-semibold text-twende-text mb-2">Vehicle Model <span className="text-twende-text-secondary text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-md">Optional</span></label>
            <input 
              type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange}
              placeholder="e.g. Boxer BM 150"
              className="w-full bg-white border border-twende-border focus:border-twende-brand focus:ring-1 focus:ring-twende-brand rounded-xl px-4 py-4 text-base font-medium text-twende-text placeholder:text-gray-400 outline-none transition-all" 
            />
          </div>

          <div className="bg-twende-info/5 border border-twende-info/20 rounded-xl p-4 mt-2">
            <h4 className="text-twende-info font-bold text-sm mb-2 flex items-center gap-1"><FiInfo /> Requirements</h4>
            <ul className="text-twende-text-secondary text-xs space-y-1.5 pl-5 list-disc">
              <li>Valid Tanzanian motorcycle licence</li>
              <li>Vehicle insurance up to date</li>
              <li>Approval pending admin verification</li>
            </ul>
          </div>

          <div className="mt-8 space-y-4 pt-2">
            <button type="submit" disabled={isLoading}
              className="w-full bg-twende-brand text-white py-4 rounded-xl font-bold text-lg hover:bg-twende-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
              {isLoading ? <><HiOutlineArrowPath className="animate-spin" /> Registering...</> : 'Complete Registration'}
            </button>
            
            <p className="text-center text-sm text-twende-text-secondary mt-4">
              Already registered? <Link to="/rider-login" className="text-twende-brand font-bold hover:underline">Log in</Link>
            </p>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-twende-border"></div></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-twende-text-secondary">or</span></div>
            </div>

            <Link 
              to="/register"
              className="w-full bg-gray-50 border border-twende-border text-twende-text py-4 rounded-xl font-bold text-base hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineUser className="text-twende-text-secondary" /> Register as a Passenger
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};
