import { useEffect, useMemo, useState } from "react";
import mqtt from "mqtt";
import { useAuth } from "../context/AuthContext";
import { api } from "../config/api.js";

const toCurrency = (value) => `TZS ${Number(value || 0).toLocaleString()}`;

export const RiderDashboard = () => {
  const { rider } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [mqttStatus, setMqttStatus] = useState("Connecting...");
  const [tripPhase, setTripPhase] = useState("accepted");

  const loadTrips = async () => {
    if (!rider?.id) return;
    const trips = await api.trips.getRiderTrips(rider.id);
    setRecentTrips((trips || []).slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5));
  };

  useEffect(() => {
    if (!rider) return;
    setIsOnline((rider.status || "online") !== "offline");
    loadTrips();
  }, [rider]);

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.hostname || "localhost";
    const mqttUrl = import.meta.env.VITE_MQTT_WS_URL || `${wsProtocol}://${host}:9001/mqtt`;
    const client = mqtt.connect(mqttUrl, { reconnectPeriod: 2000, connectTimeout: 5000 });

    client.on("connect", () => {
      setMqttStatus("Connected");
      client.subscribe("bodaboda/ride/request");
    });

    client.on("error", () => setMqttStatus("Disconnected"));
    client.on("offline", () => setMqttStatus("Disconnected"));
    client.on("message", (_, message) => {
      try {
        const payload = JSON.parse(message.toString());
        setIncomingRequest(payload);
      } catch {
        // Ignore malformed payloads
      }
    });

    return () => client.end(true);
  }, []);

  const stats = useMemo(() => {
    const completed = recentTrips.filter((trip) => trip.status === "completed");
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const today = completed
      .filter((trip) => new Date(trip.completedAt || trip.createdAt).toDateString() === now.toDateString())
      .reduce((sum, trip) => sum + Number(trip.fare || 0), 0);
    const week = completed
      .filter((trip) => new Date(trip.completedAt || trip.createdAt) >= startOfWeek)
      .reduce((sum, trip) => sum + Number(trip.fare || 0), 0);

    return {
      today,
      week,
      totalTrips: completed.length,
    };
  }, [recentTrips]);

  const publishRideStatus = (status, trip = activeTrip || incomingRequest) => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.hostname || "localhost";
    const mqttUrl = import.meta.env.VITE_MQTT_WS_URL || `${wsProtocol}://${host}:9001/mqtt`;
    const client = mqtt.connect(mqttUrl, { reconnectPeriod: 0 });
    client.on("connect", () => {
      client.publish("bodaboda/ride/status", JSON.stringify({
        status,
        riderId: rider?.id,
        riderName: rider?.name,
        tripId: trip?.tripId || trip?.id || null,
        passengerName: trip?.passengerName || trip?.customer || "Passenger",
        pickup: trip?.pickup,
        destination: trip?.destination || trip?.dropoff,
        updatedAt: new Date().toISOString(),
      }));
      client.end(true);
    });
  };

  const toggleOnline = async () => {
    if (!rider) return;
    const nextStatus = isOnline ? "offline" : "online";
    setIsOnline(!isOnline);
    await api.riders.updateStatus(rider.id, { status: nextStatus });
  };

  const handleDecline = () => {
    publishRideStatus("declined", incomingRequest);
    setIncomingRequest(null);
  };

  const handleAccept = async () => {
    if (!incomingRequest) return;
    if (incomingRequest.tripId) {
      await api.trips.accept(incomingRequest.tripId, rider.id);
    }
    setActiveTrip(incomingRequest);
    setIncomingRequest(null);
    setTripPhase("accepted");
    publishRideStatus("accepted", incomingRequest);
  };

  const startTrip = () => {
    setTripPhase("started");
    publishRideStatus("started");
  };

  const completeTrip = async () => {
    if (activeTrip?.tripId) {
      await api.trips.complete(activeTrip.tripId, rider.id);
    }
    publishRideStatus("completed");
    setTripPhase("completed");
    setActiveTrip(null);
    await loadTrips();
  };

  const riderStatus = !isOnline ? "Offline" : activeTrip ? "On Trip" : "Available";
  const dotColor = !isOnline ? "bg-sand-400" : "bg-twende-primary";

  return (
    <div className="min-h-screen bg-twende-bg px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="bg-twende-white rounded-2xl p-4 md:p-6 shadow-card border border-sand-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-twende-text">Rider Dashboard</h1>
            <p className="text-twende-gray">{rider?.name || "Rider"} • MQTT: {mqttStatus}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleOnline} className={`px-4 py-2 rounded-xl text-white font-semibold ${isOnline ? "bg-twende-dark" : "bg-twende-primary"}`}>
              {isOnline ? "Go Offline" : "Go Online"}
            </button>
            <div className="bg-twende-light px-4 py-2 rounded-xl">
              <p className="text-xs text-twende-gray">Earnings Today</p>
              <p className="font-bold text-twende-dark">{toCurrency(stats.today)}</p>
            </div>
          </div>
        </header>

        <div className="bg-twende-white rounded-2xl p-4 border border-sand-200">
          <p className="text-sm text-twende-gray">Current Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            <span className="font-semibold text-twende-text">{riderStatus}</span>
          </div>
        </div>

        {incomingRequest && (
          <div className="bg-twende-white rounded-2xl p-5 border border-sand-200 shadow-card">
            <h2 className="text-lg font-bold text-twende-text mb-2">Incoming Ride Request</h2>
            <p className="text-twende-gray">{incomingRequest.passengerName || "Passenger"}</p>
            <p className="text-sm text-twende-gray">{incomingRequest.pickup} → {incomingRequest.destination}</p>
            <p className="font-semibold text-twende-text mt-1">{toCurrency(incomingRequest.fareEstimate || incomingRequest.fare)}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAccept} className="bg-twende-primary hover:bg-twende-dark text-white px-4 py-2 rounded-xl font-semibold">ACCEPT</button>
              <button onClick={handleDecline} className="bg-twende-accent text-white px-4 py-2 rounded-xl font-semibold">DECLINE</button>
            </div>
          </div>
        )}

        {activeTrip && (
          <div className="bg-twende-white rounded-2xl p-5 border border-sand-200 shadow-card">
            <h2 className="text-lg font-bold text-twende-text">Active Trip</h2>
            <p className="text-sm text-twende-gray mt-1">{activeTrip.passengerName || "Passenger"}</p>
            <p className="text-sm text-twende-gray">{activeTrip.pickup} → {activeTrip.destination}</p>
            <p className="text-xs text-twende-gray mt-1">Real-time status: {tripPhase}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={startTrip} className="bg-twende-dark text-white px-4 py-2 rounded-xl font-semibold">START TRIP</button>
              <button onClick={completeTrip} className="bg-twende-primary text-white px-4 py-2 rounded-xl font-semibold">COMPLETE TRIP</button>
            </div>
          </div>
        )}

        <section id="earnings" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-twende-white p-4 rounded-2xl border border-sand-200"><p className="text-sm text-twende-gray">Today</p><p className="text-xl font-bold text-twende-dark">{toCurrency(stats.today)}</p></div>
          <div className="bg-twende-white p-4 rounded-2xl border border-sand-200"><p className="text-sm text-twende-gray">This Week</p><p className="text-xl font-bold text-twende-dark">{toCurrency(stats.week)}</p></div>
          <div className="bg-twende-white p-4 rounded-2xl border border-sand-200"><p className="text-sm text-twende-gray">Total Trips Completed</p><p className="text-xl font-bold text-twende-dark">{stats.totalTrips}</p></div>
        </section>

        <section className="bg-twende-white rounded-2xl border border-sand-200 shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-sand-200">
            <h3 className="font-semibold text-twende-text">Recent Trips</h3>
          </div>
          <ul className="divide-y divide-sand-200">
            {recentTrips.length === 0 && <li className="px-4 py-6 text-sm text-twende-gray">No trips yet.</li>}
            {recentTrips.map((trip) => (
              <li key={trip.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-twende-text font-medium">{trip.pickup} → {trip.dropoff}</p>
                  <p className="text-twende-gray">{toCurrency(trip.fare)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trip.status === "completed" ? "bg-twende-light text-twende-dark" : "bg-amber-300/50 text-amber-700"}`}>
                  {trip.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
