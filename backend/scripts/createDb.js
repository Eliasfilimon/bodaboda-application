import process from 'node:process';
import 'dotenv/config';

async function setupDatabase() {
  try {
    const { default: sequelize } = await import('../src/config/db.js');
    await import('../src/models/index.js');

    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');

    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL tables created/synced');

    await sequelize.close();
    console.log('Database setup complete');
    process.exit(0);
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
}

setupDatabase();
