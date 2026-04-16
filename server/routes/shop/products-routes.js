const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  getAvailableBrands,
  getFilterCounts,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.get("/brands/available", getAvailableBrands);
router.get("/filters/counts", getFilterCounts);

module.exports = router;
