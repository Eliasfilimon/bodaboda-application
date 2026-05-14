import { Op } from "sequelize";
import Trip from "../models/Trip.js";
import Rider from "../models/Rider.js";
import User from "../models/User.js";
import { calculateFare } from "../services/fareService.js";
import { normalizeCoordinates, serializeTripDetail, serializeTripList } from "../utils/formatters.js";

const getFallbackCoords = (location) => normalizeCoordinates(location || "Dodoma CBD");

const findNearestOnlineRider = async (pickupCoords) => {
  const riders = await Rider.findAll({ where: { status: "online" } });
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

export const createTrip = async (req, res) => {
  try {
    const { pickup, pickupCoords, dropoff, dropoffCoords, fare, paymentMethod, riderId } = req.body;
    const customer = req.auth?.record;

    if (!customer) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!pickup || !dropoff) {
      return res.status(400).json({ error: "Pickup and dropoff are required" });
    }

    const normalizedPickupCoords = pickupCoords ? normalizeCoordinates(pickupCoords) : getFallbackCoords(pickup);
    const normalizedDropoffCoords = dropoffCoords ? normalizeCoordinates(dropoffCoords) : getFallbackCoords(dropoff);
    const assignedRider = riderId ? await Rider.findByPk(riderId) : await findNearestOnlineRider(normalizedPickupCoords);
    const fareQuote = calculateFare(normalizedPickupCoords, normalizedDropoffCoords, assignedRider?.rating || 4.5);

    const trip = await Trip.create({
      customerId: customer.id,
      riderId: assignedRider?.id || null,
      pickup,
      pickupCoords: normalizedPickupCoords,
      dropoff,
      dropoffCoords: normalizedDropoffCoords,
      fare: fare ?? fareQuote.totalFare,
      status: "pending",
      paymentMethod: paymentMethod || "Cash",
      paymentStatus: "pending",
      requestedAt: new Date(),
    });

    const createdTrip = await getTripWithRelations(trip.id);
    res.status(201).json(serializeTripDetail(createdTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrip = async (req, res) => {
  try {
    const trip = await getTripWithRelations(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json(serializeTripDetail(trip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const userId = req.params.userId || req.auth?.id;

    if (!userId) {
      return res.status(400).json({ error: "User id is required" });
    }

    if (req.auth?.type === "user" && Number(req.auth.id) !== Number(userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const trips = await Trip.findAll({
      where: { customerId: userId },
      include: [
        { model: Rider, as: "rider" },
        { model: User, as: "customer" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(trips.map((trip) => serializeTripList(trip, trip.customer?.name || null, trip.rider?.name || null)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRiderTrips = async (req, res) => {
  try {
    const riderId = req.params.riderId || req.auth?.id;

    if (!riderId) {
      return res.status(400).json({ error: "Rider id is required" });
    }

    if (req.auth?.type === "rider" && Number(req.auth.id) !== Number(riderId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const trips = await Trip.findAll({
      where: { riderId },
      include: [
        { model: Rider, as: "rider" },
        { model: User, as: "customer" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(trips.map((trip) => serializeTripList(trip, trip.customer?.name || null, trip.rider?.name || null)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptTrip = async (req, res) => {
  try {
    const riderId = Number(req.auth?.id || req.body.riderId);
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.status !== "pending") {
      return res.status(400).json({ error: "Trip is not pending" });
    }

    if (!riderId) {
      return res.status(400).json({ error: "Rider id is required" });
    }

    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    await trip.update({
      riderId,
      status: "in_progress",
      acceptedAt: new Date(),
    });

    await rider.update({ status: "on_trip" });

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json(serializeTripDetail(updatedTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.status !== "in_progress") {
      return res.status(400).json({ error: "Trip is not in progress" });
    }

    if (req.auth?.type === "rider" && Number(req.auth.id) !== Number(trip.riderId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await trip.update({
      status: "completed",
      completedAt: new Date(),
      paymentStatus: "paid",
    });

    const rider = await Rider.findByPk(trip.riderId);
    if (rider) {
      await rider.update({
        status: "online",
        trips: Number(rider.trips || 0) + 1,
        earnings: Number(rider.earnings || 0) + Number(trip.fare) * 0.8,
      });
    }

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json(serializeTripDetail(updatedTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.status === "completed") {
      return res.status(400).json({ error: "Cannot cancel completed trip" });
    }

    if (req.auth?.type === "user" && Number(req.auth.id) !== Number(trip.customerId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (req.auth?.type === "rider" && Number(req.auth.id) !== Number(trip.riderId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await trip.update({ status: "cancelled" });

    if (trip.riderId) {
      await Rider.update({ status: "online" }, { where: { id: trip.riderId } });
    }

    const updatedTrip = await getTripWithRelations(trip.id);
    res.json(serializeTripDetail(updatedTrip));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rateTrip = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.status !== "completed") {
      return res.status(400).json({ error: "Can only rate completed trips" });
    }

    if (req.auth?.type === "user" && Number(req.auth.id) !== Number(trip.customerId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (!trip.riderId) {
      return res.status(400).json({ error: "No rider assigned to this trip" });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    await trip.update({ rating: numericRating, review: review || null });

    const riderTrips = await Trip.findAll({
      where: { riderId: trip.riderId, rating: { [Op.ne]: null } },
    });

    const avgRating = riderTrips.length > 0
      ? riderTrips.reduce((sum, currentTrip) => sum + Number(currentTrip.rating), 0) / riderTrips.length
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
