const mongoose = require('mongoose');
const Settings = require('../Settings');

// Mock mongoose for testing
jest.mock('mongoose', () => ({
  Schema: {
    Types: {
      Mixed: 'Mixed'
    }
  },
  model: jest.fn(),
  connect: jest.fn(),
  connection: {
    close: jest.fn()
  }
}));

describe('Settings Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validatePhoneNumber', () => {
    test('should validate correct E.164 phone numbers', () => {
      expect(Settings.validatePhoneNumber('+1234567890')).toBe(true);
      expect(Settings.validatePhoneNumber('+447911123456')).toBe(true);
      expect(Settings.validatePhoneNumber('+919876543210')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(Settings.validatePhoneNumber('')).toBe(false);
      expect(Settings.validatePhoneNumber(null)).toBe(false);
      expect(Settings.validatePhoneNumber(undefined)).toBe(false);
      expect(Settings.validatePhoneNumber('1234567890')).toBe(false); // Missing +
      expect(Settings.validatePhoneNumber('+0123456789')).toBe(false); // Starts with 0
      expect(Settings.validatePhoneNumber('+12345678901234567')).toBe(false); // Too long
      expect(Settings.validatePhoneNumber('+12')).toBe(false); // Too short
      expect(Settings.validatePhoneNumber('+abc123456789')).toBe(false); // Contains letters
    });
  });

  describe('validateMessage', () => {
    test('should validate correct message lengths', () => {
      expect(Settings.validateMessage('Hello')).toBe(true);
      expect(Settings.validateMessage('A'.repeat(500))).toBe(true);
      expect(Settings.validateMessage('A'.repeat(250))).toBe(true);
    });

    test('should reject invalid messages', () => {
      expect(Settings.validateMessage('')).toBe(false);
      expect(Settings.validateMessage(null)).toBe(false);
      expect(Settings.validateMessage(undefined)).toBe(false);
      expect(Settings.validateMessage('A'.repeat(501))).toBe(false); // Too long
    });
  });

  describe('getWhatsAppConfig', () => {
    test('should return default config when no settings exist', async () => {
      // Mock the find method to return empty array
      Settings.find = jest.fn().mockResolvedValue([]);

      const config = await Settings.getWhatsAppConfig();

      expect(config).toEqual({
        number: '',
        message: "Hello! I'm interested in your products.",
        enabled: false
      });
    });

    test('should return config with existing settings', async () => {
      // Mock the find method to return settings
      Settings.find = jest.fn().mockResolvedValue([
        { key: 'whatsapp_number', value: '+1234567890' },
        { key: 'whatsapp_message', value: 'Custom message' },
        { key: 'whatsapp_enabled', value: true }
      ]);

      const config = await Settings.getWhatsAppConfig();

      expect(config).toEqual({
        number: '+1234567890',
        message: 'Custom message',
        enabled: true
      });
    });

    test('should handle partial settings', async () => {
      // Mock the find method to return partial settings
      Settings.find = jest.fn().mockResolvedValue([
        { key: 'whatsapp_number', value: '+1234567890' }
      ]);

      const config = await Settings.getWhatsAppConfig();

      expect(config).toEqual({
        number: '+1234567890',
        message: "Hello! I'm interested in your products.",
        enabled: false
      });
    });
  });

  describe('getSetting', () => {
    test('should return setting value when found', async () => {
      const mockSetting = { value: 'test-value' };
      Settings.findOne = jest.fn().mockResolvedValue(mockSetting);

      const result = await Settings.getSetting('test-key');

      expect(result).toBe('test-value');
      expect(Settings.findOne).toHaveBeenCalledWith({ key: 'test-key', isActive: true });
    });

    test('should return null when setting not found', async () => {
      Settings.findOne = jest.fn().mockResolvedValue(null);

      const result = await Settings.getSetting('non-existent-key');

      expect(result).toBe(null);
    });
  });

  describe('setSetting', () => {
    test('should create or update setting', async () => {
      const mockSetting = { key: 'test-key', value: 'test-value', isActive: true };
      Settings.findOneAndUpdate = jest.fn().mockResolvedValue(mockSetting);

      const result = await Settings.setSetting('test-key', 'test-value');

      expect(result).toEqual(mockSetting);
      expect(Settings.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'test-key' },
        { value: 'test-value', isActive: true },
        { upsert: true, new: true }
      );
    });
  });
});