const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for efficient lookups
SettingsSchema.index({ key: 1 });

// Static method to get a setting by key
SettingsSchema.statics.getSetting = async function(key) {
  const setting = await this.findOne({ key, isActive: true });
  return setting ? setting.value : null;
};

// Static method to set a setting
SettingsSchema.statics.setSetting = async function(key, value) {
  return await this.findOneAndUpdate(
    { key },
    { value, isActive: true },
    { upsert: true, new: true }
  );
};

// Static method to get WhatsApp configuration
SettingsSchema.statics.getWhatsAppConfig = async function() {
  const settings = await this.find({
    key: { $in: ['whatsapp_number', 'whatsapp_message', 'whatsapp_enabled'] },
    isActive: true
  });
  
  const config = {
    number: '',
    message: 'Hello! I\'m interested in your products.',
    enabled: false
  };
  
  settings.forEach(setting => {
    switch(setting.key) {
      case 'whatsapp_number':
        config.number = setting.value;
        break;
      case 'whatsapp_message':
        config.message = setting.value;
        break;
      case 'whatsapp_enabled':
        config.enabled = setting.value;
        break;
    }
  });
  
  return config;
};

// Static method to format phone number to E.164 format
// Handles common formats: 03187074919, +92 0318..., 923187074919, +923187074919
SettingsSchema.statics.formatPhoneNumber = function(phoneNumber) {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Remove any + that's not at the start
  cleaned = cleaned.replace(/\+/g, '');
  
  // Handle Pakistani numbers: +92 0... → remove the 0 after country code
  if (cleaned.startsWith('920')) {
    cleaned = '92' + cleaned.substring(3);
  }
  
  // If starts with 0 (local Pakistani format like 03187074919)
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    cleaned = '92' + cleaned.substring(1);
  }
  
  // Add + prefix
  cleaned = '+' + cleaned;
  
  // Validate E.164 format
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(cleaned) ? cleaned : '';
};

// Static method to validate phone number (E.164 format)
SettingsSchema.statics.validatePhoneNumber = function(phoneNumber) {
  if (!phoneNumber) return false;
  
  // E.164 format: + followed by up to 15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
};

// Static method to validate message text
SettingsSchema.statics.validateMessage = function(message) {
  if (!message) return false;
  
  // Message should be between 1 and 500 characters
  return message.length >= 1 && message.length <= 500;
};

module.exports = mongoose.model("Settings", SettingsSchema);