import { calculateFare } from "../services/fareService.js";
import User from "../models/User.js";
import Rider from "../models/Rider.js";
import Trip from "../models/Trip.js";
import { locationCoordinates, sampleRiders, sampleUsers, seedTripBlueprints } from "./dodomaData.js";

const toPoint = (value, fallbackLocation = "Dodoma CBD") => {
  if (value && typeof value === "object" && value.lat != null && value.lng != null) {
    return { lat: Number(value.lat), lng: Number(value.lng) };
  }

  const coords = locationCoordinates[value] || locationCoordinates[fallbackLocation] || locationCoordinates["Dodoma CBD"];
  return { lat: coords.lat, lng: coords.lng };
};

export const seedDatabase = async () => {
  const [userCount, riderCount, tripCount] = await Promise.all([
    User.count(),
    Rider.count(),
    Trip.count(),
  ]);

  if (userCount === 0) {
    await User.bulkCreate(sampleUsers.map((user) => ({
      ...user,
      paymentMethods: user.paymentMethods || [],
    })));
  }

  if (riderCount === 0) {
    await Rider.bulkCreate(sampleRiders.map((rider) => ({
      ...rider,
      earnings: rider.earnings ?? 0,
    })));
  }

  if (tripCount === 0) {
    const users = await User.findAll();
    const riders = await Rider.findAll();

    const userByPhone = new Map(users.map((user) => [user.phone, user]));
    const riderByIndex = riders.length ? riders : [];

    const trips = seedTripBlueprints
      .map((blueprint, index) => {
        const customer = userByPhone.get(blueprint.customerPhone) || users[0];
        const rider = riderByIndex[index % Math.max(riderByIndex.length, 1)] || null;

        const pickupCoords = toPoint(blueprint.pickup);
        const dropoffCoords = toPoint(blueprint.dropoff);
        const fare = blueprint.fare || calculateFare(pickupCoords, dropoffCoords, rider?.rating || 4.5).totalFare;

        return {
          customerId: customer?.id,
          riderId: blueprint.status === "pending" ? null : rider?.id || null,
          pickup: blueprint.pickup,
          pickupCoords,
          dropoff: blueprint.dropoff,
          dropoffCoords,
          fare,
          status: blueprint.status,
          paymentMethod: blueprint.paymentMethod || "Cash",
          paymentStatus: blueprint.status === "completed" ? "paid" : "pending",
          rating: blueprint.rating,
          review: blueprint.review,
          requestedAt: new Date(Date.now() - index * 3600000),
          acceptedAt: blueprint.status !== "pending" ? new Date(Date.now() - index * 3500000) : null,
          completedAt: blueprint.status === "completed" ? new Date(Date.now() - index * 3000000) : null,
        };
      })
      .filter((trip) => trip.customerId);

    if (trips.length > 0) {
      await Trip.bulkCreate(trips);
    }
  }
};
