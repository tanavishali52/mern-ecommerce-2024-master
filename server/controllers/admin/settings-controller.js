const Settings = require("../../models/Settings");

// Get WhatsApp settings (admin only)
const getWhatsAppSettings = async (req, res) => {
  try {
    const config = await Settings.getWhatsAppConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error("Error fetching WhatsApp settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch WhatsApp settings"
    });
  }
};

// Get public WhatsApp configuration (for customer-facing components)
const getPublicWhatsAppSettings = async (req, res) => {
  try {
    const config = await Settings.getWhatsAppConfig();
    
    // Only return public information (hide sensitive admin details)
    const publicConfig = {
      enabled: config.enabled,
      number: config.enabled ? config.number : '',
      message: config.enabled ? config.message : ''
    };
    
    res.status(200).json({
      success: true,
      data: publicConfig
    });
  } catch (error) {
    console.error("Error fetching public WhatsApp settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch WhatsApp configuration"
    });
  }
};

// Update WhatsApp settings
const updateWhatsAppSettings = async (req, res) => {
  try {
    let { number, message, enabled } = req.body;
    
    // Auto-format phone number if provided
    if (number) {
      const formatted = Settings.formatPhoneNumber(number);
      if (formatted) {
        number = formatted;
      }
    }
    
    // Validation
    const errors = {};
    
    // Validate phone number if provided and enabled
    if (enabled && number) {
      if (!Settings.validatePhoneNumber(number)) {
        errors.number = "Invalid phone number. Enter a valid number like 03187074919, +923187074919, or +92 318 7074919";
      }
    }
    
    // Validate message
    if (message && !Settings.validateMessage(message)) {
      errors.message = "Message must be between 1 and 500 characters";
    }
    
    // If enabled is true but no number provided
    if (enabled && !number) {
      errors.number = "Phone number is required when WhatsApp is enabled";
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }
    
    // Update settings
    const updates = [];
    
    if (number !== undefined) {
      updates.push(Settings.setSetting('whatsapp_number', number));
    }
    
    if (message !== undefined) {
      updates.push(Settings.setSetting('whatsapp_message', message));
    }
    
    if (enabled !== undefined) {
      updates.push(Settings.setSetting('whatsapp_enabled', enabled));
    }
    
    await Promise.all(updates);
    
    // Return updated configuration
    const updatedConfig = await Settings.getWhatsAppConfig();
    
    res.status(200).json({
      success: true,
      message: "WhatsApp settings updated successfully",
      data: updatedConfig
    });
    
  } catch (error) {
    console.error("Error updating WhatsApp settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update WhatsApp settings"
    });
  }
};

// Get all settings (for future expansion)
const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find({ isActive: true }).sort({ key: 1 });
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings"
    });
  }
};

// Update a single setting (for future expansion)
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Key and value are required"
      });
    }
    
    const setting = await Settings.setSetting(key, value);
    
    res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: setting
    });
    
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update setting"
    });
  }
};

module.exports = {
  getWhatsAppSettings,
  getPublicWhatsAppSettings,
  updateWhatsAppSettings,
  getAllSettings,
  updateSetting
};