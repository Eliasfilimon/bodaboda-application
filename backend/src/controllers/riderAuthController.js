import process from "node:process";
import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";
import { isNonEmptyString, isValidTzPhone, normalizeTzPhone } from "../utils/validators.js";
import { serializeRider } from "../utils/formatters.js";

const createToken = (rider) => jwt.sign(
  { id: rider.id, type: "rider" },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || "7d" },
);

export const registerRider = async (req, res) => {
  try {
    const { name, phone, location, plateNumber, vehicleModel } = req.body;

    if (!isNonEmptyString(name, 2)) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!isValidTzPhone(phone)) {
      return res.status(400).json({ error: "Please enter a valid Tanzanian phone number" });
    }

    if (!isNonEmptyString(plateNumber, 3)) {
      return res.status(400).json({ error: "License plate is required" });
    }

    const normalizedPhone = normalizeTzPhone(phone);
    const existingRider = await Rider.findOne({ where: { phone: normalizedPhone } });
    if (existingRider) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    const rider = await Rider.create({
      name: name.trim(),
      phone: normalizedPhone,
      location: location || "Dodoma CBD",
      coordinates: { lat: -6.1722, lng: 35.7395 },
      status: "offline",
      vehicleInfo: {
        plateNumber: plateNumber.trim().toUpperCase(),
        model: vehicleModel || "Motorcycle",
      },
    });

    res.status(201).json({ token: createToken(rider), rider: serializeRider(rider) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginRider = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!isValidTzPhone(phone)) {
      return res.status(400).json({ error: "Please enter a valid Tanzanian phone number" });
    }

    const normalizedPhone = normalizeTzPhone(phone);
    const rider = await Rider.findOne({ where: { phone: normalizedPhone } });
    if (!rider) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ token: createToken(rider), rider: serializeRider(rider) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRiderProfile = async (req, res) => {
  res.json(serializeRider(req.auth.record));
};
