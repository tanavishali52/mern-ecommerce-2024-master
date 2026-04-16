const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
  getUserStats,
} = require("../../controllers/shop/profile-controller");

const router = express.Router();

router.get("/:userId", getUserProfile);
router.put("/:userId", updateUserProfile);
router.get("/:userId/stats", getUserStats);

module.exports = router;