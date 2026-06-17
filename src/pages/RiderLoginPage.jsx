import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { HiOutlineArrowLeft, HiOutlineUser, HiOutlineArrowPath } from 'react-icons/hi2';

export function RiderLoginPage() {
  const navigate = useNavigate();
  const { riderLogin } = useAuth();
  const [phone, setPhone]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true); setError('');
    try {
      await riderLogin(phone);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-twende-background font-poppins flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center bg-white border-b border-twende-border sticky top-0 z-50">
        <Link to="/" className="p-2 -ml-2 text-twende-text hover:bg-gray-50 rounded-full transition-colors">
          <HiOutlineArrowLeft className="text-xl" />
        </Link>
        <span className="ml-2 font-bold text-lg text-twende-text">Rider Log in</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full bg-white sm:my-8 sm:rounded-2xl sm:border sm:border-twende-border sm:shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-twende-text mb-2 tracking-tight">Rider Portal</h1>
          <p className="text-twende-text-secondary text-base">Sign in to start accepting rides and earning.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-twende-error rounded-xl p-4 mb-6 text-sm flex items-start gap-2">
            <span className="font-bold text-red-500 mt-0.5">!</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
          <div>
            <label className="block text-sm font-semibold text-twende-text mb-2">Phone Number</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center gap-2">
                <span className="text-twende-text-secondary text-base font-medium">🇹🇿</span>
                <span className="text-twende-text font-medium border-r border-twende-border pr-2">+255</span>
              </div>
              <input 
                type="tel" 
                required 
                placeholder="7XX XXX XXX" 
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-white border border-twende-border rounded-xl pl-[88px] pr-4 py-4 text-base font-medium text-twende-text placeholder:text-gray-400 focus:border-twende-brand focus:ring-1 focus:ring-twende-brand outline-none transition-all" 
              />
            </div>
          </div>

          <div className="mt-auto pt-6 space-y-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-twende-brand text-white py-4 rounded-xl font-bold text-lg hover:bg-twende-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <><HiOutlineArrowPath className="animate-spin" /> Verifying...</> : 'Log in as Rider'}
            </button>
            
            <p className="text-center text-sm text-twende-text-secondary">
              Not registered yet? <Link to="/rider-register" className="text-twende-brand font-bold hover:underline">Register as Rider</Link>
            </p>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-twende-border"></div></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-twende-text-secondary">or</span></div>
            </div>

            <Link 
              to="/login"
              className="w-full bg-gray-50 border border-twende-border text-twende-text py-4 rounded-xl font-bold text-base hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineUser className="text-twende-text-secondary" /> Log in as a Passenger
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
