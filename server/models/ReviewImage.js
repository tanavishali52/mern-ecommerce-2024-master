const mongoose = require("mongoose");

const ReviewImageSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'ProductReview'
    },
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String
    },
    size: {
      type: Number
    },
    mimeType: {
      type: String
    }
  },
  { timestamps: true }
);

// Index for efficient queries
ReviewImageSchema.index({ reviewId: 1 });

module.exports = mongoose.model("ReviewImage", ReviewImageSchema);