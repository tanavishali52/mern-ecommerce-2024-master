const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Settings = require('../../../models/Settings');
const { adminAuth } = require('../../../middleware/auth');
const settingsController = require('../settings-controller');

// Mock the Settings model
jest.mock('../../../models/Settings');

// Mock the auth middleware
jest.mock('../../../middleware/auth', () => ({
  adminAuth: jest.fn((req, res, next) => {
    req.user = { id: 'admin-id', role: 'admin' };
    next();
  })
}));

const app = express();
app.use(express.json());

// Set up routes
app.get('/api/admin/settings/whatsapp', adminAuth, settingsController.getWhatsAppSettings);
app.put('/api/admin/settings/whatsapp', adminAuth, settingsController.updateWhatsAppSettings);
app.get('/api/admin/settings', adminAuth, settingsController.getAllSettings);
app.put('/api/admin/settings/:key', adminAuth, settingsController.updateSetting);

describe('Settings Controller Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/settings/whatsapp', () => {
    test('should return WhatsApp settings successfully', async () => {
      const mockConfig = {
        number: '+1234567890',
        message: 'Hello! How can we help?',
        enabled: true
      };

      Settings.getWhatsAppConfig.mockResolvedValue(mockConfig);

      const response = await request(app)
        .get('/api/admin/settings/whatsapp')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockConfig
      });
      expect(Settings.getWhatsAppConfig).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      Settings.getWhatsAppConfig.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/admin/settings/whatsapp')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to fetch WhatsApp settings'
      });
    });

    test('should require admin authentication', async () => {
      // Mock auth middleware to reject
      adminAuth.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Unauthorized' });
      });

      await request(app)
        .get('/api/admin/settings/whatsapp')
        .expect(401);
    });
  });

  describe('PUT /api/admin/settings/whatsapp', () => {
    test('should update WhatsApp settings successfully', async () => {
      const updateData = {
        number: '+1234567890',
        message: 'Updated message',
        enabled: true
      };

      const updatedConfig = { ...updateData };

      Settings.validatePhoneNumber.mockReturnValue(true);
      Settings.validateMessage.mockReturnValue(true);
      Settings.setSetting.mockResolvedValue({});
      Settings.getWhatsAppConfig.mockResolvedValue(updatedConfig);

      const response = await request(app)
        .put('/api/admin/settings/whatsapp')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'WhatsApp settings updated successfully',
        data: updatedConfig
      });
    });

    test('should validate phone number format', async () => {
      const updateData = {
        number: 'invalid-number',
        message: 'Test message',
        enabled: true
      };

      Settings.validatePhoneNumber.mockReturnValue(false);

      const response = await request(app)
        .put('/api/admin/settings/whatsapp')
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: {
          number: 'Phone number must be in E.164 format (e.g., +1234567890)'
        }
      });
    });

    test('should validate message length', async () => {
      const updateData = {
        number: '+1234567890',
        message: 'A'.repeat(501),
        enabled: true
      };

      Settings.validatePhoneNumber.mockReturnValue(true);
      Settings.validateMessage.mockReturnValue(false);

      const response = await request(app)
        .put('/api/admin/settings/whatsapp')
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: {
          message: 'Message must be between 1 and 500 characters'
        }
      });
    });

    test('should require phone number when enabled', async () => {
      const updateData = {
        number: '',
        message: 'Test message',
        enabled: true
      };

      const response = await request(app)
        .put('/api/admin/settings/whatsapp')
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: {
          number: 'Phone number is required when WhatsApp is enabled'
        }
      });
    });

    test('should handle multiple validation errors', async () => {
      const updateData = {
        number: 'invalid',
        message: 'A'.repeat(501),
        enabled: true
      };

      Settings.validatePhoneNumber.mockReturnValue(false);
      Settings.validateMessage.mockReturnValue(false);

      const response = await request(app)
        .put('/api/admin/settings/whatsapp')
        .send(updateData)
        .expect(400);

      expect(response.body.errors).toHaveProperty('number');
      expect(response.body.errors).toHaveProperty('message');
    });

    test('should allow disabling without phone number', async () => {
      const updateData = {
        number: '',
        message: 'Test message',
        enabled: false
      };

      Settings.validateMessage.mockReturnValue(true);
      Settings.setSetting.mockResolvedValue({});
      Settings.getWhatsAppConfig.mockResolvedValue(updateData);

      const response = await request(app)
        .put('/api/admin/settings/whatsapp')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle database errors during update', async () => {
      const updateData = {
        number: '+1234567890',
        message: 'Test message',
        enabled: true
      };

      Settings.validatePhoneNumber.mockReturnValue(true);
      Settings.validateMessage.mockReturnValue(true);
      Settings.setSetting.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/admin/settings/whatsapp')
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to update WhatsApp settings'
      });
    });
  });

  describe('GET /api/admin/settings', () => {
    test('should return all settings', async () => {
      const mockSettings = [
        { key: 'whatsapp_number', value: '+1234567890' },
        { key: 'whatsapp_enabled', value: true }
      ];

      Settings.find.mockResolvedValue(mockSettings);

      const response = await request(app)
        .get('/api/admin/settings')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockSettings
      });
      expect(Settings.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('PUT /api/admin/settings/:key', () => {
    test('should update individual setting', async () => {
      const mockSetting = { key: 'test_key', value: 'test_value' };
      Settings.setSetting.mockResolvedValue(mockSetting);

      const response = await request(app)
        .put('/api/admin/settings/test_key')
        .send({ value: 'test_value' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Setting updated successfully',
        data: mockSetting
      });
      expect(Settings.setSetting).toHaveBeenCalledWith('test_key', 'test_value');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .put('/api/admin/settings/test_key')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Key and value are required'
      });
    });
  });

  describe('Authentication', () => {
    test('should protect all endpoints with admin auth', async () => {
      // Mock auth to fail
      adminAuth.mockImplementation((req, res, next) => {
        return res.status(401).json({ message: 'Unauthorized' });
      });

      await request(app).get('/api/admin/settings/whatsapp').expect(401);
      await request(app).put('/api/admin/settings/whatsapp').expect(401);
      await request(app).get('/api/admin/settings').expect(401);
      await request(app).put('/api/admin/settings/test').expect(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      Settings.getWhatsAppConfig.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .get('/api/admin/settings/whatsapp')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to fetch WhatsApp settings');
    });
  });
});