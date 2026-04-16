const Feature = require("../../models/Feature");
const cloudinary = require("cloudinary").v2;

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    console.log(image, "image");

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const feature = await Feature.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found",
      });
    }

    // Delete image from Cloudinary if cloudinary_id exists
    if (feature.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(feature.cloudinary_id);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    } else if (feature.image) {
      // Extract public_id from the Cloudinary URL if cloudinary_id is not stored
      try {
        const urlParts = feature.image.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await Feature.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
