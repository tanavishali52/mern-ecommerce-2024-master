const express = require("express");
const { adminAuth } = require("../../middleware/auth");
const {
  getWhatsAppSettings,
  getPublicWhatsAppSettings,
  updateWhatsAppSettings,
  getAllSettings,
  updateSetting
} = require("../../controllers/admin/settings-controller");

const router = express.Router();

// WhatsApp specific routes
router.get("/whatsapp", adminAuth, getWhatsAppSettings);
router.put("/whatsapp", adminAuth, updateWhatsAppSettings);

// Public WhatsApp configuration (for customer-facing components)
router.get("/whatsapp/public", getPublicWhatsAppSettings);

// General settings routes (for future expansion)
router.get("/", adminAuth, getAllSettings);
router.put("/:key", adminAuth, updateSetting);

module.exports = router;