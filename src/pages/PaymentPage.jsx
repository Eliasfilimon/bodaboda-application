import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiPhone, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api.js';
import { Toast } from '../components/Toast';

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', icon: '💵', description: 'Pay driver directly' },
  { id: 'M-Pesa', label: 'M-Pesa', icon: '📱', description: 'Vodacom M-Pesa' },
  { id: 'Tigo Pesa', label: 'Tigo Pesa', icon: '📲', description: 'Tigo Pesa Mobile Money' },
  { id: 'Airtel Money', label: 'Airtel Money', icon: '📡', description: 'Airtel Money Transfer' },
];

export const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();

  const tripId = searchParams.get('tripId');
  const fareParam = searchParams.get('fare');
  const fare = fareParam ? Number(fareParam) : 0;

  const [selected, setSelected] = useState('Cash');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const handlePay = async () => {
    if (!tripId) {
      setToast({ show: true, message: 'No trip selected.' });
      return;
    }
    if (selected !== 'Cash' && !phone.match(/^\+?\d{9,15}$/)) {
      setToast({ show: true, message: 'Please enter a valid phone number.' });
      return;
    }
    setLoading(true);
    try {
      await api.trips.complete(tripId, null, token);
      setPaid(true);
      setToast({ show: true, message: `Payment via ${selected} successful! 🎉` });
      setTimeout(() => navigate('/history'), 2200);
    } catch (err) {
      setToast({ show: true, message: err.message || 'Payment failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-gray-950 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment</h1>
        </div>

        {/* Fare Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiDollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trip Fare</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">TZS {fare.toLocaleString()}</p>
            </div>
          </div>
          {tripId && (
            <p className="text-xs text-gray-400">Trip #{tripId}</p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 mb-5">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <FiCreditCard size={16} /> Select Payment Method
          </h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                  selected === m.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={m.id}
                  checked={selected === m.id}
                  onChange={() => setSelected(m.id)}
                  className="accent-green-600"
                />
                <span className="text-xl">{m.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{m.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{m.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Phone for mobile money */}
        {selected !== 'Cash' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FiPhone className="inline mr-1" size={14} /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+255 7XX XXX XXX"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {/* Pay Button */}
        {paid ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <FiCheckCircle size={48} className="text-green-500" />
            <p className="text-lg font-bold text-green-600">Payment Successful!</p>
            <p className="text-sm text-gray-500">Redirecting to your history…</p>
          </div>
        ) : (
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> Processing…</>
            ) : (
              <><FiCheckCircle size={18} /> Pay TZS {fare.toLocaleString()}</>
            )}
          </button>
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          onClose={() => setToast({ show: false, message: '' })}
        />
      )}
    </div>
  );
};
