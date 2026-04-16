import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import settingsReducer, {
  fetchWhatsAppSettings,
  updateWhatsAppSettings,
  clearError,
  updateWhatsAppField,
  resetWhatsAppSettings
} from '../index';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('Settings Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        adminSettings: settingsReducer
      }
    });
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify('mock-token'));
  });

  describe('Initial State', () => {
    test('should have correct initial state', () => {
      const state = store.getState().adminSettings;
      expect(state).toEqual({
        whatsapp: {
          number: '',
          message: "Hello! I'm interested in your products.",
          enabled: false
        },
        isLoading: false,
        error: null
      });
    });
  });

  describe('Synchronous Actions', () => {
    test('should clear error', () => {
      // First set an error
      store.dispatch({ type: 'adminSettings/fetchWhatsAppSettings/rejected', payload: { message: 'Test error' } });
      
      // Then clear it
      store.dispatch(clearError());
      
      const state = store.getState().adminSettings;
      expect(state.error).toBe(null);
    });

    test('should update WhatsApp field', () => {
      store.dispatch(updateWhatsAppField({ field: 'number', value: '+1234567890' }));
      
      const state = store.getState().adminSettings;
      expect(state.whatsapp.number).toBe('+1234567890');
    });

    test('should reset WhatsApp settings', () => {
      // First modify settings
      store.dispatch(updateWhatsAppField({ field: 'number', value: '+1234567890' }));
      store.dispatch(updateWhatsAppField({ field: 'enabled', value: true }));
      
      // Then reset
      store.dispatch(resetWhatsAppSettings());
      
      const state = store.getState().adminSettings;
      expect(state.whatsapp).toEqual({
        number: '',
        message: "Hello! I'm interested in your products.",
        enabled: false
      });
    });
  });

  describe('Async Actions', () => {
    describe('fetchWhatsAppSettings', () => {
      test('should handle successful fetch', async () => {
        const mockData = {
          number: '+1234567890',
          message: 'Custom message',
          enabled: true
        };

        mockedAxios.get.mockResolvedValueOnce({
          data: {
            success: true,
            data: mockData
          }
        });

        await store.dispatch(fetchWhatsAppSettings());

        const state = store.getState().adminSettings;
        expect(state.isLoading).toBe(false);
        expect(state.whatsapp).toEqual(mockData);
        expect(state.error).toBe(null);
      });

      test('should handle fetch error', async () => {
        const errorMessage = 'Failed to fetch settings';
        mockedAxios.get.mockRejectedValueOnce({
          response: {
            data: { message: errorMessage }
          }
        });

        await store.dispatch(fetchWhatsAppSettings());

        const state = store.getState().adminSettings;
        expect(state.isLoading).toBe(false);
        expect(state.error).toEqual({ message: errorMessage });
      });

      test('should set loading state during fetch', () => {
        mockedAxios.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

        store.dispatch(fetchWhatsAppSettings());

        const state = store.getState().adminSettings;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe(null);
      });
    });

    describe('updateWhatsAppSettings', () => {
      test('should handle successful update', async () => {
        const updateData = {
          number: '+1234567890',
          message: 'Updated message',
          enabled: true
        };

        const mockResponse = {
          success: true,
          data: updateData
        };

        mockedAxios.put.mockResolvedValueOnce({
          data: mockResponse
        });

        await store.dispatch(updateWhatsAppSettings(updateData));

        const state = store.getState().adminSettings;
        expect(state.isLoading).toBe(false);
        expect(state.whatsapp).toEqual(updateData);
        expect(state.error).toBe(null);
      });

      test('should handle update error', async () => {
        const errorMessage = 'Validation failed';
        const updateData = { number: 'invalid' };

        mockedAxios.put.mockRejectedValueOnce({
          response: {
            data: { message: errorMessage }
          }
        });

        await store.dispatch(updateWhatsAppSettings(updateData));

        const state = store.getState().adminSettings;
        expect(state.isLoading).toBe(false);
        expect(state.error).toEqual({ message: errorMessage });
      });

      test('should set loading state during update', () => {
        mockedAxios.put.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

        store.dispatch(updateWhatsAppSettings({}));

        const state = store.getState().adminSettings;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe(null);
      });
    });
  });

  describe('API Calls', () => {
    test('should call correct endpoint for fetch', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { success: true, data: {} } });

      await store.dispatch(fetchWhatsAppSettings());

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5001/api/admin/settings/whatsapp',
        {
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    test('should call correct endpoint for update', async () => {
      const updateData = { number: '+1234567890' };
      mockedAxios.put.mockResolvedValueOnce({ data: { success: true, data: updateData } });

      await store.dispatch(updateWhatsAppSettings(updateData));

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:5001/api/admin/settings/whatsapp',
        updateData,
        {
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });
  });
});