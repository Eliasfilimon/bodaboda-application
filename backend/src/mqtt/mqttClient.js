/**
 * MQTT Client Module — Bodaboda Application
 * CS 421: Software Deployment — MQTT Integration
 *
 * Handles connection to Mosquitto broker and exposes
 * publish/subscribe helpers used across the backend.
 */

import mqtt from 'mqtt';

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://mqtt-broker:1883';

// ── Topics ────────────────────────────────────────────────────────────────────
export const TOPICS = {
  RIDE_REQUEST:  'bodaboda/ride/request',   // Option A
  DRIVER_LOCATION: 'bodaboda/driver/location', // Option B
  RIDE_STATUS:   'bodaboda/ride/status',    // Option C
};

let client = null;

/**
 * Connect to the MQTT broker.
 * Call once at app startup.
 */
export function connectMQTT() {
  client = mqtt.connect(BROKER_URL, {
    clientId: `bodaboda-backend-${Date.now()}`,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 10000,
  });

  client.on('connect', () => {
    console.log(`[MQTT] ✅ Connected to broker at ${BROKER_URL}`);

    // Subscribe to all topics the backend needs to listen to
    const subscribeTopics = [
      TOPICS.RIDE_REQUEST,
      TOPICS.DRIVER_LOCATION,
      TOPICS.RIDE_STATUS,
    ];

    client.subscribe(subscribeTopics, (err) => {
      if (err) {
        console.error('[MQTT] ❌ Subscription error:', err.message);
      } else {
        console.log('[MQTT] 📡 Subscribed to topics:', subscribeTopics);
      }
    });
  });

  client.on('message', (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`[MQTT] 📨 Message on [${topic}]:`, payload);
      handleIncomingMessage(topic, payload);
    } catch (e) {
      console.warn('[MQTT] ⚠️ Non-JSON message on', topic, message.toString());
    }
  });

  client.on('error', (err) => {
    console.error('[MQTT] ❌ Error:', err.message);
  });

  client.on('reconnect', () => {
    console.log('[MQTT] 🔄 Reconnecting to broker...');
  });

  client.on('disconnect', () => {
    console.log('[MQTT] 🔌 Disconnected from broker');
  });

  return client;
}

/**
 * Handle all incoming MQTT messages centrally.
 */
function handleIncomingMessage(topic, payload) {
  switch (topic) {
    case TOPICS.RIDE_REQUEST:
      console.log(`[MQTT] 🚖 New ride request from passenger ${payload.passenger_id} at ${payload.pickup_location}`);
      break;
    case TOPICS.DRIVER_LOCATION:
      console.log(`[MQTT] 📍 Driver ${payload.driver_id} at [${payload.lat}, ${payload.lng}]`);
      break;
    case TOPICS.RIDE_STATUS:
      console.log(`[MQTT] 🔔 Ride ${payload.ride_id} status → ${payload.status}`);
      break;
    default:
      console.log(`[MQTT] Unknown topic: ${topic}`);
  }
}

/**
 * Publish a message to an MQTT topic.
 * @param {string} topic
 * @param {object} payload - will be JSON stringified
 */
export function publishMessage(topic, payload) {
  if (!client || !client.connected) {
    console.warn('[MQTT] ⚠️ Cannot publish — not connected to broker');
    return;
  }
  const message = JSON.stringify({ ...payload, timestamp: new Date().toISOString() });
  client.publish(topic, message, { qos: 1 }, (err) => {
    if (err) {
      console.error(`[MQTT] ❌ Publish error on [${topic}]:`, err.message);
    } else {
      console.log(`[MQTT] ✅ Published to [${topic}]:`, message);
    }
  });
}

export function getMQTTClient() {
  return client;
}
