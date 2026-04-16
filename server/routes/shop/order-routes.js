const express = require("express");

const {
  createOrder,
  createGuestOrder,
  createUnifiedOrder,
  getAllOrdersByUser,
  getOrdersByGuestName,
  getOrderDetails,
  getOrderTimeline,
  generateSupportContact,
  capturePayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/guest", createGuestOrder);
router.post("/unified", createUnifiedOrder);
router.post("/capture", capturePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/guest/:guestName", getOrdersByGuestName);
router.get("/details/:id", getOrderDetails);
router.get("/:orderId/timeline", getOrderTimeline);
router.post("/:orderId/contact-support", generateSupportContact);

module.exports = router;
