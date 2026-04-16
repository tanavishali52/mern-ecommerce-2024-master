const express = require("express");
const { adminAuth } = require("../../middleware/auth");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");

const router = express.Router();

router.get("/get", adminAuth, getAllOrdersOfAllUsers);
router.get("/details/:id", adminAuth, getOrderDetailsForAdmin);
router.put("/update/:id", adminAuth, updateOrderStatus);

module.exports = router;
