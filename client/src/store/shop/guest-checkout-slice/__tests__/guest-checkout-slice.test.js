import { configureStore } from '@reduxjs/toolkit';
import guestCheckoutReducer, {
  openGuestCheckout,
  closeGuestCheckout,
  setOrderData,
  clearGuestOrder,
  setError,
  clearError,
  loadOrderDataFromStorage,
  submitGuestOrder
} from '../index';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock axios
jest.mock('axios');

describe('guestCheckoutSlice', () => {
  let store;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        guestCheckout: guestCheckoutReducer,
      },
    });
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().guestCheckout;
      expect(state).toEqual({
        isModalOpen: false,
        selectedProduct: null,
        isLoading: false,
        orderData: null,
        error: null,
        orderConfirmation: null,
      });
    });
  });

  describe('openGuestCheckout', () => {
    it('should open modal and set selected product', () => {
      const mockProduct = {
        _id: '123',
        title: 'Test Product',
        price: 100,
        image: 'test.jpg'
      };

      store.dispatch(openGuestCheckout(mockProduct));
      const state = store.getState().guestCheckout;

      expect(state.isModalOpen).toBe(true);
      expect(state.selectedProduct).toEqual(mockProduct);
      expect(state.error).toBe(null);
      expect(state.orderConfirmation).toBe(null);
    });
  });

  describe('closeGuestCheckout', () => {
    it('should close modal and clear state', () => {
      // First open the modal
      const mockProduct = { _id: '123', title: 'Test Product' };
      store.dispatch(openGuestCheckout(mockProduct));
      
      // Then close it
      store.dispatch(closeGuestCheckout());
      const state = store.getState().guestCheckout;

      expect(state.isModalOpen).toBe(false);
      expect(state.selectedProduct).toBe(null);
      expect(state.error).toBe(null);
      expect(state.orderData).toBe(null);
    });
  });

  describe('setOrderData', () => {
    it('should set order data and store in localStorage', () => {
      const mockOrderData = {
        product: { _id: '123', title: 'Test Product' },
        customer: {
          fullName: 'John Doe',
          phoneNumber: '+1234567890',
          shippingAddress: '123 Main St',
          city: 'Test City'
        }
      };

      store.dispatch(setOrderData(mockOrderData));
      const state = store.getState().guestCheckout;

      expect(state.orderData).toEqual(mockOrderData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'guestOrderData',
        JSON.stringify(mockOrderData)
      );
    });
  });

  describe('clearGuestOrder', () => {
    it('should clear order data and remove from localStorage', () => {
      // First set some order data
      const mockOrderData = { product: { _id: '123' } };
      store.dispatch(setOrderData(mockOrderData));
      
      // Then clear it
      store.dispatch(clearGuestOrder());
      const state = store.getState().guestCheckout;

      expect(state.orderData).toBe(null);
      expect(state.orderConfirmation).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('guestOrderData');
    });
  });

  describe('setError and clearError', () => {
    it('should set and clear error messages', () => {
      const errorMessage = 'Test error message';
      
      store.dispatch(setError(errorMessage));
      let state = store.getState().guestCheckout;
      expect(state.error).toBe(errorMessage);

      store.dispatch(clearError());
      state = store.getState().guestCheckout;
      expect(state.error).toBe(null);
    });
  });

  describe('loadOrderDataFromStorage', () => {
    it('should load order data from localStorage', () => {
      const mockOrderData = { product: { _id: '123' } };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockOrderData));

      store.dispatch(loadOrderDataFromStorage());
      const state = store.getState().guestCheckout;

      expect(state.orderData).toEqual(mockOrderData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('guestOrderData');
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      store.dispatch(loadOrderDataFromStorage());
      const state = store.getState().guestCheckout;

      expect(state.orderData).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('guestOrderData');
    });

    it('should handle null localStorage value', () => {
      localStorageMock.getItem.mockReturnValue(null);

      store.dispatch(loadOrderDataFromStorage());
      const state = store.getState().guestCheckout;

      expect(state.orderData).toBe(null);
    });
  });

  describe('submitGuestOrder async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: submitGuestOrder.pending.type };
      const state = guestCheckoutReducer(undefined, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fulfilled state', () => {
      const mockResponse = {
        data: {
          orderId: '123',
          orderNumber: 'ORD-001',
          status: 'confirmed'
        }
      };
      
      const action = {
        type: submitGuestOrder.fulfilled.type,
        payload: mockResponse
      };
      
      const state = guestCheckoutReducer(undefined, action);

      expect(state.isLoading).toBe(false);
      expect(state.orderConfirmation).toEqual(mockResponse.data);
      expect(state.error).toBe(null);
      expect(state.orderData).toBe(null);
    });

    it('should handle rejected state', () => {
      const errorMessage = 'Order submission failed';
      const action = {
        type: submitGuestOrder.rejected.type,
        payload: { message: errorMessage }
      };
      
      const state = guestCheckoutReducer(undefined, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle rejected state with default error message', () => {
      const action = {
        type: submitGuestOrder.rejected.type,
        payload: {}
      };
      
      const state = guestCheckoutReducer(undefined, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to submit guest order');
    });
  });
});