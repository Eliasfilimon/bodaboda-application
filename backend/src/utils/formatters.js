import { locationCoordinates } from "./dodomaData.js";

export const normalizeCoordinates = (value, fallbackLocation = "Dodoma CBD") => {
  if (value && typeof value === "object" && value.lat != null && value.lng != null) {
    return { lat: Number(value.lat), lng: Number(value.lng) };
  }

  const fallback = locationCoordinates[fallbackLocation] || locationCoordinates["Dodoma CBD"];
  const coords = locationCoordinates[value] || fallback;
  return { lat: Number(coords.lat), lng: Number(coords.lng) };
};

export const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  email: user.email || null,
  defaultLocation: user.defaultLocation,
  paymentMethods: user.paymentMethods || [],
  provider: user.provider,
  googleId: user.googleId || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const serializeRider = (rider) => ({
  id: rider.id,
  name: rider.name,
  phone: rider.phone,
  location: rider.location,
  coordinates: rider.coordinates,
  status: rider.status,
  rating: Number(rider.rating),
  trips: rider.trips,
  vehicleInfo: rider.vehicleInfo,
  earnings: Number(rider.earnings),
  isIdentityVerified: rider.isIdentityVerified,
  isLicenseValid: rider.isLicenseValid,
  hasInsurance: rider.hasInsurance,
  isPhoneVerified: rider.isPhoneVerified,
  createdAt: rider.createdAt,
  updatedAt: rider.updatedAt,
});

export const serializeTripList = (trip, customerName = null, riderName = null) => ({
  ...trip.toJSON(),
  customer: customerName || trip.customer?.name || null,
  rider: riderName || trip.rider?.name || null,
  payment: trip.paymentMethod,
  time: trip.requestedAt ? new Date(trip.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
});

export const serializeTripDetail = (trip) => ({
  ...trip.toJSON(),
  customer: trip.customer ? serializeUser(trip.customer) : null,
  rider: trip.rider ? serializeRider(trip.rider) : null,
});
