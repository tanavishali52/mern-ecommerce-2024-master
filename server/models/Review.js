const mongoose = require("mongoose");

const ProductReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null for generated reviews
    },
    userName: {
      type: String,
      required: true
    },
    reviewMessage: {
      type: String,
      required: true
    },
    reviewValue: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    isGenerated: {
      type: Boolean,
      default: false
    },
    generatedAt: {
      type: Date
    },
    blockId: {
      type: Number // Which block this review came from
    },
    blockPosition: {
      type: Number // Position within the block (0-4)
    },
    images: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReviewImage'
    }]
  },
  { timestamps: true }
);

// Indexes for optimal query performance
ProductReviewSchema.index({ productId: 1 });
ProductReviewSchema.index({ isGenerated: 1 });
ProductReviewSchema.index({ productId: 1, isGenerated: 1 });
ProductReviewSchema.index({ createdAt: -1 });
ProductReviewSchema.index({ blockId: 1, blockPosition: 1 });

module.exports = mongoose.model("ProductReview", ProductReviewSchema);
