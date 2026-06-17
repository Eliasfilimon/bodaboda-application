import request from 'supertest';
import app from '../src/app.js';
import sequelize from '../src/config/db.js';

describe('Health and Metrics Endpoints', () => {
  // Close database connection after all tests to prevent hanging handles
  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  test('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('ts');
  });

  test('GET / should return API version info', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Boda Boda Digital API v2');
    expect(res.body.version).toBe('2.0.0');
  });

  test('GET /metrics should return Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('nodejs_version_info');
  });
});
