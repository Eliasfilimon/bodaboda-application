import { Op } from "sequelize";
import Trip from "../models/Trip.js";
import Rider from "../models/Rider.js";
import User from "../models/User.js";
import { calculateFare } from "../services/fareService.js";
import { normalizeCoordinates, serializeTripDetail, serializeTripList } from "../utils/formatters.js";
import { publishMessage, TOPICS } from "../mqtt/mqttClient.js";

const getFallbackCoords = (location) => normalizeCoordinates(location || "Dodoma CBD");

// Find the nearest available online rider, excluding a list of declined rider IDs
const findNearestOnlineRider = async (pickupCoords, excludeIds = []) => {
  const where = { status: "online" };
  if (excludeIds.length) where.id = { [Op.notIn]: excludeIds };

  const riders = await Rider.findAll({ where });
  if (!riders.length) return null;

  return riders
    .map((rider) => {
      const coordinates = normalizeCoordinates(rider.coordinates || rider.location);
      const dx = pickupCoords.lat - coordinates.lat;
      const dy = pickupCoords.lng - coordinates.lng;
      return { rider, distance: dx * dx + dy * dy };
    })
    .sort((a, b) => a.distance - b.distance)[0]?.rider || null;
};

const getTripWithRelations = async (id) => Trip.findByPk(id, {
  include: [
    { model: User, as: "customer" },
    { model: Rider, as: "rider" },
  ],
});

// ── Create Trip ──────────────────────────────────────────────────────────────
export const createTrip = async (req, res) => {
  try {
    const { pickup, pickupCoords, dropoff, dropoffCoords, fare, paymentMethod, riderId } = req.body;
    const customer = req.auth?.record;

    if (!customer) return res.status(401).json({ error: "Authentication required" });
    if (!pickup || !dropoff) return res.status(400).json({ error: "Pickup and dropoff are required" });

    const normalizedPickupCoords  = pickupCoords  ? normalizeCoordinates(pickupCoords)  : getFallbackCoords(pickup);
    const normalizedDropoffCoords = dropoffCoords ? normalizeCoordinates(dropoffCoords) : getFallbackCoords(dropoff);
    const assignedRider = riderId
      ? await Rider.findByPk(riderId)
      : await findNearestOnlineRider(normalizedPickupCoords);

    // Surge pricing: peak hours 7-9 AM and 5-7 PM add 20%
    const hour = new Date().getHours();
    const isSurge = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const fareQuote = calculateFare(normalizedPickupCoords, normalizedDropoffCoords, assignedRider?.rating || 4.5);
    const finalFare = isSurge ? Math.round(fareQuote.totalFare * 1.2) : fareQuote.totalFare;

    const trip = await Trip.create({
      customerId:     customer.id,
      riderId:        assignedRider?.id || null,
      pickup,
      pickupCoords:   normalizedPickupCoords,
      dropoff,
      dropoffCoords:  normalizedDropoffCoords,
      fare:           fare ?? finalFare,
      isSurge:        isSurge,
      status:         "pending",
      paymentMethod:  paymentMethod || "Cash",
      paymentStatus:  "pending",
      declinedRiders: [],
      requestedAt:    new Date(),
    });

    // 🔴 MQTT: Broadcast ride request to all online drivers
    publishMessage(TOPICS.RIDE_REQUEST, {
      tripId:          trip.id,
      passenger_id:    customer.id,
      passenger_name:  customer.name,
      pickup_location: pickup,
      destination:     dropoff,
      fare:            trip.fare,
      isSurge,
      requested_at:    trip.requestedAt,
    });

    const createdTrip = await getTripWithRelations(trip.id);
    res.status(201).json(serializeTripDetail(createdTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Get Single Trip ──────────────────────────────────────────────────────────
export const getTrip = async (req, res) => {
  try {
    const trip = await getTripWithRelations(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(serializeTripDetail(trip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Trip Histories ───────────────────────────────────────────────────────────
export const getUserTrips = async (req, res) => {
  try {
    const userId = req.params.userId || req.auth?.id;
    if (!userId) return res.status(400).json({ error: "User id is required" });
    if (req.auth?.type === "user" && Number(req.auth.id) !== Number(userId))
      return res.status(403).json({ error: "Not authorized" });

    const trips = await Trip.findAll({
      where: { customerId: userId },
      include: [{ model: Rider, as: "rider" }, { model: User, as: "customer" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(trips.map((t) => serializeTripList(t, t.customer?.name || null, t.rider?.name || null)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRiderTrips = async (req, res) => {
  try {
    const riderId = req.params.riderId || req.auth?.id;
    if (!riderId) return res.status(400).json({ error: "Rider id is required" });
    if (req.auth?.type === "rider" && Number(req.auth.id) !== Number(riderId))
      return res.status(403).json({ error: "Not authorized" });

    const trips = await Trip.findAll({
      where: { riderId },
      include: [{ model: Rider, as: "rider" }, { model: User, as: "customer" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(trips.map((t) => serializeTripList(t, t.customer?.name || null, t.rider?.name || null)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Accept Trip ──────────────────────────────────────────────────────────────
export const acceptTrip = async (req, res) => {
  try {
    const riderId = Number(req.auth?.id || req.body.riderId);
    const trip = await Trip.findByPk(req.params.id);

    if (!trip)           return res.status(404).json({ error: "Trip not found" });
    if (trip.status !== "pending") return res.status(400).json({ error: "Trip is not pending" });
    if (!riderId)        return res.status(400).json({ error: "Rider id is required" });

    const rider = await Rider.findByPk(riderId);
    if (!rider) return res.status(404).json({ error: "Rider not found" });

    await trip.update({ riderId, status: "accepted", acceptedAt: new Date() });
    await rider.update({ status: "on_trip" });

    // 🔴 MQTT: Notify passenger their rider is coming
    publishMessage(TOPICS.RIDE_STATUS, {
      tripId:       trip.id,
      event:        "accepted",
      status:       "accepted",
      riderId:      rider.id,
      riderName:    rider.name,
      riderPhone:   rider.phone,
      riderRating:  rider.rating,
      riderPlate:   rider.plateNumber || null,
      passenger_id: trip.customerId,
      timestamp:    new Date().toISOString(),
    });

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json(serializeTripDetail(updatedTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Decline Trip (reassign to next nearest rider) ────────────────────────────
export const declineTrip = async (req, res) => {
  try {
    const riderId = Number(req.auth?.id || req.body.riderId);
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.status !== "pending") return res.status(400).json({ error: "Trip is not pending" });

    // Track who declined so we don't reassign them
    const declinedRiders = Array.isArray(trip.declinedRiders)
      ? [...trip.declinedRiders, riderId]
      : [riderId];

    const pickupCoords = normalizeCoordinates(trip.pickupCoords || trip.pickup);
    const nextRider = await findNearestOnlineRider(pickupCoords, declinedRiders);

    await trip.update({
      riderId:        nextRider?.id || null,
      declinedRiders,
      status:         nextRider ? "pending" : "no_riders_available",
    });

    if (nextRider) {
      // 🔴 MQTT: Broadcast to the next nearest rider
      publishMessage(TOPICS.RIDE_REQUEST, {
        tripId:          trip.id,
        passenger_id:    trip.customerId,
        pickup_location: trip.pickup,
        destination:     trip.dropoff,
        fare:            trip.fare,
        reassigned:      true,
        requested_at:    new Date().toISOString(),
      });
    }

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json({
      ...serializeTripDetail(updatedTrip),
      nextRider: nextRider ? { id: nextRider.id, name: nextRider.name } : null,
      message: nextRider
        ? `Reassigned to rider ${nextRider.name}`
        : "No available riders nearby",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Start Trip (rider picks up passenger) ────────────────────────────────────
export const startTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.status !== "accepted") return res.status(400).json({ error: "Trip must be accepted before starting" });
    if (req.auth?.type === "rider" && Number(req.auth.id) !== Number(trip.riderId))
      return res.status(403).json({ error: "Not authorized" });

    await trip.update({ status: "in_progress", startedAt: new Date() });

    // 🔴 MQTT: Notify passenger trip has started
    publishMessage(TOPICS.RIDE_STATUS, {
      tripId:       trip.id,
      event:        "started",
      status:       "in_progress",
      passenger_id: trip.customerId,
      riderId:      trip.riderId,
      timestamp:    new Date().toISOString(),
    });

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json(serializeTripDetail(updatedTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Complete Trip ─────────────────────────────────────────────────────────────
export const completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.status !== "in_progress") return res.status(400).json({ error: "Trip is not in progress" });
    if (req.auth?.type === "rider" && Number(req.auth.id) !== Number(trip.riderId))
      return res.status(403).json({ error: "Not authorized" });

    await trip.update({
      status:        "completed",
      completedAt:   new Date(),
      paymentStatus: "paid",
    });

    const rider = await Rider.findByPk(trip.riderId);
    if (rider) {
      await rider.update({
        status:   "online",
        trips:    Number(rider.trips || 0) + 1,
        earnings: Number(rider.earnings || 0) + Number(trip.fare) * 0.8,
      });
    }

    // 🔴 MQTT: Notify passenger trip is complete
    publishMessage(TOPICS.RIDE_STATUS, {
      tripId:        trip.id,
      event:         "completed",
      status:        "completed",
      passenger_id:  trip.customerId,
      riderId:       trip.riderId,
      fare:          trip.fare,
      paymentStatus: "paid",
      timestamp:     new Date().toISOString(),
    });

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json(serializeTripDetail(updatedTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Cancel Trip ───────────────────────────────────────────────────────────────
export const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.status === "completed") return res.status(400).json({ error: "Cannot cancel completed trip" });
    if (req.auth?.type === "user"  && Number(req.auth.id) !== Number(trip.customerId))
      return res.status(403).json({ error: "Not authorized" });
    if (req.auth?.type === "rider" && Number(req.auth.id) !== Number(trip.riderId))
      return res.status(403).json({ error: "Not authorized" });

    await trip.update({ status: "cancelled" });

    if (trip.riderId) {
      await Rider.update({ status: "online" }, { where: { id: trip.riderId } });
    }

    // 🔴 MQTT: Notify the other party of cancellation
    publishMessage(TOPICS.RIDE_STATUS, {
      tripId:       trip.id,
      event:        "cancelled",
      status:       "cancelled",
      cancelledBy:  req.auth?.type,
      passenger_id: trip.customerId,
      riderId:      trip.riderId,
      timestamp:    new Date().toISOString(),
    });

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json(serializeTripDetail(updatedTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Rate Trip ─────────────────────────────────────────────────────────────────
export const rateTrip = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.status !== "completed") return res.status(400).json({ error: "Can only rate completed trips" });
    if (req.auth?.type === "user" && Number(req.auth.id) !== Number(trip.customerId))
      return res.status(403).json({ error: "Not authorized" });
    if (!trip.riderId) return res.status(400).json({ error: "No rider assigned to this trip" });

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5)
      return res.status(400).json({ error: "Rating must be between 1 and 5" });

    await trip.update({ rating: numericRating, review: review || null });

    const riderTrips = await Trip.findAll({
      where: { riderId: trip.riderId, rating: { [Op.ne]: null } },
    });
    const avgRating = riderTrips.length > 0
      ? riderTrips.reduce((sum, t) => sum + Number(t.rating), 0) / riderTrips.length
      : numericRating;

    await Rider.update(
      { rating: Math.round(avgRating * 10) / 10 },
      { where: { id: trip.riderId } },
    );

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json(serializeTripDetail(updatedTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
