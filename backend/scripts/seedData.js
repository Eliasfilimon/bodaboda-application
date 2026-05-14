#!/usr/bin/env node
import process from 'node:process';
import 'dotenv/config';

import { seedDatabase } from '../src/utils/seedDatabase.js';

async function runSeed() {
  try {
    const { default: sequelize } = await import('../src/config/db.js');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');

    await seedDatabase();

    console.log('\n✅ Seeding complete!');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

runSeed();
