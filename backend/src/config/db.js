import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[db] Connected to PostgreSQL via Sequelize');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('[db] Database synced successfully');
  } catch (err) {
    console.error('[db] Connection failed:', err.message);
    throw err;
  }
};

export default sequelize;
