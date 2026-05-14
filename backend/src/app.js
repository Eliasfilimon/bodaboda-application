import 'dotenv/config';
import process from "node:process";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import client from "prom-client";
import { connectDB } from "./config/db.js";
import { initializeSocket } from "./config/socket.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import riderRoutes from "./routes/riders.js";
import riderAuthRoutes from "./routes/riderAuth.js";
import tripRoutes from "./routes/trips.js";
import { setupAssociations } from "./models/index.js";
import { seedDatabase } from "./utils/seedDatabase.js";

const app = express();
const server = createServer(app);
const register = new client.Registry();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : true;

setupAssociations();
initializeSocket(server);
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe({ method: req.method, route: req.path, status_code: res.statusCode }, duration);
    httpRequestTotal.inc({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
}));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/riders", riderRoutes);
app.use("/api/rider-auth", riderAuthRoutes);
app.use("/api/trips", tripRoutes);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/", (req, res) => {
  res.json({ message: "Boda Boda Digital API" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startServer = async () => {
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await connectDB();
      await seedDatabase();
      break;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt} failed: ${error.message}`);

      if (attempt === maxAttempts) {
        console.error("❌ Max database retries reached. Exiting.");
        process.exit(1);
      }

      await sleep(3000);
    }
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
