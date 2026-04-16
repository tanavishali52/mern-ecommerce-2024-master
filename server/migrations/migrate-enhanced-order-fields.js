const mongoose = require('mongoose');
const Order = require('../models/Order');

/**
 * Migration to add enhanced fields to existing orders
 * - guestNameLowercase for case-insensitive search
 * - isGuestOrder flag for consistent naming
 * - customerDisplayName for display purposes
 * - statusTimeline for order tracking
 */

async function migrateEnhancedOrderFields() {
  try {
    console.log('Starting enhanced order fields migration...');

    // Get all orders that need migration
    const orders = await Order.find({
      $or: [
        { guestNameLowercase: { $exists: false } },
        { isGuestOrder: { $exists: false } },
        { customerDisplayName: { $exists: false } },
        { statusTimeline: { $exists: false } }
      ]
    });

    console.log(`Found ${orders.length} orders to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        let needsUpdate = false;

        // Set guest-related fields
        if (order.guestCustomer && order.guestCustomer.fullName) {
          if (!order.guestNameLowercase) {
            order.guestNameLowercase = order.guestCustomer.fullName.toLowerCase();
            needsUpdate = true;
          }
          if (order.isGuestOrder === undefined) {
            order.isGuestOrder = true;
            needsUpdate = true;
          }
          if (!order.customerDisplayName) {
            order.customerDisplayName = order.guestCustomer.fullName;
            needsUpdate = true;
          }
        } else if (order.userId) {
          if (order.isGuestOrder === undefined) {
            order.isGuestOrder = false;
            needsUpdate = true;
          }
          // customerDisplayName will be populated from user data when needed
        }

        // Initialize statusTimeline if not exists
        if (!order.statusTimeline || order.statusTimeline.length === 0) {
          if (order.orderStatus) {
            order.statusTimeline = [{
              status: order.orderStatus,
              timestamp: order.orderDate || new Date(),
              note: 'Order created (migrated)'
            }];
            needsUpdate = true;
          }
        }

        // Save if changes were made
        if (needsUpdate) {
          await order.save();
          migratedCount++;
        }

      } catch (error) {
        console.error(`Error migrating order ${order._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Migration completed successfully!`);
    console.log(`- Orders migrated: ${migratedCount}`);
    console.log(`- Errors: ${errorCount}`);
    console.log(`- Total processed: ${orders.length}`);

    return {
      success: true,
      migratedCount,
      errorCount,
      totalProcessed: orders.length
    };

  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run migration if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
    return migrateEnhancedOrderFields();
  }).then((result) => {
    console.log('Migration result:', result);
    process.exit(0);
  }).catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
}

module.exports = migrateEnhancedOrderFields;