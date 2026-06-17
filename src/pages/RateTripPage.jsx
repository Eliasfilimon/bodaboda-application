import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../config/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FiChevronLeft, FiMessageSquare } from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';
import { HiOutlineCheckCircle, HiOutlineStar, HiOutlineMapPin, HiOutlineExclamationTriangle, HiOutlineArrowPath } from 'react-icons/hi2';

export const RateTripPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchTrip = useCallback(async () => {
    try {
      const data = await api.trips.get(tripId);
      if (!data) { setError('Trip not found.'); return; }
      if (data.rating) { setSubmitted(true); setRating(data.rating); }
      setTrip(data);
    } catch {
      setError('Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setIsSubmitting(true); setError(null);
    try {
      const token = localStorage.getItem('token');
      await api.trips.rate(tripId, { rating, review }, token);
      setSubmitted(true);
      setTimeout(() => navigate('/history'), 1800);
    } catch (err) {
      setError(err.error || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading trip..." />;

  const riderName = trip?.rider || trip?.riderName || 'your rider';

  if (submitted) return (
    <div className="min-h-screen bg-twende-navy text-twende-text flex items-center justify-center px-4 font-jakarta relative">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-twende-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="glass-panel rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl relative z-10 border border-twende-border">
        <HiOutlineCheckCircle className="text-6xl mb-4 text-twende-primary mx-auto animate-bounce" />
        <p className="font-black text-twende-text text-2xl mb-2 drop-shadow-md">Thank you!</p>
        <p className="text-twende-text-secondary text-sm mb-4">You rated {riderName}</p>
        <div className="flex justify-center gap-2 my-5 bg-gray-100 py-4 rounded-2xl border border-white/5">
          {[1,2,3,4,5].map(s => <span key={s} className={`text-3xl filter drop-shadow-md transition-all ${s <= rating ? 'text-twende-accent scale-110' : 'text-twende-text-secondary'}`}>★</span>)}
        </div>
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-6 mb-3">
          <div className="h-full bg-twende-primary rounded-full animate-[progress_1.8s_ease-in-out]"></div>
        </div>
        <p className="text-xs text-twende-text-secondary uppercase tracking-widest font-bold">Redirecting to history...</p>
      </div>
    </div>
  );

  if (error && !trip) return (
    <div className="min-h-screen bg-twende-navy flex items-center justify-center px-4 font-jakarta">
      <div className="glass-panel rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-red-500/20">
        <p className="text-5xl mb-4 opacity-80 flex justify-center"><HiOutlineExclamationTriangle className="text-orange-400" /></p>
        <p className="font-bold text-twende-text mb-6 text-lg">{error}</p>
        <Link to="/history" className="inline-block w-full bg-gray-100 hover:bg-gray-100 text-twende-text py-4 rounded-xl font-bold transition-colors border border-twende-border">← Back to History</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-twende-navy font-jakarta text-twende-text relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-twende-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="glass-panel border-t-0 rounded-b-[2rem] px-4 pt-10 pb-8 shadow-lg relative z-10">
        <Link to="/history" className="text-twende-text-secondary text-sm mb-4 inline-flex items-center gap-2 hover:text-twende-text transition-colors bg-gray-100 px-3 py-1.5 rounded-lg border border-twende-border hover:bg-gray-100">
          <FiChevronLeft /> Back to History
        </Link>
        <h1 className="text-3xl font-black text-twende-text mt-2">Rate Your Ride</h1>
        <p className="text-twende-text-secondary text-sm mt-2">How was your experience with <span className="font-bold text-twende-text">{riderName}</span>?</p>
      </div>

      <div className="px-4 py-8 max-w-md mx-auto pb-28 relative z-10">
        {trip && (
          <div className="glass-panel rounded-2xl p-5 shadow-lg mb-6 border-twende-border">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-twende-primary flex-shrink-0 shadow-glow" />
              <span className="text-twende-text font-semibold">{trip.pickup || trip.pickupLocation || '—'}</span>
            </div>
            <div className="w-0.5 h-4 bg-gray-100 ml-1 my-1.5" />
            <div className="flex items-center gap-3 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-twende-accent flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-twende-text-secondary">{trip.dropoff || trip.dropoffLocation || '—'}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-twende-border flex justify-between items-center text-sm">
              <span className="text-twende-text-secondary uppercase tracking-widest font-bold text-[10px]">Fare Paid</span>
              <span className="font-black text-twende-primary text-base drop-shadow-sm">TZS {parseFloat(trip.fare || 0).toLocaleString()}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-2xl p-4 mb-6 text-sm backdrop-blur-sm shadow-lg flex items-start gap-3">
            <HiOutlineExclamationTriangle className="text-lg flex-shrink-0 mt-0.5" />
            <span className="mt-0.5">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 shadow-xl space-y-8 border-twende-border relative overflow-hidden">
          {/* Subtle form background glow */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-twende-accent/5 rounded-full blur-[50px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <p className="text-sm font-bold text-twende-text mb-4 uppercase tracking-widest flex items-center gap-2"><HiOutlineStar className="text-twende-primary" /> Tap a star to rate</p>
            <div className="flex gap-2 justify-between bg-gray-100 p-4 rounded-2xl border border-white/5">
              {[1,2,3,4,5].map(v => (
                <button key={v} type="button"
                  onClick={() => setRating(v)}
                  onMouseEnter={() => setHover(v)}
                  onMouseLeave={() => setHover(0)}
                  className="text-4xl transition-all transform hover:scale-125 focus:outline-none drop-shadow-md">
                  <HiOutlineStar className={`text-4xl transition-all transform hover:scale-125 focus:outline-none drop-shadow-md ${v <= (hover || rating) ? 'text-twende-accent fill-current' : 'text-twende-text-secondary'}`} />
                </button>
              ))}
            </div>
            <div className="h-6 mt-3 text-center">
              {rating > 0 && (
                <span className="text-sm font-bold inline-block px-4 py-1 rounded-full bg-gray-100 border border-twende-border text-twende-text shadow-sm">
                  {['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Very Good 😊', 'Excellent 🌟'][rating]}
                </span>
              )}
            </div>
          </div>

          <div className="relative z-10">
            <label className="block text-xs font-bold text-twende-text-secondary uppercase tracking-widest mb-2">Comment <span className="font-normal opacity-50">(optional)</span></label>
            <textarea value={review} onChange={e => setReview(e.target.value)}
              placeholder="Share details about your experience..."
              rows={3}
              className="w-full border border-twende-border bg-gray-100 rounded-2xl px-5 py-4 text-sm text-twende-text focus:border-twende-primary focus:bg-gray-100 focus:outline-none resize-none transition-colors placeholder:text-twende-text-secondary" />
          </div>

          <button type="submit" disabled={isSubmitting || rating === 0}
            className="w-full bg-twende-primary hover:bg-twende-primary-dark text-white py-4 rounded-2xl font-black text-base shadow-glow transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2 relative z-10">
            {isSubmitting
              ? <><HiOutlineArrowPath className="animate-spin" /> Submitting...</>
              : <><HiOutlineStar /> Submit Rating</>}
          </button>
        </form>
      </div>
    </div>
  );
};
