import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api.js';
import { dodoma_locations } from '../data/mockData';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FaMotorcycle } from 'react-icons/fa';

import { HiOutlineArrowLeft, HiOutlineUser, HiOutlineMapPin, HiOutlinePhone, HiOutlineArrowRightOnRectangle, HiOutlineCreditCard, HiOutlineExclamationTriangle } from 'react-icons/hi2';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, rider, userType, token, updateUser, logout, loading } = useAuth();
  const isRider = userType === 'rider';
  const profile = isRider ? rider : user;

  const [formData, setFormData] = useState({
    name: profile?.name || profile?.fullName || '',
    phone: profile?.phone || '',
    defaultLocation: user?.defaultLocation || 'Dodoma CBD',
    paymentMethods: user?.paymentMethods || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handlePaymentToggle = (method) => {
    setFormData(p => {
      const has = p.paymentMethods.includes(method);
      return { ...p, paymentMethods: has ? p.paymentMethods.filter(m => m !== method) : [...p.paymentMethods, method] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true); setError(null);
    try {
      if (!isRider) {
        await api.users.update(user.id, formData, token);
        updateUser(formData);
      }
      showToast('Profile updated successfully');
    } catch (err) {
      setError(err.error || 'Update failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  if (!profile) return (
    <div className="min-h-screen bg-twende-background flex items-center justify-center px-6 font-poppins">
      <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-sm border border-twende-border">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineUser className="text-2xl text-twende-text-secondary" />
        </div>
        <h2 className="font-bold text-twende-text mb-2 text-xl">No Profile Found</h2>
        <p className="text-sm text-twende-text-secondary mb-8">Please register or log in first to view your profile.</p>
        <Link to="/register" className="inline-block w-full bg-twende-primary hover:bg-twende-primary-hover text-white py-4 rounded-xl font-bold transition-all shadow-sm">Register</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-twende-background font-poppins pb-12">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 animate-[slideDown_0.3s_ease-out] ${
          toast.type === 'success' ? 'bg-twende-success text-white' : 'bg-twende-error text-white'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-twende-border sticky top-0 z-30">
        <div className="px-6 py-4 max-w-md mx-auto flex items-center gap-4">
          <Link to={isRider ? '/dashboard' : '/passenger-dashboard'} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-twende-text hover:bg-gray-200 transition-colors">
            <HiOutlineArrowLeft className="text-lg" />
          </Link>
          <h1 className="font-bold text-xl text-twende-text">Profile</h1>
        </div>
      </header>

      <main className="px-6 py-8 max-w-md mx-auto">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-twende-border shadow-sm p-6 flex items-center gap-5 mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-twende-text font-black text-2xl border border-twende-border shrink-0">
            {(profile?.name || profile?.fullName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-2xl text-twende-text truncate">{profile?.name || profile?.fullName || 'User'}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded text-twende-text flex items-center gap-1 shrink-0">
                {isRider ? <FaMotorcycle /> : <HiOutlineUser />} {isRider ? 'Rider' : 'Passenger'}
              </span>
              <span className="text-twende-text-secondary text-sm truncate">{profile?.phone || ''}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-twende-error/10 border border-twende-error/20 text-twende-error rounded-xl p-4 mb-6 text-sm flex items-start gap-3">
            <HiOutlineExclamationTriangle className="text-lg shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isRider ? (
          /* Rider profile — read-only summary */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-twende-border">
              <h3 className="font-bold text-twende-text mb-5 text-lg">Rider Details</h3>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: rider?.name || rider?.fullName },
                  { label: 'Phone Number', value: rider?.phone },
                  { label: 'Operating Area', value: rider?.location },
                  { label: 'Plate Number', value: rider?.vehicleInfo?.plateNumber || rider?.plateNumber },
                  { label: 'Vehicle Model', value: rider?.vehicleInfo?.model || rider?.vehicleModel || 'Motorcycle' },
                  { label: 'Lifetime Trips', value: rider?.trips || 0 },
                  { label: 'Rating', value: rider?.rating ? `${rider.rating} ⭐` : 'New' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-twende-border last:border-0">
                    <span className="text-twende-text-secondary text-sm font-semibold">{label}</span>
                    <span className="font-bold text-twende-text text-sm text-right pl-4">{value ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-twende-info/10 border border-twende-info/20 rounded-xl p-4 text-center">
              <p className="text-twende-info text-sm font-semibold">To update your rider details or vehicle information, please contact BodaGo support.</p>
            </div>
          </div>
        ) : (
          /* Passenger profile — editable */
          <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-twende-border space-y-5">
              <h3 className="font-bold text-twende-text mb-2 text-lg">Personal Details</h3>

              <div>
                <label className="block text-sm font-semibold text-twende-text mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-twende-text-secondary"><HiOutlineUser /></div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full bg-gray-50 border border-twende-border rounded-xl pl-11 pr-4 py-3.5 text-base font-medium text-twende-text focus:border-twende-primary focus:ring-1 focus:ring-twende-primary outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-twende-text mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-twende-text-secondary"><HiOutlinePhone /></div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                    className="w-full bg-gray-50 border border-twende-border rounded-xl pl-11 pr-4 py-3.5 text-base font-medium text-twende-text focus:border-twende-primary focus:ring-1 focus:ring-twende-primary outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-twende-text mb-2">Primary Area</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-twende-text-secondary"><HiOutlineMapPin /></div>
                  <select name="defaultLocation" value={formData.defaultLocation} onChange={handleChange}
                    className="w-full bg-gray-50 border border-twende-border rounded-xl pl-11 pr-4 py-3.5 text-base font-medium text-twende-text focus:border-twende-primary focus:ring-1 focus:ring-twende-primary outline-none transition-all appearance-none">
                    {dodoma_locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-twende-border">
              <h3 className="font-bold text-twende-text mb-4 text-lg flex items-center gap-2"><HiOutlineCreditCard /> Payment Methods</h3>
              <div className="grid grid-cols-2 gap-3">
                {['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Cash'].map(method => {
                  const isSelected = formData.paymentMethods.includes(method) || (method === 'Cash' && formData.paymentMethods.length === 0);
                  return (
                    <button key={method} type="button" onClick={() => method !== 'Cash' && handlePaymentToggle(method)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                        isSelected
                          ? 'border-twende-primary bg-twende-primary/10 text-twende-primary'
                          : 'border-twende-border bg-gray-50 text-twende-text hover:bg-gray-100'
                      }`}>
                        {method}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={isSaving}
              className="w-full bg-twende-primary hover:bg-twende-primary-hover text-white py-4 rounded-xl font-bold text-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving
                ? <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5" /> Saving...</>
                : 'Save Changes'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-twende-border">
          <button type="button" onClick={handleLogout}
            className="w-full py-4 rounded-xl border border-twende-error/30 bg-twende-error/5 text-twende-error font-bold text-base hover:bg-twende-error/10 transition-colors flex items-center justify-center gap-2">
            <HiOutlineArrowRightOnRectangle /> Logout
          </button>
        </div>
      </main>
    </div>
  );
};
