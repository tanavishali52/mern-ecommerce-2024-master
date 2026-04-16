/**
 * WhatsApp Service - Utility functions for WhatsApp integration
 */

/**
 * Detects if the user is on a mobile device
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detects if the user is on iOS
 * @returns {boolean} True if iOS device
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Detects if the user is on Android
 * @returns {boolean} True if Android device
 */
export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Validates phone number format (E.164)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid E.164 format
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  
  // E.164 format: + followed by up to 15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
};

/**
 * Formats phone number to E.164 format
 * Handles common Pakistani number formats:
 *   - 03187074919 → +923187074919
 *   - 0318 7074919 → +923187074919
 *   - +92 03187074919 → +923187074919
 *   - +92 318 7074919 → +923187074919
 *   - 923187074919 → +923187074919
 *   - +923187074919 → +923187074919 (already correct)
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted phone number or empty string if invalid
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Remove any + that's not at the start
  const hasPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/\+/g, '');
  
  // Handle Pakistani numbers specifically
  // If starts with +92 0... → remove the 0 after country code
  if (cleaned.startsWith('920')) {
    cleaned = '92' + cleaned.substring(3);
  }
  
  // If starts with 0 (local Pakistani format like 03187074919)
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    cleaned = '92' + cleaned.substring(1);
  }
  
  // Add + prefix
  cleaned = '+' + cleaned;
  
  // Validate and return
  return validatePhoneNumber(cleaned) ? cleaned : '';
};

/**
 * Encodes text for URL usage
 * @param {string} text - Text to encode
 * @returns {string} URL encoded text
 */
export const encodeMessageText = (text) => {
  if (!text) return '';
  return encodeURIComponent(text);
};

/**
 * Strips the leading + from a phone number for use in WhatsApp URLs
 * WhatsApp API expects just digits (country code + number) without the + prefix
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +923001234567)
 * @returns {string} Phone number without + prefix (e.g., 923001234567)
 */
const stripPlusPrefix = (phoneNumber) => {
  return phoneNumber.replace(/^\+/, '');
};

/**
 * Generates WhatsApp URL for mobile app
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} message - Pre-filled message text
 * @returns {string} WhatsApp mobile app URL
 */
export const generateMobileWhatsAppURL = (phoneNumber, message = '') => {
  if (!validatePhoneNumber(phoneNumber)) {
    console.error('Invalid phone number for WhatsApp:', phoneNumber);
    return '';
  }
  
  const cleanNumber = stripPlusPrefix(phoneNumber);
  const encodedMessage = encodeMessageText(message);
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
};

/**
 * Generates WhatsApp Web URL
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} message - Pre-filled message text
 * @returns {string} WhatsApp Web URL
 */
export const generateWebWhatsAppURL = (phoneNumber, message = '') => {
  if (!validatePhoneNumber(phoneNumber)) {
    console.error('Invalid phone number for WhatsApp:', phoneNumber);
    return '';
  }
  
  const cleanNumber = stripPlusPrefix(phoneNumber);
  const encodedMessage = encodeMessageText(message);
  return `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
};

/**
 * Generates the appropriate WhatsApp URL based on device
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} message - Pre-filled message text
 * @returns {object} Object with mobile and web URLs
 */
export const generateWhatsAppURLs = (phoneNumber, message = '') => {
  return {
    mobile: generateMobileWhatsAppURL(phoneNumber, message),
    web: generateWebWhatsAppURL(phoneNumber, message)
  };
};

/**
 * Opens WhatsApp with fallback logic
 * Uses https://api.whatsapp.com/send which works universally on both mobile and desktop.
 * On mobile it opens the WhatsApp app; on desktop it redirects to WhatsApp Web.
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} message - Pre-filled message text
 * @returns {boolean} True if successfully opened
 */
export const openWhatsApp = (phoneNumber, message = '') => {
  // Try to format the phone number first (removes spaces, dashes, etc.)
  let cleanedNumber = phoneNumber;
  if (!validatePhoneNumber(phoneNumber)) {
    cleanedNumber = formatPhoneNumber(phoneNumber);
    if (!cleanedNumber) {
      console.error('Cannot open WhatsApp: Invalid phone number', phoneNumber);
      return false;
    }
  }

  // Use the universal api.whatsapp.com URL (works on both mobile and desktop)
  const url = generateMobileWhatsAppURL(cleanedNumber, message);
  
  if (!url) {
    console.error('Failed to generate WhatsApp URL');
    return false;
  }

  try {
    // Use an anchor element click to avoid popup blockers
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to open WhatsApp:', error);
    // Fallback: try window.open
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return false;
    }
  }
};

/**
 * Validates message text
 * @param {string} message - Message text to validate
 * @returns {boolean} True if valid message
 */
export const validateMessage = (message) => {
  if (!message) return false;
  return message.length >= 1 && message.length <= 500;
};

/**
 * Gets default WhatsApp message
 * @returns {string} Default message text
 */
export const getDefaultMessage = () => {
  return "Hello! I'm interested in your products.";
};

/**
 * Checks if WhatsApp configuration is valid
 * @param {object} config - WhatsApp configuration object
 * @returns {object} Validation result with isValid and errors
 */
export const validateWhatsAppConfig = (config) => {
  const errors = {};
  let isValid = true;

  if (!config) {
    return { isValid: false, errors: { general: 'Configuration is required' } };
  }

  // Check if enabled
  if (!config.enabled) {
    return { isValid: false, errors: { general: 'WhatsApp is disabled' } };
  }

  // Validate phone number
  if (!config.number) {
    errors.number = 'Phone number is required';
    isValid = false;
  } else if (!validatePhoneNumber(config.number)) {
    errors.number = 'Invalid phone number format';
    isValid = false;
  }

  // Validate message
  if (config.message && !validateMessage(config.message)) {
    errors.message = 'Message must be between 1 and 500 characters';
    isValid = false;
  }

  return { isValid, errors };
};