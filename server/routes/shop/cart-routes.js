const express = require("express");
const { auth, optionalAuth } = require("../../middleware/auth");
const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

router.post("/add", optionalAuth, addToCart);
router.get("/get/:userId", optionalAuth, fetchCartItems);
router.put("/update-cart", optionalAuth, updateCartItemQty);
router.delete("/:userId/:productId", optionalAuth, deleteCartItem);

module.exports = router;
