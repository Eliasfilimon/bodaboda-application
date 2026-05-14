import 'dotenv/config';
import { Sequelize } from "sequelize";

const buildDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const user = process.env.PGUSER || "postgres";
  const password = process.env.PGPASSWORD || "postgres";
  const host = process.env.PGHOST || "localhost";
  const port = process.env.PGPORT || "5432";
  const database = process.env.PGDATABASE || "bodaboda";

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
};

const sequelize = new Sequelize(buildDatabaseUrl(), {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: process.env.PGSSLMODE === "require"
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : undefined,
});

export const connectDB = async () => {
  await sequelize.authenticate();
  console.log("✅ PostgreSQL connected");
  await sequelize.sync({ alter: true });
  console.log("✅ Database synced");
};

export default sequelize;

