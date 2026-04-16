const mongoose = require('mongoose');
const Settings = require('../models/Settings');

/**
 * Migration script to initialize WhatsApp settings
 * This script sets up the default WhatsApp configuration in the database
 */

async function migrateWhatsAppSettings() {
  try {
    console.log('Starting WhatsApp settings migration...');

    // Check if WhatsApp settings already exist
    const existingSettings = await Settings.find({
      key: { $in: ['whatsapp_number', 'whatsapp_message', 'whatsapp_enabled'] }
    });

    if (existingSettings.length > 0) {
      console.log('WhatsApp settings already exist. Skipping migration.');
      return;
    }

    // Create default WhatsApp settings
    const defaultSettings = [
      {
        key: 'whatsapp_number',
        value: '',
        isActive: true
      },
      {
        key: 'whatsapp_message',
        value: "Hello! I'm interested in your products.",
        isActive: true
      },
      {
        key: 'whatsapp_enabled',
        value: false,
        isActive: true
      }
    ];

    // Insert default settings
    await Settings.insertMany(defaultSettings);

    console.log('WhatsApp settings migration completed successfully.');
    console.log('Default settings created:');
    console.log('- whatsapp_number: (empty)');
    console.log('- whatsapp_message: "Hello! I\'m interested in your products."');
    console.log('- whatsapp_enabled: false');

  } catch (error) {
    console.error('Error during WhatsApp settings migration:', error);
    throw error;
  }
}

/**
 * Rollback function to remove WhatsApp settings
 */
async function rollbackWhatsAppSettings() {
  try {
    console.log('Rolling back WhatsApp settings migration...');

    await Settings.deleteMany({
      key: { $in: ['whatsapp_number', 'whatsapp_message', 'whatsapp_enabled'] }
    });

    console.log('WhatsApp settings rollback completed successfully.');

  } catch (error) {
    console.error('Error during WhatsApp settings rollback:', error);
    throw error;
  }
}

/**
 * Function to ensure proper indexes exist
 */
async function ensureIndexes() {
  try {
    console.log('Ensuring Settings collection indexes...');

    // Create index on key field for efficient lookups
    await Settings.collection.createIndex({ key: 1 }, { unique: true });
    
    // Create compound index for active settings
    await Settings.collection.createIndex({ key: 1, isActive: 1 });

    console.log('Settings indexes created successfully.');

  } catch (error) {
    console.error('Error creating Settings indexes:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  const runMigration = async () => {
    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your-database', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('Connected to MongoDB');

      // Ensure indexes
      await ensureIndexes();

      // Run migration
      await migrateWhatsAppSettings();

      console.log('Migration completed successfully');

    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    } finally {
      // Close database connection
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  };

  runMigration();
}

module.exports = {
  migrateWhatsAppSettings,
  rollbackWhatsAppSettings,
  ensureIndexes
};