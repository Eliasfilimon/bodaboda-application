import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { api } from "../config/api.js";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

export const RateTripPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await api.trips.get(tripId);
        setTrip(tripData);
      } catch (error) {
        console.error('Failed to fetch trip:', error);
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId, navigate]);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await api.trips.rate(tripId, { rating, review }, token);
      alert("Thank you for your feedback!");
      navigate("/history");
    } catch (error) {
      setError(error.error || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading trip details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-sand-50 text-navy-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sand-400 mb-4">Trip not found</p>
          <Link
            to="/history"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-xl transition"
          >
            View Trip History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 text-navy-900">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/history"
          className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2"
        >
          ← Back to History
        </Link>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
            Rate Your Ride
          </h1>
          <p className="text-sm text-sand-400 mb-6">
            How was your experience with {trip.rider}?
          </p>

          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-sand-400 mb-2">
              <span>Route:</span>
              <span className="text-navy-900 font-medium">
                {trip.pickup} → {trip.dropoff}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-sand-400">
              <span>Fare:</span>
              <span className="text-navy-900 font-medium">
                TZS {trip.fare.toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-3">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleStarClick(value)}
                    className={`text-3xl transition ${
                      value <= rating
                        ? "text-amber-500"
                        : "text-sand-300 hover:text-amber-400"
                    }`}
                  >
                    <FiStar />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full px-4 py-2 border border-sand-300 rounded-xl focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 shadow-amber text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
