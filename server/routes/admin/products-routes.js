const express = require("express");
const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/admin/products-controller");
const {
  generateProductReviews,
  getProductReviews,
} = require("../../controllers/admin/review-controller");
const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

// Middleware to handle multipart form data parsing errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 20MB limit'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 files allowed'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
};

// Product image upload endpoint - supports multiple files
router.post(
  "/upload-image",
  upload.array("my_files", 10),
  handleMulterError,
  handleImageUpload
);

// Product CRUD operations
router.post("/add", express.json({ limit: '50mb' }), addProduct);
router.put("/edit/:id", express.json({ limit: '50mb' }), editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

// Product review operations
router.post("/:id/generate-reviews", generateProductReviews);
router.get("/:id/reviews", getProductReviews);

module.exports = router;
