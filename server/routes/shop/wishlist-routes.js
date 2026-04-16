const express = require("express");
const { auth, optionalAuth } = require("../../middleware/auth");
const {
  addToWishlist,
  fetchWishlistItems,
  removeFromWishlist,
} = require("../../controllers/shop/wishlist-controller");

const router = express.Router();

router.post("/add", optionalAuth, addToWishlist);
router.get("/get/:userId", optionalAuth, fetchWishlistItems);
router.delete("/:userId/:productId", optionalAuth, removeFromWishlist);

module.exports = router;