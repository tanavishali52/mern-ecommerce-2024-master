const mongoose = require('mongoose');
const migrateEnhancedOrderFields = require('../migrations/migrate-enhanced-order-fields');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');

    console.log('Running enhanced order fields migration...');
    const result = await migrateEnhancedOrderFields();
    
    if (result.success) {
      console.log('✅ Migration completed successfully!');
      console.log(`📊 Migration Summary:`);
      console.log(`   - Orders migrated: ${result.migratedCount}`);
      console.log(`   - Errors: ${result.errorCount}`);
      console.log(`   - Total processed: ${result.totalProcessed}`);
    } else {
      console.error('❌ Migration failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Migration script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

runMigration();