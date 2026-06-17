import 'dotenv/config';
import process from 'node:process';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import client from 'prom-client';
import { connectDB } from './config/db.js';
import { initializeSocket } from './config/socket.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import riderRoutes from './routes/riders.js';
import riderAuthRoutes from './routes/riderAuth.js';
import tripRoutes from './routes/trips.js';
import notificationRoutes from './routes/notifications.js';
import { setupAssociations } from './models/index.js';
import { seedDatabase } from './utils/seedDatabase.js';
import { connectMQTT } from './mqtt/mqttClient.js';
import mqttRoutes from './mqtt/mqttRoutes.js';
import kycRoutes from './routes/kyc.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load Swagger document
const swaggerDocument = YAML.load(path.join(process.cwd(), 'swagger.yaml'));

const app = express();
const server = createServer(app);
const register = new client.Registry();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : true;

initializeSocket(server);
client.collectDefaultMetrics({ register });

const httpReqDuration = new client.Histogram({ name: 'http_request_duration_seconds', help: 'Duration of HTTP requests', labelNames: ['method', 'route', 'status_code'], registers: [register] });
const httpReqTotal = new client.Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['method', 'route', 'status_code'], registers: [register] });
register.registerMetric(httpReqDuration);
register.registerMetric(httpReqTotal);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const d = (Date.now() - start) / 1000;
    httpReqDuration.observe({ method: req.method, route: req.path, status_code: res.statusCode }, d);
    httpReqTotal.inc({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/rider-auth', riderAuthRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mqtt', mqttRoutes);
app.use('/api/kyc', kycRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/uploads', express.static('uploads'));

app.get('/metrics', async (req, res) => { res.set('Content-Type', register.contentType); res.end(await register.metrics()); });
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.get('/', (_req, res) => res.json({ message: 'Boda Boda Digital API v2', version: '2.0.0' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  setupAssociations();
  if (process.env.SEED_DB === 'true') await seedDatabase();

  try {
    connectMQTT();
  } catch (err) {
    console.warn('[mqtt] Could not connect to broker:', err.message);
  }

  server.listen(PORT, () => console.log(`[server] running on port ${PORT}`));
};

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => { console.error('[fatal]', err); process.exit(1); });
}
export default app;
