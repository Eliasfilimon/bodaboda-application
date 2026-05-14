import User from "../models/User.js";
import { serializeUser } from "../utils/formatters.js";

export const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (req.auth?.type === "user" && Number(req.auth.id) !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, phone, defaultLocation, paymentMethods, email } = req.body;

    await user.update({
      name: name ?? user.name,
      phone: phone ?? user.phone,
      email: email ?? user.email,
      defaultLocation: defaultLocation ?? user.defaultLocation,
      paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : user.paymentMethods,
    });

    res.json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addPaymentMethod = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (req.auth?.type === "user" && Number(req.auth.id) !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const paymentMethod = req.body.paymentMethod || req.body.method;
    const methods = Array.isArray(user.paymentMethods) ? [...user.paymentMethods] : [];

    if (paymentMethod && !methods.includes(paymentMethod)) {
      methods.push(paymentMethod);
      await user.update({ paymentMethods: methods });
    }

    res.json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
