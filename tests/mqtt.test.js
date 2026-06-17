/* global process */
/**
 * MQTT Integration Test — Bodaboda Application
 * CS 421: Software Deployment — Task 6 (Advanced CI/CD)
 *
 * Publishes a message and verifies the subscriber receives it.
 * Fails if the message is not received within 5 seconds.
 */

import mqtt from 'mqtt';

const BROKER = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const TEST_TOPIC = 'bodaboda/test/ci';
const TEST_PAYLOAD = {
  test: 'CI MQTT integration test',
  app: 'bodaboda',
  timestamp: new Date().toISOString(),
};

console.log('\n📡 MQTT Integration Test');
console.log(`   Broker : ${BROKER}`);
console.log(`   Topic  : ${TEST_TOPIC}\n`);

let received = false;

// Subscriber connects first
const subscriber = mqtt.connect(BROKER, { clientId: `test-sub-${Date.now()}`, clean: true });

subscriber.on('connect', () => {
  console.log('  [SUB] ✅ Connected');
  subscriber.subscribe(TEST_TOPIC, () => {
    console.log('  [SUB] 📡 Subscribed to', TEST_TOPIC);

    // Publisher connects after subscriber is ready
    const publisher = mqtt.connect(BROKER, { clientId: `test-pub-${Date.now()}`, clean: true });

    publisher.on('connect', () => {
      console.log('  [PUB] ✅ Connected');
      publisher.publish(TEST_TOPIC, JSON.stringify(TEST_PAYLOAD), { qos: 1 }, (err) => {
        if (err) {
          console.error('  [PUB] ❌ Publish failed:', err.message);
          process.exit(1);
        }
        console.log('  [PUB] 📤 Message published:', JSON.stringify(TEST_PAYLOAD));
        publisher.end();
      });
    });
  });
});

subscriber.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());
  console.log('  [SUB] 📨 Message received:', JSON.stringify(payload));

  if (payload.test === TEST_PAYLOAD.test) {
    received = true;
    console.log('\n  ✅ MQTT TEST PASSED: publish → receive works correctly\n');
    subscriber.end();
    process.exit(0);
  }
});

subscriber.on('error', (err) => {
  console.error('  [SUB] ❌ Connection error:', err.message);
  process.exit(1);
});

// Timeout — fail if nothing received in 8 seconds
setTimeout(() => {
  if (!received) {
    console.error('\n  ❌ MQTT TEST FAILED: No message received within 8 seconds\n');
    subscriber.end();
    process.exit(1);
  }
}, 8000);
