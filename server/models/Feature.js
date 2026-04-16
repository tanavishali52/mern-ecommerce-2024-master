const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    image: String,
    cloudinary_id: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);
