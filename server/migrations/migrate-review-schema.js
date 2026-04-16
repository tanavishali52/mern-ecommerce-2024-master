const mongoose = require('mongoose');
const ProductReview = require('../models/Review');

/**
 * Migration script to update existing reviews with new schema fields
 * Run this script after updating the Review model
 */
async function migrateReviewSchema() {
  try {
    console.log('Starting review schema migration...');

    // Update existing reviews to add new fields
    const result = await ProductReview.updateMany(
      { isGenerated: { $exists: false } }, // Reviews without isGenerated field
      {
        $set: {
          isGenerated: false, // Mark existing reviews as not generated
          images: [] // Initialize empty images array
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} existing reviews with new schema fields`);

    // Convert string productId and userId to ObjectId if needed
    const reviewsWithStringIds = await ProductReview.find({
      $or: [
        { productId: { $type: "string" } },
        { userId: { $type: "string" } }
      ]
    });

    for (const review of reviewsWithStringIds) {
      const updateFields = {};
      
      // Convert productId to ObjectId if it's a valid ObjectId string
      if (typeof review.productId === 'string' && mongoose.Types.ObjectId.isValid(review.productId)) {
        updateFields.productId = new mongoose.Types.ObjectId(review.productId);
      }
      
      // Convert userId to ObjectId if it's a valid ObjectId string
      if (typeof review.userId === 'string' && mongoose.Types.ObjectId.isValid(review.userId)) {
        updateFields.userId = new mongoose.Types.ObjectId(review.userId);
      }

      if (Object.keys(updateFields).length > 0) {
        await ProductReview.updateOne({ _id: review._id }, { $set: updateFields });
      }
    }

    console.log(`Converted ${reviewsWithStringIds.length} reviews with string IDs to ObjectIds`);

    // Create indexes
    console.log('Creating database indexes...');
    await ProductReview.createIndexes();
    console.log('Database indexes created successfully');

    console.log('Review schema migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Error during review schema migration:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  async function connectToMongoDB() {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
      throw error;
    }
  }
  
  connectToMongoDB()
    .then(() => migrateReviewSchema())
    .then(() => {
      console.log('Migration completed successfully');
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = migrateReviewSchema;