/**
 * CS 421: Software Deployment — MQTT Integration
 * Task 4: Client Simulation Script
 *
 * Demonstrates ALL THREE options:
 *   Option A — Passenger publishes ride request  → Driver receives
 *   Option B — Driver publishes location         → Passenger receives
 *   Option C — Driver publishes status updates   → Passenger receives
 *
 * Run: node backend/scripts/mqtt-simulate.js
 * (MQTT broker must be running first: docker compose up mqtt -d)
 */

import mqtt from 'mqtt';
import process from 'node:process';

const BROKER = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

const TOPICS = {
  RIDE_REQUEST:    'bodaboda/ride/request',
  DRIVER_LOCATION: 'bodaboda/driver/location',
  RIDE_STATUS:     'bodaboda/ride/status',
};

// Dodoma landmarks for realistic simulation
const DODOMA_ROUTE = [
  { lat: -6.1722, lng: 35.7395, label: 'Dodoma CBD' },
  { lat: -6.1710, lng: 35.7420, label: 'Jamhuri Street' },
  { lat: -6.1700, lng: 35.7450, label: 'Uhuru Monument' },
  { lat: -6.1695, lng: 35.7480, label: 'Kuu Street' },
  { lat: -6.1700, lng: 35.7500, label: 'UDOM Campus' },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Helper: print coloured step headers ────────────────────────────────────
const log = {
  title:  (t) => console.log(`\n${'═'.repeat(60)}\n  ${t}\n${'═'.repeat(60)}`),
  pub:    (t, p) => console.log(`  📤 [PUBLISH]  topic: ${t}\n     payload: ${JSON.stringify(p, null, 2)}`),
  sub:    (t, p) => console.log(`  📥 [RECEIVED] topic: ${t}\n     payload: ${JSON.stringify(p, null, 2)}`),
  ok:     (m) => console.log(`  ✅ ${m}`),
  wait:   (m) => console.log(`  ⏳ ${m}`),
  done:   (m) => console.log(`  🎉 ${m}`),
};

async function runSimulation() {
  log.title('BodaBoda MQTT Simulation — CS 421 Software Deployment');
  console.log(`  Broker: ${BROKER}\n`);

  // ── Connect PASSENGER client ────────────────────────────────────────────────
  const passenger = mqtt.connect(BROKER, {
    clientId: `passenger-sim-${Date.now()}`,
    clean: true,
  });

  // ── Connect DRIVER client ──────────────────────────────────────────────────
  const driver = mqtt.connect(BROKER, {
    clientId: `driver-sim-${Date.now()}`,
    clean: true,
  });

  // Wait for both clients to connect
  await Promise.all([
    new Promise((resolve) => passenger.on('connect', () => { log.ok('Passenger client connected'); resolve(); })),
    new Promise((resolve) => driver.on('connect',    () => { log.ok('Driver client connected');    resolve(); })),
  ]);

  // ════════════════════════════════════════════════════════════════════════════
  // OPTION A — Ride Request Broadcasting
  // Passenger PUBLISHES → Driver SUBSCRIBES & RECEIVES
  // ════════════════════════════════════════════════════════════════════════════
  log.title('OPTION A: Ride Request Broadcasting');

  // Driver subscribes first
  driver.subscribe(TOPICS.RIDE_REQUEST);
  driver.on('message', (topic, msg) => {
    if (topic === TOPICS.RIDE_REQUEST) {
      log.sub(topic, JSON.parse(msg.toString()));
      log.ok('Driver received ride request — can now accept or decline');
    }
  });

  await delay(300);

  // Passenger publishes ride request
  const rideRequest = {
    passenger_id:    1,
    passenger_name:  'Amina Said',
    pickup_location: 'Dodoma CBD',
    destination:     'UDOM Campus',
    fare_estimate:   3500,
    requested_at:    new Date().toISOString(),
  };
  log.pub(TOPICS.RIDE_REQUEST, rideRequest);
  passenger.publish(TOPICS.RIDE_REQUEST, JSON.stringify(rideRequest), { qos: 1 });

  await delay(800);

  // ════════════════════════════════════════════════════════════════════════════
  // OPTION B — Driver Location Updates
  // Driver PUBLISHES GPS → Passenger SUBSCRIBES & RECEIVES live map updates
  // ════════════════════════════════════════════════════════════════════════════
  log.title('OPTION B: Driver Location Updates (Live Route)');

  passenger.subscribe(TOPICS.DRIVER_LOCATION);
  passenger.on('message', (topic, msg) => {
    if (topic === TOPICS.DRIVER_LOCATION) {
      const data = JSON.parse(msg.toString());
      log.sub(topic, data);
    }
  });

  log.wait(`Driver travelling from ${DODOMA_ROUTE[0].label} → ${DODOMA_ROUTE[4].label}...`);
  for (const point of DODOMA_ROUTE) {
    const locationPayload = {
      driver_id:   3,
      driver_name: 'Juma Mwamba',
      lat:         point.lat,
      lng:         point.lng,
      location:    point.label,
      speed_kmh:   28,
      timestamp:   new Date().toISOString(),
    };
    log.pub(TOPICS.DRIVER_LOCATION, locationPayload);
    driver.publish(TOPICS.DRIVER_LOCATION, JSON.stringify(locationPayload), { qos: 0 });
    await delay(700); // simulate movement every 700ms
  }

  await delay(400);

  // ════════════════════════════════════════════════════════════════════════════
  // OPTION C — Ride Status Updates
  // Driver PUBLISHES status → Passenger SUBSCRIBES & RECEIVES
  // ════════════════════════════════════════════════════════════════════════════
  log.title('OPTION C: Ride Status Updates');

  passenger.subscribe(TOPICS.RIDE_STATUS);
  passenger.on('message', (topic, msg) => {
    if (topic === TOPICS.RIDE_STATUS) {
      const data = JSON.parse(msg.toString());
      log.sub(topic, data);
      const emoji = {
        accepted:  '🛵 Rider is on the way!',
        started:   '🏁 Trip has started!',
        completed: '✅ Trip completed — please rate your rider',
      };
      log.ok(emoji[data.status] || `Status: ${data.status}`);
    }
  });

  await delay(300);

  const statuses = ['accepted', 'started', 'completed'];
  for (const status of statuses) {
    const statusPayload = {
      ride_id:      7,
      driver_id:    3,
      driver_name:  'Juma Mwamba',
      passenger_id: 1,
      status,
      timestamp:    new Date().toISOString(),
    };
    log.pub(TOPICS.RIDE_STATUS, statusPayload);
    driver.publish(TOPICS.RIDE_STATUS, JSON.stringify(statusPayload), { qos: 1 });
    await delay(900);
  }

  await delay(600);

  // ── Summary ─────────────────────────────────────────────────────────────────
  log.title('Simulation Complete');
  log.done('All 3 MQTT options demonstrated successfully!');
  console.log(`
  Topics used:
    📌 ${TOPICS.RIDE_REQUEST}
    📌 ${TOPICS.DRIVER_LOCATION}
    📌 ${TOPICS.RIDE_STATUS}

  Messages exchanged:
    • 1  ride request   (Option A)
    • ${DODOMA_ROUTE.length}  location updates (Option B)
    • 3  status updates (Option C)
  `);

  passenger.end();
  driver.end();
  process.exit(0);
}

runSimulation().catch((err) => {
  console.error('Simulation error:', err);
  process.exit(1);
});
