import { dodoma_locations, locationCoordinates, riders as seedRiders, trips as seedTrips } from "../data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const MOCK_DB_KEY = "boda-boda-digital-mock-db";

const clone = (value) => JSON.parse(JSON.stringify(value));

const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const generateToken = (type, id) => `mock:${type}:${id}`;

const parseToken = (token) => {
  const match = /^mock:(user|rider):(\d+)$/.exec(token || "");
  if (!match) return null;
  return { type: match[1], id: Number(match[2]) };
};

const getLocationCoords = (location) => {
  const coords = locationCoordinates[location] || locationCoordinates["Dodoma CBD"];
  return { lat: coords[0], lng: coords[1] };
};

const createSeedRider = (rider) => ({
  ...rider,
  coordinates: getLocationCoords(rider.location),
  isIdentityVerified: true,
  isLicenseValid: true,
  hasInsurance: true,
  isPhoneVerified: true,
  vehicleInfo: rider.vehicleInfo || {
    model: "Motorcycle",
    plateNumber: `T ${String(100 + rider.id).padStart(3, "0")} ABC`,
  },
  earnings: rider.earnings || 0,
});

const createSeedTrip = (trip, index) => ({
  ...trip,
  id: trip.id,
  customerId: 1,
  customer: trip.customer || `Customer ${index + 1}`,
  riderId: trip.rider || null,
  riderName: trip.rider || null,
  paymentMethod: trip.payment || "Cash",
  paymentStatus: trip.status === "completed" ? "paid" : "pending",
  createdAt: trip.createdAt || new Date(Date.now() - index * 3600000).toISOString(),
  pickupCoords: trip.pickupCoords || getLocationCoords(trip.pickup),
  dropoffCoords: trip.dropoffCoords || getLocationCoords(trip.dropoff),
});

const getDefaultDb = () => ({
  users: [
    {
      id: 1,
      name: "Amina S.",
      phone: "+255712000001",
      defaultLocation: "Dodoma CBD",
      paymentMethods: ["M-Pesa"],
      provider: "local",
      googleId: null,
      email: "",
    },
  ],
  riders: seedRiders.map(createSeedRider),
  trips: seedTrips.map(createSeedTrip),
  counters: {
    user: 2,
    rider: seedRiders.length + 1,
    trip: seedTrips.length + 1,
  },
});

const loadDb = () => {
  try {
    const stored = localStorage.getItem(MOCK_DB_KEY);
    if (!stored) {
      const db = getDefaultDb();
      localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
      return db;
    }

    const parsed = JSON.parse(stored);
    return {
      ...getDefaultDb(),
      ...parsed,
      counters: { ...getDefaultDb().counters, ...(parsed.counters || {}) },
    };
  } catch {
    const db = getDefaultDb();
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
    return db;
  }
};

const saveDb = (db) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
};

const nextId = (db, key) => {
  const value = db.counters[key] || 1;
  db.counters[key] = value + 1;
  return value;
};

const mockSuccess = (value) => Promise.resolve(clone(value));

const mockError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  error.error = message;
  return Promise.reject(error);
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(body?.error || body?.message || response.statusText || "Request failed");
    error.status = response.status;
    error.error = error.message;
    throw error;
  }

  return body;
};

const withFallback = async (requestFn, fallbackFn) => {
  try {
    return await requestFn();
  } catch {
    return fallbackFn();
  }
};

const ensureMockUser = (phone, data = {}) => {
  const db = loadDb();
  const existing = db.users.find((user) => user.phone === phone);
  if (existing) return existing;

  const user = {
    id: nextId(db, "user"),
    name: data.name || "Demo User",
    phone,
    defaultLocation: data.defaultLocation || "Dodoma CBD",
    paymentMethods: data.paymentMethods || [],
    provider: data.provider || "local",
    googleId: data.googleId || null,
    email: data.email || "",
  };

  db.users.push(user);
  saveDb(db);
  return user;
};

const ensureMockRider = (phone, data = {}) => {
  const db = loadDb();
  const existing = db.riders.find((rider) => rider.phone === phone);
  if (existing) return existing;

  const rider = createSeedRider({
    id: nextId(db, "rider"),
    name: data.name || "Demo Rider",
    phone,
    location: data.location || "Dodoma CBD",
    rating: 4.5,
    trips: 0,
    status: data.status || "online",
  });

  db.riders.push(rider);
  saveDb(db);
  return rider;
};

const findUserFromToken = (token) => {
  const parsed = parseToken(token);
  if (!parsed || parsed.type !== "user") return null;
  const db = loadDb();
  return db.users.find((user) => user.id === parsed.id) || null;
};

const findRiderFromToken = (token) => {
  const parsed = parseToken(token);
  if (!parsed || parsed.type !== "rider") return null;
  const db = loadDb();
  return db.riders.find((rider) => rider.id === parsed.id) || null;
};

const selectNearestOnlineRider = (pickupLocation, riderId) => {
  const db = loadDb();
  if (riderId) {
    return db.riders.find((rider) => rider.id === riderId) || null;
  }

  const onlineRiders = db.riders.filter((rider) => rider.status === "online");
  if (!onlineRiders.length) return null;

  const pickupCoords = locationCoordinates[pickupLocation];
  if (!pickupCoords) return onlineRiders[0];

  return [...onlineRiders]
    .map((rider) => {
      const riderCoords = locationCoordinates[rider.location];
      if (!riderCoords) return { rider, distance: Number.POSITIVE_INFINITY };
      const dx = pickupCoords[0] - riderCoords[0];
      const dy = pickupCoords[1] - riderCoords[1];
      return { rider, distance: dx * dx + dy * dy };
    })
    .sort((a, b) => a.distance - b.distance)[0]?.rider || null;
};

export const api = {
  auth: {
    register: (data) => withFallback(
      () => requestJson("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      () => {
        const user = ensureMockUser(data.phone, data);
        return mockSuccess({ token: generateToken("user", user.id), user });
      }
    ),

    login: (data) => withFallback(
      () => requestJson("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      () => {
        const user = ensureMockUser(data.phone, data);
        return mockSuccess({ token: generateToken("user", user.id), user });
      }
    ),

    googleAuth: (data) => withFallback(
      () => requestJson("/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      () => {
        const user = ensureMockUser(data?.phone || "+255700000000", {
          ...data,
          provider: "google",
        });
        return mockSuccess({ token: generateToken("user", user.id), user });
      }
    ),

    getMe: (token) => withFallback(
      () => requestJson("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
      () => {
        const user = findUserFromToken(token);
        return user ? mockSuccess(user) : mockError("User not found", 404);
      }
    ),
  },

  riderAuth: {
    register: (data) => withFallback(
      () => requestJson("/rider-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      () => {
        const rider = ensureMockRider(data.phone, data);
        return mockSuccess({ token: generateToken("rider", rider.id), rider });
      }
    ),

    login: (data) => withFallback(
      () => requestJson("/rider-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      () => {
        const rider = ensureMockRider(data.phone, data);
        return mockSuccess({ token: generateToken("rider", rider.id), rider });
      }
    ),

    getProfile: () => withFallback(
      () => requestJson("/rider-auth/profile", { headers: getHeaders() }),
      () => {
        const rider = findRiderFromToken(localStorage.getItem("token"));
        return rider ? mockSuccess(rider) : mockError("Rider not found", 404);
      }
    ),
  },

  users: {
    get: (id) => withFallback(
      () => requestJson(`/users/${id}`),
      () => {
        const db = loadDb();
        return mockSuccess(db.users.find((user) => Number(user.id) === Number(id)) || null);
      }
    ),

    update: (id, data, token) => withFallback(
      () => requestJson(`/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
      () => {
        const db = loadDb();
        const index = db.users.findIndex((user) => Number(user.id) === Number(id));
        if (index === -1) return mockError("User not found", 404);
        db.users[index] = { ...db.users[index], ...data };
        saveDb(db);
        return mockSuccess(db.users[index]);
      }
    ),

    addPaymentMethod: (id, data, token) => withFallback(
      () => requestJson(`/users/${id}/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
      () => {
        const db = loadDb();
        const user = db.users.find((item) => Number(item.id) === Number(id));
        if (!user) return mockError("User not found", 404);
        user.paymentMethods = Array.from(new Set([...(user.paymentMethods || []), data.method]));
        saveDb(db);
        return mockSuccess(user);
      }
    ),
  },

  riders: {
    getAll: () => withFallback(
      () => requestJson("/riders"),
      () => mockSuccess(loadDb().riders)
    ),

    getOnline: (params = {}) => withFallback(
      () => requestJson(`/riders/online?${new URLSearchParams(params)}`),
      () => {
        const db = loadDb();
        const onlineRiders = db.riders.filter((rider) => rider.status === "online");
        return mockSuccess(onlineRiders);
      }
    ),

    get: (id) => withFallback(
      () => requestJson(`/riders/${id}`),
      () => {
        const db = loadDb();
        return mockSuccess(db.riders.find((rider) => Number(rider.id) === Number(id)) || null);
      }
    ),

    updateStatus: (id, data) => withFallback(
      () => requestJson(`/riders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      () => {
        const db = loadDb();
        const rider = db.riders.find((item) => Number(item.id) === Number(id));
        if (!rider) return mockError("Rider not found", 404);
        rider.status = data.status;
        saveDb(db);
        return mockSuccess(rider);
      }
    ),

    updateLocation: (id, data) => withFallback(
      () => requestJson(`/riders/${id}/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      () => {
        const db = loadDb();
        const rider = db.riders.find((item) => Number(item.id) === Number(id));
        if (!rider) return mockError("Rider not found", 404);
        rider.location = data.location || rider.location;
        rider.coordinates = data.coordinates || rider.coordinates;
        saveDb(db);
        return mockSuccess(rider);
      }
    ),
  },

  trips: {
    create: (data, token) => withFallback(
      () => requestJson("/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
      () => {
        const db = loadDb();
        const user = findUserFromToken(token) || db.users[0];
        if (!user) return mockError("No customer available", 400);

        const assignedRider = selectNearestOnlineRider(data.pickup, data.riderId);
        const trip = {
          id: nextId(db, "trip"),
          customerId: user.id,
          customer: user.name,
          riderId: assignedRider?.id || data.riderId || null,
          rider: assignedRider?.name || null,
          pickup: data.pickup,
          pickupCoords: data.pickupCoords || getLocationCoords(data.pickup),
          dropoff: data.dropoff,
          dropoffCoords: data.dropoffCoords || getLocationCoords(data.dropoff),
          fare: data.fare,
          status: "pending",
          paymentMethod: data.paymentMethod || "Cash",
          paymentStatus: "pending",
          rating: null,
          review: "",
          requestedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        db.trips.push(trip);
        saveDb(db);

        return mockSuccess({ ...trip, trip: clone(trip) });
      }
    ),

    get: (id) => withFallback(
      () => requestJson(`/trips/${id}`),
      () => {
        const db = loadDb();
        return mockSuccess(db.trips.find((trip) => Number(trip.id) === Number(id)) || null);
      }
    ),

    getUserTrips: (userId) => withFallback(
      () => requestJson(`/trips/user/${userId}`),
      () => {
        const db = loadDb();
        const trips = db.trips.filter((trip) => Number(trip.customerId) === Number(userId));
        return mockSuccess(trips);
      }
    ),

    getRiderTrips: (riderId) => withFallback(
      () => requestJson(`/trips/rider/${riderId}`),
      () => {
        const db = loadDb();
        const trips = db.trips.filter((trip) => Number(trip.riderId) === Number(riderId));
        return mockSuccess(trips);
      }
    ),

    accept: (id, riderId) => withFallback(
      () => requestJson(`/trips/${id}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId }),
      }),
      () => {
        const db = loadDb();
        const trip = db.trips.find((item) => Number(item.id) === Number(id));
        const rider = db.riders.find((item) => Number(item.id) === Number(riderId));
        if (!trip) return mockError("Trip not found", 404);
        trip.status = "in_progress";
        trip.riderId = rider?.id || riderId;
        trip.rider = rider?.name || trip.rider;
        if (rider) rider.status = "on_trip";
        saveDb(db);
        return mockSuccess(trip);
      }
    ),

    complete: (id, riderId) => withFallback(
      () => requestJson(`/trips/${id}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId }),
      }),
      () => {
        const db = loadDb();
        const trip = db.trips.find((item) => Number(item.id) === Number(id));
        const rider = db.riders.find((item) => Number(item.id) === Number(riderId));
        if (!trip) return mockError("Trip not found", 404);
        trip.status = "completed";
        trip.completedAt = new Date().toISOString();
        trip.paymentStatus = "paid";
        if (rider) {
          rider.status = "online";
          rider.trips = (rider.trips || 0) + 1;
          rider.earnings = (rider.earnings || 0) + Math.round(Number(trip.fare || 0) * 0.8);
        }
        saveDb(db);
        return mockSuccess(trip);
      }
    ),

    cancel: (id, token) => withFallback(
      () => requestJson(`/trips/${id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }),
      () => {
        const db = loadDb();
        const trip = db.trips.find((item) => Number(item.id) === Number(id));
        if (!trip) return mockError("Trip not found", 404);
        trip.status = "cancelled";
        trip.cancelledAt = new Date().toISOString();
        saveDb(db);
        return mockSuccess(trip);
      }
    ),

    rate: (id, data, token) => withFallback(
      () => requestJson(`/trips/${id}/rate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
      () => {
        const db = loadDb();
        const trip = db.trips.find((item) => Number(item.id) === Number(id));
        if (!trip) return mockError("Trip not found", 404);
        trip.rating = data.rating;
        trip.review = data.review || "";
        saveDb(db);
        return mockSuccess(trip);
      }
    ),
  },
};

