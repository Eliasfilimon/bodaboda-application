import process from "node:process";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { isNonEmptyString, isValidTzPhone, normalizeTzPhone } from "../utils/validators.js";
import { serializeUser } from "../utils/formatters.js";

const client = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const createToken = (user) => jwt.sign(
  { id: user.id, type: "user" },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || "7d" },
);

export const register = async (req, res) => {
  try {
    const { name, phone, defaultLocation, paymentMethod, paymentMethods, email } = req.body;

    if (!isNonEmptyString(name, 2)) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!isValidTzPhone(phone)) {
      return res.status(400).json({ error: "Please enter a valid Tanzanian phone number" });
    }

    const normalizedPhone = normalizeTzPhone(phone);
    const existingUser = await User.findOne({ where: { phone: normalizedPhone } });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      phone: normalizedPhone,
      email: email || null,
      defaultLocation: defaultLocation || "Dodoma CBD",
      paymentMethods: Array.isArray(paymentMethods)
        ? paymentMethods
        : paymentMethod
          ? [paymentMethod]
          : [],
      provider: "local",
    });

    res.status(201).json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!isValidTzPhone(phone)) {
      return res.status(400).json({ error: "Please enter a valid Tanzanian phone number" });
    }

    const normalizedPhone = normalizeTzPhone(phone);
    const user = await User.findOne({ where: { phone: normalizedPhone } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken, name, email, phone } = req.body;
    let payload = null;

    if (idToken && client) {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    }

    const nextName = payload?.name || name || "Google User";
    const nextEmail = payload?.email || email || null;
    const nextPhone = normalizeTzPhone(phone || nextEmail || "+255700000000");

    let user = await User.findOne({ where: nextEmail ? { email: nextEmail } : { phone: nextPhone } });

    if (!user) {
      user = await User.create({
        name: nextName,
        email: nextEmail,
        phone: nextPhone,
        provider: "google",
        googleId: payload?.sub || idToken || null,
        defaultLocation: "Dodoma CBD",
      });
    }

    res.json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: serializeUser(req.auth.record) });
};

