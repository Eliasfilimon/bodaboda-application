import Rider from "../models/Rider.js";
import { calculateHaversineDistanceMeters } from "../services/distanceService.js";
import { normalizeCoordinates, serializeRider } from "../utils/formatters.js";
import { publishMessage, TOPICS } from "../mqtt/mqttClient.js";

const VALID_STATUSES = ["online", "offline", "on_trip"];

export const getRiders = async (req, res) => {
  try {
    const riders = await Rider.findAll({ order: [["rating", "DESC"]] });
    res.json(riders.map(serializeRider));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOnlineRiders = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;
    let riders = await Rider.findAll({ where: { status: "online" } });

    if (lat && lng) {
      const target = { lat: Number(lat), lng: Number(lng) };
      const maxDist = Number(maxDistance);
      riders = riders.filter((rider) => {
        const coordinates = normalizeCoordinates(rider.coordinates || rider.location);
        return calculateHaversineDistanceMeters(coordinates, target) <= maxDist;
      });
    }
    res.json(riders.map(serializeRider));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRider = async (req, res) => {
  try {
    const rider = await Rider.findByPk(req.params.id);
    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json(serializeRider(rider));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Toggle Online / Offline ───────────────────────────────────────────────────
// PATCH /api/riders/:id/status  { status: 'online' | 'offline' }
export const updateRiderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const riderId = Number(req.params.id);

    if (req.auth?.type === "rider" && Number(req.auth.id) !== riderId)
      return res.status(403).json({ error: "Not authorized" });

    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });

    const rider = await Rider.findByPk(riderId);
    if (!rider) return res.status(404).json({ error: "Rider not found" });

    // Prevent going online while on a trip
    if (rider.status === "on_trip" && status === "online")
      return res.status(400).json({ error: "Cannot change status while on a trip" });

    await rider.update({ status });

    // 🔴 MQTT: Publish rider availability change so map updates in real-time
    publishMessage(TOPICS.DRIVER_LOCATION, {
      driver_id:   rider.id,
      driver_name: rider.name,
      status,
      lat:  rider.coordinates?.lat || null,
      lng:  rider.coordinates?.lng || null,
      timestamp: new Date().toISOString(),
    });

    res.json({
      ...serializeRider(rider),
      message: status === "online"
        ? "You are now online — ready to receive rides"
        : "You are now offline",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Update Rider GPS Location ─────────────────────────────────────────────────
// PUT /api/riders/:id/location  { lat, lng, location? }
export const updateRiderLocation = async (req, res) => {
  try {
    const riderId = Number(req.params.id);
    if (req.auth?.type === "rider" && Number(req.auth.id) !== riderId)
      return res.status(403).json({ error: "Not authorized" });

    const { location, lat, lng } = req.body;
    const rider = await Rider.findByPk(riderId);
    if (!rider) return res.status(404).json({ error: "Rider not found" });

    const coordinates = lat != null && lng != null
      ? { lat: Number(lat), lng: Number(lng) }
      : normalizeCoordinates(location || rider.location);

    await rider.update({ location: location || rider.location, coordinates });

    // 🔴 MQTT: Publish live GPS update so passengers see rider moving on map
    if (rider.status === "on_trip") {
      publishMessage(TOPICS.DRIVER_LOCATION, {
        driver_id:   rider.id,
        driver_name: rider.name,
        lat:         coordinates.lat,
        lng:         coordinates.lng,
        status:      rider.status,
        timestamp:   new Date().toISOString(),
      });
    }

    res.json(serializeRider(rider));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
