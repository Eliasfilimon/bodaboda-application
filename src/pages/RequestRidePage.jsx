import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { FiArrowRight, FiCheckCircle, FiCreditCard, FiMapPin, FiPhone, FiSearch, FiStar, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { api } from "../config/api.js";
import {
  dodoma_locations,
  getDistance,
  locationCoordinates,
} from "../data/mockData";
import { Toast } from "../components/Toast";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export const RequestRidePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    destination: "UDOM Campus",
    payment: user?.paymentMethods?.[0] || "Cash",
  });
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [destinationQuery, setDestinationQuery] = useState("UDOM Campus");
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [selectedRiderId, setSelectedRiderId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const data = await api.riders.getOnline();
        setRiders(data);
      } catch (error) {
        console.error('Failed to fetch riders:', error);
        setError('Failed to load available riders. Please try again.');
        setRiders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);

  useEffect(() => {
    const query = destinationQuery.trim();
    const timeout = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSuggesting(true);
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            `${query} Dodoma Tanzania`
          )}&limit=6`
        );
        const data = await response.json();
        const photonResults = (data?.features || []).map((feature) => ({
          label: feature.properties?.name || "Unknown",
          coords: [
            feature.geometry?.coordinates?.[1],
            feature.geometry?.coordinates?.[0],
          ],
        }));

        const localMatches = dodoma_locations
          .filter((location) =>
            location.toLowerCase().includes(query.toLowerCase())
          )
          .map((label) => ({
            label,
            coords: locationCoordinates[label] || null,
          }));

        const merged = [...localMatches, ...photonResults].slice(0, 8);
        setSuggestions(merged);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [destinationQuery]);

  const pickupLocation = user?.defaultLocation || "Dodoma CBD";

  const fareEstimate = useMemo(() => {
    const distance = getDistance(pickupLocation, formData.destination);
    return Math.round(500 + distance * 300);
  }, [pickupLocation, formData.destination]);

  const availableRiders = useMemo(
    () => riders.filter((r) => r.status === "online"),
    [riders]
  );

  const nearestRider = useMemo(() => {
    if (!availableRiders.length) return null;
    const pickupCoords = locationCoordinates[pickupLocation];
    if (!pickupCoords) return availableRiders[0];
    return [...availableRiders]
      .map((rider) => {
        const riderCoords = locationCoordinates[rider.location];
        if (!riderCoords) return { rider, distance: Number.POSITIVE_INFINITY };
        const dx = pickupCoords[0] - riderCoords[0];
        const dy = pickupCoords[1] - riderCoords[1];
        return { rider, distance: dx * dx + dy * dy };
      })
      .sort((a, b) => a.distance - b.distance)[0]?.rider;
  }, [availableRiders, pickupLocation]);

  const selectedRider = useMemo(
    () => riders.find((r) => r.id === selectedRiderId) || null,
    [riders, selectedRiderId]
  );

  useEffect(() => {
    if (!selectedRiderId && nearestRider) {
      const timeout = setTimeout(() => setSelectedRiderId(nearestRider.id), 0);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [nearestRider, selectedRiderId]);

  const selectedRiderFee = selectedRider ? Math.round(selectedRider.rating * 120) : 0;
  const totalEstimate = fareEstimate + selectedRiderFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;
    if (pickupLocation === formData.destination) return;
    if (!selectedRiderId) return;

    try {
      const pickupCoords = locationCoordinates[pickupLocation];
      const destCoords = destinationCoords || locationCoordinates[formData.destination];
      
      const tripData = {
        pickup: pickupLocation,
        pickupCoords: {
          lat: pickupCoords[0],
          lng: pickupCoords[1]
        },
        dropoff: formData.destination,
        dropoffCoords: {
          lat: destCoords[0],
          lng: destCoords[1]
        },
        riderId: selectedRiderId,
        fare: totalEstimate,
        paymentMethod: formData.payment || "Cash"
      };

      const response = await api.trips.create(tripData, localStorage.getItem('token'));
      const createdTripId = response?.id || response?.trip?.id;

      if (createdTripId) {
        localStorage.setItem('activeTripId', String(createdTripId));
      }
      
      setToast({
        show: true,
        message: "Ride requested! Rider will be assigned shortly.",
      });

      setTimeout(() => navigate(createdTripId ? `/track?tripId=${createdTripId}` : "/track"), 1200);
    } catch (error) {
      alert(error.error || 'Failed to request ride');
    }
  };

  const pickupCoords = locationCoordinates[pickupLocation] || [-6.1722, 35.7395];
  const destCoords =
    destinationCoords || locationCoordinates[formData.destination] || [-6.1722, 35.7395];

  if (loading) {
    return <LoadingSpinner message="Loading available riders..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-sand-50 text-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-navy-900 hover:text-amber-500 transition mb-4 inline-flex items-center gap-2 font-medium"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900">
              Request a Ride
            </h1>
            <span className="text-2xl">🇹🇿</span>
          </div>
          <p className="text-sand-400 mt-2">
            Complete your ride request in three simple steps across Dodoma.
          </p>
        </div>

        {!user && (
          <div className="mb-6 bg-white rounded-2xl shadow-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-navy-900">You need an account</p>
              <p className="text-xs text-sand-400">
                Register or sign in to request a ride.
              </p>
            </div>
            <Link
              to="/register"
              className="bg-amber-500 hover:bg-amber-600 shadow-amber text-white font-semibold px-4 py-2 rounded-xl text-sm text-center"
            >
              Create Account
            </Link>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-sand-300 text-navy-800 bg-white">
            <FiCheckCircle className="text-savanna-700" /> Account
          </span>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              formData.destination && pickupLocation !== formData.destination
                ? "border-savanna-700 text-savanna-700 bg-savanna-100"
                : "border-sand-300 text-sand-400 bg-white"
            }`}
          >
            <FiCheckCircle /> Destination
          </span>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              selectedRiderId
                ? "border-savanna-700 text-savanna-700 bg-savanna-100"
                : "border-sand-300 text-sand-400 bg-white"
            }`}
          >
            <FiCheckCircle /> Rider
          </span>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Account", icon: <FiUser /> },
            { label: "Destination", icon: <FiMapPin /> },
            { label: "Rider & Payment", icon: <FiCreditCard /> },
          ].map((step, idx) => (
            <div
              key={step.label}
              className="flex items-center gap-3 bg-white rounded-2xl shadow-card px-4 py-3"
            >
              <div className="w-10 h-10 rounded-full bg-amber-300/40 flex items-center justify-center text-amber-700">
                {step.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-sand-400">
                  Step {idx + 1}
                </p>
                <p className="font-semibold text-navy-900">{step.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                <FiUser /> Step 1: Account details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Customer Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                    <input
                      type="text"
                      value={user?.name || ""}
                      readOnly
                      className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-xl bg-sand-50 text-navy-800"
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
                      value={user?.phone || ""}
                      readOnly
                      className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-xl bg-sand-50 text-navy-800"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                    <input
                      type="text"
                      value={pickupLocation}
                      readOnly
                      className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-xl bg-sand-50 text-navy-800"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-sand-400 mt-3">
                Account details are pulled from your profile.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                <FiMapPin /> Step 2: Destination
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Where do you want to go?
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                    <input
                      type="text"
                      value={destinationQuery}
                      onChange={(e) => {
                        setDestinationQuery(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          destination: e.target.value,
                        }));
                        setDestinationCoords(null);
                      }}
                      placeholder="Search destination"
                      className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {isSuggesting && (
                    <p className="text-xs text-sand-400 mt-2">Searching locations...</p>
                  )}
                  {suggestions.length > 0 && (
                    <div className="mt-2 bg-white border border-sand-200 rounded-xl shadow-card overflow-hidden">
                      {suggestions.map((item, idx) => (
                        <button
                          key={`${item.label}-${item.coords?.[0] || "none"}-${idx}`}
                          type="button"
                          onClick={() => {
                            setDestinationQuery(item.label);
                            setFormData((prev) => ({
                              ...prev,
                              destination: item.label,
                            }));
                            setDestinationCoords(item.coords || null);
                            setSuggestions([]);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-sand-50 flex items-center gap-2"
                        >
                          <FiMapPin className="text-amber-700" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {pickupLocation === formData.destination && (
                    <p className="bg-flame-500 text-white text-xs mt-2 inline-block px-2 py-1 rounded">
                      Destination cannot be the same as pickup
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                <FiCreditCard /> Step 3: Rider & payment
              </h2>
              <div className="mb-4">
                <p className="text-sm font-semibold text-navy-900 mb-1">Suggested rider (nearest)</p>
                <p className="text-xs text-sand-400 mb-3">You can switch if you prefer another rider.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableRiders.map((rider) => {
                    const riderFee = Math.round(rider.rating * 120);
                    const total = fareEstimate + riderFee;
                    const isSelected = selectedRiderId === rider.id;
                    const initials = rider.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("");
                    return (
                      <button
                        type="button"
                        key={rider.id}
                        onClick={() => setSelectedRiderId(rider.id)}
                        className={`border rounded-xl p-3 text-left transition ${
                          isSelected
                            ? "border-amber-500 bg-amber-300/30"
                            : "border-sand-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sand-50 border border-sand-200 flex items-center justify-center font-semibold text-navy-900">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-navy-900">{rider.name}</p>
                            <p className="text-xs text-sand-400 flex items-center gap-1">
                              <FiStar className="text-amber-700" /> {rider.rating} • {rider.trips} trips
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-navy-900 mt-3">
                          TZS {total.toLocaleString()}
                        </p>
                      </button>
                    );
                  })}
                  {availableRiders.length === 0 && (
                    <p className="text-sand-400 text-sm">No riders online right now.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-navy-900 mb-2">Payment method</p>
                {user?.paymentMethods?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Cash", ...user.paymentMethods].map((method) => (
                      <label
                        key={method}
                        className={`border rounded-xl px-3 py-2 text-sm font-medium flex items-center justify-center cursor-pointer ${
                          formData.payment === method
                            ? "border-amber-500 bg-amber-300/30 text-amber-700"
                            : "border-sand-300 text-navy-800"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={formData.payment === method}
                          onChange={handleChange}
                          className="hidden"
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sand-400 text-sm">Payment is cash only unless you link a method in your profile.</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                disabled={
                  !user ||
                  !formData.destination ||
                  pickupLocation === formData.destination ||
                  !selectedRiderId
                }
                className="w-full bg-amber-500 hover:bg-amber-600 shadow-amber text-white font-bold py-3 rounded-xl transition disabled:opacity-50 inline-flex items-center justify-center"
              >
                Confirm Ride <FiArrowRight className="ml-2" />
              </button>
            </form>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">Ride summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sand-400">Pickup</span>
                  <span className="text-navy-800 font-medium">{pickupLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand-400">Destination</span>
                  <span className="text-navy-800 font-medium">{formData.destination}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand-400">Payment</span>
                  <span className="text-navy-800 font-medium">{formData.payment}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand-400">Rider</span>
                  <span className="text-navy-800 font-medium">
                    {selectedRider ? selectedRider.name : "Select a rider"}
                  </span>
                </div>
              </div>
              <div className="mt-5 bg-sand-50 rounded-xl p-4">
                <p className="text-xs text-sand-400 mb-2">Estimated Fare</p>
                <p className="text-3xl font-bold text-navy-900">
                  TZS {totalEstimate.toLocaleString()}
                </p>
                <p className="text-xs text-sand-400 mt-1">
                  Base: TZS 500 + Distance × TZS 300 + Rider fee
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card overflow-hidden h-96 md:h-125">
              <MapContainer
                center={[-6.1722, 35.7395]}
                zoom={13}
                className="h-full w-full"
                attributionControl
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={pickupCoords}>
                  <Popup>Pickup: {formData.pickup}</Popup>
                </Marker>
                <Marker position={destCoords}>
                  <Popup>Destination: {formData.destination}</Popup>
                </Marker>
                <Polyline
                  positions={[pickupCoords, destCoords]}
                  color="#F5A623"
                  weight={3}
                />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};
