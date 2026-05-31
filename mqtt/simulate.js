#!/usr/bin/env node
/**
 * MQTT Client Simulation Script — Bodaboda Application
 * CS 421: Software Deployment — Task 4
 *
 * Demonstrates a Publisher (driver/passenger) and a Subscriber
 * communicating via the Mosquitto MQTT broker in real time.
 *
 * Usage:
 *   node mqtt/simulate.js
 *
 * Requires: npm install mqtt  (or: npm install in root)
 */

import mqtt from 'mqtt';

const BROKER = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

const TOPICS = {
  RIDE_REQUEST:    'bodaboda/ride/request',
  DRIVER_LOCATION: 'bodaboda/driver/location',
  RIDE_STATUS:     'bodaboda/ride/status',
};

// ── SUBSCRIBER (represents a Driver or Passenger listening) ───────────────────
const subscriber = mqtt.connect(BROKER, {
  clientId: `bodaboda-subscriber-${Date.now()}`,
  clean: true,
});

subscriber.on('connect', () => {
  console.log('\n[SUBSCRIBER] ✅ Connected to MQTT broker');
  subscriber.subscribe(Object.values(TOPICS), (err) => {
    if (!err) {
      console.log('[SUBSCRIBER] 📡 Subscribed to all Bodaboda topics\n');
      startPublisher();
    }
  });
});

subscriber.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());
  console.log(`\n[SUBSCRIBER] 📨 Received on [${topic}]`);
  console.log('             Payload:', JSON.stringify(payload, null, 2));
});

// ── PUBLISHER (represents the App/Driver/Passenger sending events) ─────────────
function startPublisher() {
  const publisher = mqtt.connect(BROKER, {
    clientId: `bodaboda-publisher-${Date.now()}`,
    clean: true,
  });

  publisher.on('connect', () => {
    console.log('[PUBLISHER]  ✅ Connected to MQTT broker');
    console.log('[PUBLISHER]  🚀 Starting simulation...\n');
    runSimulation(publisher);
  });
}

async function runSimulation(publisher) {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── Step 1: Option A — Passenger sends ride request ────────────────────────
  console.log('[PUBLISHER]  📤 Step 1: Passenger requesting a ride...');
  publisher.publish(
    TOPICS.RIDE_REQUEST,
    JSON.stringify({
      passenger_id: 'P001',
      passenger_name: 'Amina Juma',
      pickup_location: 'Nyerere Square, Dodoma',
      destination: 'University of Dodoma (UDOM)',
      timestamp: new Date().toISOString(),
    })
  );

  await delay(1500);

  // ── Step 2: Option B — Driver publishes location update ────────────────────
  console.log('[PUBLISHER]  📤 Step 2: Driver sending location update...');
  publisher.publish(
    TOPICS.DRIVER_LOCATION,
    JSON.stringify({
      driver_id: 'D042',
      driver_name: 'Hassan Mwita',
      lat: -6.1722,
      lng: 35.7395,
      speed_kmh: 28,
      timestamp: new Date().toISOString(),
    })
  );

  await delay(1500);

  // ── Step 3: Option C — Driver accepts the ride ─────────────────────────────
  console.log('[PUBLISHER]  📤 Step 3: Driver accepted the ride...');
  publisher.publish(
    TOPICS.RIDE_STATUS,
    JSON.stringify({
      ride_id: 'R-2026-001',
      driver_id: 'D042',
      passenger_id: 'P001',
      status: 'accepted',
      message: 'Driver is on the way',
      timestamp: new Date().toISOString(),
    })
  );

  await delay(1500);

  // ── Step 4: Option C — Ride started ───────────────────────────────────────
  console.log('[PUBLISHER]  📤 Step 4: Ride started...');
  publisher.publish(
    TOPICS.RIDE_STATUS,
    JSON.stringify({
      ride_id: 'R-2026-001',
      driver_id: 'D042',
      passenger_id: 'P001',
      status: 'started',
      message: 'Ride in progress',
      timestamp: new Date().toISOString(),
    })
  );

  await delay(1500);

  // ── Step 5: Option C — Ride completed ─────────────────────────────────────
  console.log('[PUBLISHER]  📤 Step 5: Ride completed...');
  publisher.publish(
    TOPICS.RIDE_STATUS,
    JSON.stringify({
      ride_id: 'R-2026-001',
      driver_id: 'D042',
      passenger_id: 'P001',
      status: 'completed',
      message: 'Ride completed. Thank you for using Bodaboda!',
      fare_tzs: 2300,
      timestamp: new Date().toISOString(),
    })
  );

  await delay(1000);
  console.log('\n[SIMULATION] ✅ All messages published and received successfully!');
  console.log('[SIMULATION] 🛑 Closing connections...\n');

  publisher.end();
  subscriber.end();
  process.exit(0);
}
