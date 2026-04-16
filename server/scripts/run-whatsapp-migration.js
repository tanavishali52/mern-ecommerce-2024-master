#!/usr/bin/env node

/**
 * Script to run WhatsApp settings migration
 * Usage: node scripts/run-whatsapp-migration.js [--rollback]
 */

const dotenv = require('dotenv');
const { migrateWhatsAppSettings, rollbackWhatsAppSettings, ensureIndexes } = require('../migrations/migrate-whatsapp-settings');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const args = process.argv.slice(2);
const isRollback = args.includes('--rollback');

async function runMigration() {
  try {
    console.log('='.repeat(50));
    console.log('WhatsApp Settings Migration Script');
    console.log('='.repeat(50));

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB successfully');

    if (isRollback) {
      console.log('\n🔄 Running rollback...');
      await rollbackWhatsAppSettings();
      console.log('✅ Rollback completed successfully');
    } else {
      console.log('\n🔧 Ensuring database indexes...');
      await ensureIndexes();
      console.log('✅ Indexes ensured successfully');

      console.log('\n📝 Running WhatsApp settings migration...');
      await migrateWhatsAppSettings();
      console.log('✅ Migration completed successfully');
    }

    console.log('\n' + '='.repeat(50));
    console.log('Migration script completed successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Process interrupted. Cleaning up...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️  Process terminated. Cleaning up...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the migration
runMigration();