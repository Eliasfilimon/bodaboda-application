import Rider from "../models/Rider.js";
import { calculateHaversineDistanceMeters } from "../services/distanceService.js";
import { normalizeCoordinates, serializeRider } from "../utils/formatters.js";

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
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }
    res.json(serializeRider(rider));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRiderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const riderId = Number(req.params.id);

    if (req.auth?.type === "rider" && Number(req.auth.id) !== riderId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    await rider.update({ status });
    res.json(serializeRider(rider));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRiderLocation = async (req, res) => {
  try {
    const riderId = Number(req.params.id);
    if (req.auth?.type === "rider" && Number(req.auth.id) !== riderId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { location, lat, lng } = req.body;
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    const coordinates = lat != null && lng != null
      ? { lat: Number(lat), lng: Number(lng) }
      : normalizeCoordinates(location || rider.location);

    await rider.update({
      location: location || rider.location,
      coordinates,
    });

    res.json(serializeRider(rider));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
