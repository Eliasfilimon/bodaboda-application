/**
 * MQTT REST API Routes — Bodaboda Application
 * CS 421: Software Deployment — MQTT Integration
 *
 * These HTTP endpoints allow you to trigger MQTT publishes
 * for demonstration and testing purposes.
 */

import express from 'express';
import { publishMessage, TOPICS } from './mqttClient.js';
import process from 'node:process';

const router = express.Router();

// ── Option A: Ride Request Broadcasting ───────────────────────────────────────
/**
 * POST /api/mqtt/ride-request
 * Passenger sends a ride request → backend publishes to MQTT
 * Drivers subscribed to bodaboda/ride/request receive it instantly
 *
 * Body: { passenger_id, pickup_location, destination, passenger_name }
 */
router.post('/ride-request', (req, res) => {
  const { passenger_id, pickup_location, destination, passenger_name } = req.body;

  if (!passenger_id || !pickup_location || !destination) {
    return res.status(400).json({
      error: 'passenger_id, pickup_location, and destination are required'
    });
  }

  const payload = {
    passenger_id,
    passenger_name: passenger_name || 'Unknown',
    pickup_location,
    destination,
    requested_at: new Date().toISOString(),
  };

  publishMessage(TOPICS.RIDE_REQUEST, payload);

  return res.status(200).json({
    success: true,
    message: 'Ride request broadcasted to all available drivers',
    topic: TOPICS.RIDE_REQUEST,
    payload,
  });
});

// ── Option B: Driver Location Updates ─────────────────────────────────────────
/**
 * POST /api/mqtt/driver-location
 * Driver publishes their GPS location → passengers subscribed receive live updates
 *
 * Body: { driver_id, driver_name, lat, lng }
 */
router.post('/driver-location', (req, res) => {
  const { driver_id, driver_name, lat, lng } = req.body;

  if (!driver_id || lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'driver_id, lat, and lng are required'
    });
  }

  const payload = {
    driver_id,
    driver_name: driver_name || 'Unknown Driver',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  };

  publishMessage(TOPICS.DRIVER_LOCATION, payload);

  return res.status(200).json({
    success: true,
    message: 'Driver location update published',
    topic: TOPICS.DRIVER_LOCATION,
    payload,
  });
});

// ── Option C: Ride Status Updates ─────────────────────────────────────────────
/**
 * POST /api/mqtt/ride-status
 * Driver publishes ride status → passenger receives real-time update
 *
 * Body: { ride_id, driver_id, passenger_id, status }
 * status: 'accepted' | 'started' | 'completed' | 'cancelled'
 */
router.post('/ride-status', (req, res) => {
  const { ride_id, driver_id, passenger_id, status } = req.body;

  const validStatuses = ['accepted', 'started', 'completed', 'cancelled'];
  if (!ride_id || !status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${validStatuses.join(', ')}`
    });
  }

  const payload = { ride_id, driver_id, passenger_id, status };

  publishMessage(TOPICS.RIDE_STATUS, payload);

  return res.status(200).json({
    success: true,
    message: `Ride status '${status}' published to passenger`,
    topic: TOPICS.RIDE_STATUS,
    payload,
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
router.get('/status', (req, res) => {
  return res.status(200).json({
    mqtt_integration: 'active',
    topics: TOPICS,
    broker: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  });
});

export default router;
