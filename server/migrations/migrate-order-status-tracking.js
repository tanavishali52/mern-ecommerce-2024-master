const mongoose = require('mongoose');
const Order = require('../models/Order');

// Migration script to add status tracking fields to existing orders
async function migrateOrderStatusTracking() {
  try {
    console.log('Starting order status tracking migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-ecommerce');
    
    // Find all orders that don't have the new fields
    const ordersToUpdate = await Order.find({
      $or: [
        { statusHistory: { $exists: false } },
        { lastUpdatedBy: { $exists: false } }
      ]
    });
    
    console.log(`Found ${ordersToUpdate.length} orders to update`);
    
    for (const order of ordersToUpdate) {
      const updateData = {};
      
      // Add empty statusHistory if it doesn't exist
      if (!order.statusHistory) {
        updateData.statusHistory = [{
          status: order.orderStatus || 'pending',
          updatedBy: {
            adminId: 'system',
            adminName: 'System Migration',
            adminEmail: 'system@migration.com'
          },
          updatedAt: order.orderUpdateDate || order.orderDate || new Date(),
          notes: 'Initial status from migration'
        }];
      }
      
      // Add lastUpdatedBy if it doesn't exist
      if (!order.lastUpdatedBy) {
        updateData.lastUpdatedBy = {
          adminId: 'system',
          adminName: 'System Migration',
          adminEmail: 'system@migration.com',
          updatedAt: order.orderUpdateDate || order.orderDate || new Date()
        };
      }
      
      // Update the order
      await Order.findByIdAndUpdate(order._id, updateData);
      console.log(`Updated order ${order._id}`);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateOrderStatusTracking();
}

module.exports = migrateOrderStatusTracking;