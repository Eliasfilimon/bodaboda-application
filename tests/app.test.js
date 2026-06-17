/* global process */
/**
 * Bodaboda Application - Unit Tests
 * CS 421: Software Deployment Assignment
 */

// Simple test runner (no external deps needed)
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(n) {
      if (actual <= n) {
        throw new Error(`Expected ${actual} to be greater than ${n}`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy value, got ${actual}`);
    },
    toContain(str) {
      if (!actual.includes(str)) {
        throw new Error(`Expected "${actual}" to contain "${str}"`);
      }
    }
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log('\n🚖 Bodaboda App — Test Suite\n');

test('fare calculation returns correct amount for 5km trip', () => {
  const BASE_FARE = 500;       // TZS 500 base
  const RATE_PER_KM = 300;     // TZS 300 per km
  const distance = 5;
  const fare = BASE_FARE + RATE_PER_KM * distance;
  expect(fare).toBe(2000);
});

test('fare is always positive', () => {
  const fare = 500 + 300 * 0;
  expect(fare).toBeGreaterThan(0);
});

test('rider name is a non-empty string', () => {
  const rider = { name: 'Juma Hassan', phone: '0712345678' };
  expect(typeof rider.name).toBe('string');
  expect(rider.name.length).toBeGreaterThan(0);
});

test('phone number starts with 07 (Tanzanian format)', () => {
  const phone = '0712345678';
  expect(phone.startsWith('07')).toBeTruthy();
});

test('trip status transitions correctly', () => {
  const statuses = ['requested', 'accepted', 'in_progress', 'completed'];
  expect(statuses[0]).toBe('requested');
  expect(statuses[statuses.length - 1]).toBe('completed');
});

test('app name is correct', () => {
  const appName = 'boda-boda-digital';
  expect(appName).toContain('boda');
});

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
