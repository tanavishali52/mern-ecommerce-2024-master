import {
  isMobileDevice,
  isIOS,
  isAndroid,
  validatePhoneNumber,
  formatPhoneNumber,
  encodeMessageText,
  generateMobileWhatsAppURL,
  generateWebWhatsAppURL,
  generateWhatsAppURLs,
  validateMessage,
  validateWhatsAppConfig,
  getDefaultMessage
} from '../whatsapp-service';

// Mock navigator.userAgent
Object.defineProperty(window.navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
});

describe('WhatsApp Service', () => {
  describe('Device Detection', () => {
    test('should detect mobile devices', () => {
      window.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isMobileDevice()).toBe(true);

      window.navigator.userAgent = 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)';
      expect(isMobileDevice()).toBe(true);

      window.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(isMobileDevice()).toBe(false);
    });

    test('should detect iOS devices', () => {
      window.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isIOS()).toBe(true);

      window.navigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)';
      expect(isIOS()).toBe(true);

      window.navigator.userAgent = 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)';
      expect(isIOS()).toBe(false);
    });

    test('should detect Android devices', () => {
      window.navigator.userAgent = 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)';
      expect(isAndroid()).toBe(true);

      window.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isAndroid()).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    test('should validate correct E.164 phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('+447911123456')).toBe(true);
      expect(validatePhoneNumber('+919876543210')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('')).toBe(false);
      expect(validatePhoneNumber(null)).toBe(false);
      expect(validatePhoneNumber(undefined)).toBe(false);
      expect(validatePhoneNumber('1234567890')).toBe(false); // Missing +
      expect(validatePhoneNumber('+0123456789')).toBe(false); // Starts with 0
      expect(validatePhoneNumber('+12345678901234567')).toBe(false); // Too long
      expect(validatePhoneNumber('+12')).toBe(false); // Too short
    });
  });

  describe('Phone Number Formatting', () => {
    test('should format phone numbers to E.164', () => {
      expect(formatPhoneNumber('1234567890')).toBe('+1234567890');
      expect(formatPhoneNumber('+1234567890')).toBe('+1234567890');
      expect(formatPhoneNumber('(123) 456-7890')).toBe('+1234567890');
      expect(formatPhoneNumber('+1 (234) 567-8900')).toBe('+12345678900');
    });

    test('should return empty string for invalid numbers', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber('abc')).toBe('');
      expect(formatPhoneNumber('+0123456789')).toBe(''); // Invalid format
    });
  });

  describe('Message Encoding', () => {
    test('should encode message text for URLs', () => {
      expect(encodeMessageText('Hello World')).toBe('Hello%20World');
      expect(encodeMessageText('Hello & Welcome!')).toBe('Hello%20%26%20Welcome!');
      expect(encodeMessageText('')).toBe('');
    });
  });

  describe('URL Generation', () => {
    test('should generate mobile WhatsApp URLs', () => {
      const url = generateMobileWhatsAppURL('+1234567890', 'Hello World');
      expect(url).toBe('whatsapp://send?phone=+1234567890&text=Hello%20World');
    });

    test('should generate web WhatsApp URLs', () => {
      const url = generateWebWhatsAppURL('+1234567890', 'Hello World');
      expect(url).toBe('https://web.whatsapp.com/send?phone=+1234567890&text=Hello%20World');
    });

    test('should generate both URLs', () => {
      const urls = generateWhatsAppURLs('+1234567890', 'Hello World');
      expect(urls).toEqual({
        mobile: 'whatsapp://send?phone=+1234567890&text=Hello%20World',
        web: 'https://web.whatsapp.com/send?phone=+1234567890&text=Hello%20World'
      });
    });

    test('should return empty strings for invalid phone numbers', () => {
      expect(generateMobileWhatsAppURL('invalid')).toBe('');
      expect(generateWebWhatsAppURL('invalid')).toBe('');
    });
  });

  describe('Message Validation', () => {
    test('should validate correct message lengths', () => {
      expect(validateMessage('Hello')).toBe(true);
      expect(validateMessage('A'.repeat(500))).toBe(true);
      expect(validateMessage('A'.repeat(250))).toBe(true);
    });

    test('should reject invalid messages', () => {
      expect(validateMessage('')).toBe(false);
      expect(validateMessage(null)).toBe(false);
      expect(validateMessage(undefined)).toBe(false);
      expect(validateMessage('A'.repeat(501))).toBe(false); // Too long
    });
  });

  describe('Configuration Validation', () => {
    test('should validate complete WhatsApp config', () => {
      const config = {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      };

      const result = validateWhatsAppConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('should reject disabled config', () => {
      const config = {
        number: '+1234567890',
        message: 'Hello World',
        enabled: false
      };

      const result = validateWhatsAppConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.general).toBe('WhatsApp is disabled');
    });

    test('should reject config without phone number', () => {
      const config = {
        number: '',
        message: 'Hello World',
        enabled: true
      };

      const result = validateWhatsAppConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.number).toBe('Phone number is required');
    });

    test('should reject config with invalid phone number', () => {
      const config = {
        number: 'invalid',
        message: 'Hello World',
        enabled: true
      };

      const result = validateWhatsAppConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.number).toBe('Invalid phone number format');
    });

    test('should reject config with invalid message', () => {
      const config = {
        number: '+1234567890',
        message: 'A'.repeat(501),
        enabled: true
      };

      const result = validateWhatsAppConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.message).toBe('Message must be between 1 and 500 characters');
    });
  });

  describe('Default Message', () => {
    test('should return default message', () => {
      expect(getDefaultMessage()).toBe("Hello! I'm interested in your products.");
    });
  });
});