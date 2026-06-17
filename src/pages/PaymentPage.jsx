import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api.js';
import { FiDollarSign, FiSmartphone, FiRadio, FiChevronLeft } from 'react-icons/fi';
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineArrowPath } from 'react-icons/hi2';

const PAYMENT_METHODS = [
  { id: 'Cash',         label: 'Cash',         Icon: FiDollarSign,  desc: 'Pay driver directly on arrival' },
  { id: 'M-Pesa',       label: 'M-Pesa',       Icon: FiSmartphone,  desc: 'Vodacom M-Pesa mobile money' },
  { id: 'Tigo Pesa',    label: 'Tigo Pesa',    Icon: FiSmartphone,  desc: 'Tigo Pesa mobile money' },
  { id: 'Airtel Money', label: 'Airtel Money', Icon: FiRadio,       desc: 'Airtel Money transfer' },
];

export const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, rider, userType, token } = useAuth();

  const tripId  = searchParams.get('tripId');
  const fare    = Number(searchParams.get('fare') || 0);

  const [selected, setSelected] = useState('Cash');
  const [phone, setPhone]       = useState((userType === 'user' ? user?.phone : rider?.phone) || '');
  const [loading, setLoading]   = useState(false);
  const [paid, setPaid]         = useState(false);
  const [toast, setToast]       = useState(null);
  const [error, setError]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePay = async () => {
    if (!tripId) { setError('No trip ID found. Please go back and try again.'); return; }
    if (selected !== 'Cash' && !phone.match(/^\+?\d{9,15}$/)) {
      setError('Please enter a valid phone number for mobile payment.'); return;
    }
    setLoading(true); setError(null);
    try {
      // Pass the actual riderId so rider earnings update correctly
      const riderId = userType === 'rider' ? rider?.id : null;
      await api.trips.complete(tripId, riderId, token);
      setPaid(true);
      showToast(`✅ Payment via ${selected} successful!`);
      setTimeout(() => navigate('/history'), 2200);
    } catch (err) {
      setError(err.message || err.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (paid) return (
    <div className="min-h-screen bg-twende-navy text-twende-text flex items-center justify-center px-4 font-jakarta relative">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-twende-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glass-panel rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl relative z-10 border border-twende-border">
        <HiOutlineCheckCircle className="text-6xl mb-4 text-twende-primary animate-bounce mx-auto" />
        <p className="font-black text-twende-text text-2xl mb-2 drop-shadow-md">Payment Successful!</p>
        <p className="text-twende-text-secondary text-sm mb-4">via {selected}</p>
        <p className="font-black text-twende-primary text-3xl mb-6 drop-shadow-[0_0_15px_rgba(0,168,107,0.3)]">TZS {fare.toLocaleString()}</p>
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-6 mb-3">
          <div className="h-full bg-twende-primary rounded-full animate-[progress_2.2s_ease-in-out]"></div>
        </div>
        <p className="text-xs text-twende-text-secondary uppercase tracking-widest font-bold mt-3">Redirecting to your history...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-twende-navy font-jakarta text-twende-text relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-twende-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-twende-text text-sm font-bold max-w-xs w-full text-center backdrop-blur-md border ${
          toast.type === 'success' ? 'bg-twende-primary/90 border-twende-primary/50' : 'bg-red-500/90 border-red-500/50'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="glass-panel border-t-0 rounded-b-[2rem] px-4 pt-10 pb-8 shadow-lg relative z-10">
        <button onClick={() => navigate(-1)} className="text-twende-text-secondary text-sm mb-4 inline-flex items-center gap-2 hover:text-twende-text transition-colors bg-gray-100 px-3 py-1.5 rounded-lg border border-twende-border hover:bg-gray-100">
          <FiChevronLeft /> Back
        </button>
        <h1 className="text-3xl font-black text-twende-text mt-2">Complete Payment</h1>
        <p className="text-twende-text-secondary text-sm mt-2">Select how you'd like to pay</p>
      </div>

      <div className="px-4 py-8 max-w-md mx-auto pb-28 space-y-6 relative z-10">
        {/* Fare summary */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl border-twende-border text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-twende-primary/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
          <p className="text-xs text-twende-text-secondary uppercase tracking-widest font-bold mb-1 relative z-10">Trip Fare</p>
          <p className="text-4xl font-black text-twende-primary drop-shadow-[0_2px_10px_rgba(0,168,107,0.3)] relative z-10">TZS {fare.toLocaleString()}</p>
          {tripId && <p className="text-[10px] text-twende-text-secondary mt-3 font-medium bg-gray-100 inline-block px-3 py-1 rounded-full relative z-10 border border-white/5">Trip #{tripId}</p>}
        </div>

        {/* Payment method selector */}
        <div className="glass-panel rounded-3xl p-6 shadow-lg border-twende-border">
          <p className="text-xs font-bold text-twende-text-secondary uppercase tracking-widest mb-4">Payment Method</p>
          <div className="space-y-3">
            {PAYMENT_METHODS.map(m => (
              <label key={m.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all group ${
                  selected === m.id
                    ? 'border-twende-primary bg-twende-primary/10 shadow-[0_0_15px_rgba(0,168,107,0.1)]'
                    : 'border-twende-border bg-gray-100 hover:bg-gray-100 hover:border-twende-border'
                }`}>
                <div className="relative flex items-center justify-center">
                  <input type="radio" name="payment" value={m.id} checked={selected === m.id} onChange={() => setSelected(m.id)} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected === m.id ? 'border-twende-primary' : 'border-twende-border'}`}>
                    {selected === m.id && <div className="w-2.5 h-2.5 bg-twende-primary rounded-full shadow-glow"></div>}
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0">
                  <m.Icon className={`text-xl ${selected === m.id ? 'text-twende-primary' : 'text-twende-text-secondary'}`} />
                </div>
                <div>
                  <p className="font-bold text-twende-text text-sm">{m.label}</p>
                  <p className="text-xs text-twende-text-secondary mt-0.5 group-hover:text-twende-text-secondary transition-colors">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Phone number for mobile money */}
        {selected !== 'Cash' && (
          <div className="glass-panel rounded-3xl p-6 shadow-lg border-twende-border animate-fade-in">
            <label className="block text-xs font-bold text-twende-text-secondary uppercase tracking-widest mb-2 flex items-center gap-2"><FiSmartphone className="text-twende-accent" /> Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+255 7XX XXX XXX"
              className="w-full border border-twende-border rounded-2xl px-5 py-4 text-sm focus:border-twende-primary focus:bg-gray-100 focus:outline-none bg-gray-100 text-twende-text transition-colors placeholder:text-twende-text-secondary" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-2xl p-4 text-sm backdrop-blur-sm shadow-lg flex items-start gap-3">
            <HiOutlineExclamationTriangle className="text-lg flex-shrink-0 mt-0.5" />
            <span className="mt-0.5">{error}</span>
          </div>
        )}

        <button onClick={handlePay} disabled={loading}
          className="w-full bg-twende-primary hover:bg-twende-primary-dark text-white py-4 rounded-2xl font-black text-base shadow-glow transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2 mt-4">
          {loading
            ? <><HiOutlineArrowPath className="animate-spin" /> Processing...</>
            : <><HiOutlineCheckCircle /> Pay TZS {fare.toLocaleString()}</>}
        </button>

        <Link to="/history" className="block text-center text-xs text-twende-text-secondary uppercase tracking-widest font-bold hover:text-twende-primary transition-colors mt-6">View trip history</Link>
      </div>
    </div>
  );
};
