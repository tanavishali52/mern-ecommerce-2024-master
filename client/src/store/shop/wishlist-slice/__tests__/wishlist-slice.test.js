import { configureStore } from '@reduxjs/toolkit';
import wishlistReducer, {
  addToWishlist,
  fetchWishlistItems,
  removeFromWishlist,
  clearWishlist,
  clearWishlistState,
  setError,
  clearError,
  optimisticAddToWishlist,
  optimisticRemoveFromWishlist
} from '../index';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios;

describe('wishlistSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        wishlist: wishlistReducer
      }
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().wishlist;
      expect(state).toEqual({
        wishlistItems: null,
        isLoading: false,
        error: null
      });
    });
  });

  describe('synchronous actions', () => {
    it('should clear wishlist state', () => {
      // Set some initial state
      store.dispatch(setError('Some error'));
      
      // Clear the state
      store.dispatch(clearWishlistState());
      
      const state = store.getState().wishlist;
      expect(state.wishlistItems).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should set error', () => {
      const errorMessage = 'Test error';
      store.dispatch(setError(errorMessage));
      
      const state = store.getState().wishlist;
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error', () => {
      // Set error first
      store.dispatch(setError('Test error'));
      
      // Clear error
      store.dispatch(clearError());
      
      const state = store.getState().wishlist;
      expect(state.error).toBeNull();
    });

    it('should optimistically add to wishlist', () => {
      // Set initial wishlist state
      const initialState = {
        wishlistItems: { items: [] },
        isLoading: false,
        error: null
      };
      
      const newItem = {
        productId: '123',
        title: 'Test Product',
        price: 29.99
      };

      // Create store with initial state
      const storeWithItems = configureStore({
        reducer: { wishlist: wishlistReducer },
        preloadedState: { wishlist: initialState }
      });

      storeWithItems.dispatch(optimisticAddToWishlist(newItem));
      
      const state = storeWithItems.getState().wishlist;
      expect(state.wishlistItems.items).toHaveLength(1);
      expect(state.wishlistItems.items[0]).toEqual(newItem);
    });

    it('should optimistically remove from wishlist', () => {
      // Set initial wishlist state with items
      const initialState = {
        wishlistItems: { 
          items: [
            { productId: '123', title: 'Product 1' },
            { productId: '456', title: 'Product 2' }
          ] 
        },
        isLoading: false,
        error: null
      };

      const storeWithItems = configureStore({
        reducer: { wishlist: wishlistReducer },
        preloadedState: { wishlist: initialState }
      });

      storeWithItems.dispatch(optimisticRemoveFromWishlist('123'));
      
      const state = storeWithItems.getState().wishlist;
      expect(state.wishlistItems.items).toHaveLength(1);
      expect(state.wishlistItems.items[0].productId).toBe('456');
    });
  });

  describe('async actions', () => {
    describe('addToWishlist', () => {
      it('should handle successful add to wishlist', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              items: [{ productId: '123', title: 'Test Product' }]
            }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        await store.dispatch(addToWishlist({ userId: 'user1', productId: '123' }));

        const state = store.getState().wishlist;
        expect(state.isLoading).toBe(false);
        expect(state.wishlistItems).toEqual(mockResponse.data.data);
        expect(state.error).toBeNull();
      });

      it('should handle failed add to wishlist', async () => {
        const mockError = {
          response: {
            data: {
              success: false,
              message: 'Failed to add to wishlist'
            }
          }
        };

        mockedAxios.post.mockRejectedValueOnce(mockError);

        await store.dispatch(addToWishlist({ userId: 'user1', productId: '123' }));

        const state = store.getState().wishlist;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Failed to add to wishlist');
      });
    });

    describe('fetchWishlistItems', () => {
      it('should handle successful fetch wishlist items', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              items: [
                { productId: '123', title: 'Product 1' },
                { productId: '456', title: 'Product 2' }
              ]
            }
          }
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        await store.dispatch(fetchWishlistItems('user1'));

        const state = store.getState().wishlist;
        expect(state.isLoading).toBe(false);
        expect(state.wishlistItems).toEqual(mockResponse.data.data);
        expect(state.error).toBeNull();
      });

      it('should handle failed fetch wishlist items', async () => {
        const mockError = {
          response: {
            data: {
              success: false,
              message: 'Failed to fetch wishlist items'
            }
          }
        };

        mockedAxios.get.mockRejectedValueOnce(mockError);

        await store.dispatch(fetchWishlistItems('user1'));

        const state = store.getState().wishlist;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Failed to fetch wishlist items');
      });
    });

    describe('removeFromWishlist', () => {
      it('should handle successful remove from wishlist', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              items: []
            }
          }
        };

        mockedAxios.delete.mockResolvedValueOnce(mockResponse);

        await store.dispatch(removeFromWishlist({ userId: 'user1', productId: '123' }));

        const state = store.getState().wishlist;
        expect(state.isLoading).toBe(false);
        expect(state.wishlistItems).toEqual(mockResponse.data.data);
        expect(state.error).toBeNull();
      });

      it('should handle failed remove from wishlist', async () => {
        const mockError = {
          response: {
            data: {
              success: false,
              message: 'Failed to remove from wishlist'
            }
          }
        };

        mockedAxios.delete.mockRejectedValueOnce(mockError);

        await store.dispatch(removeFromWishlist({ userId: 'user1', productId: '123' }));

        const state = store.getState().wishlist;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Failed to remove from wishlist');
      });
    });

    describe('clearWishlist', () => {
      it('should handle successful clear wishlist', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              items: []
            }
          }
        };

        mockedAxios.delete.mockResolvedValueOnce(mockResponse);

        await store.dispatch(clearWishlist('user1'));

        const state = store.getState().wishlist;
        expect(state.isLoading).toBe(false);
        expect(state.wishlistItems).toEqual(mockResponse.data.data);
        expect(state.error).toBeNull();
      });

      it('should handle failed clear wishlist', async () => {
        const mockError = {
          response: {
            data: {
              success: false,
              message: 'Failed to clear wishlist'
            }
          }
        };

        mockedAxios.delete.mockRejectedValueOnce(mockError);

        await store.dispatch(clearWishlist('user1'));

        const state = store.getState().wishlist;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Failed to clear wishlist');
      });
    });
  });

  describe('loading states', () => {
    it('should set loading to true when async actions are pending', () => {
      // Mock a pending promise
      mockedAxios.post.mockImplementationOnce(() => new Promise(() => {}));
      
      store.dispatch(addToWishlist({ userId: 'user1', productId: '123' }));
      
      const state = store.getState().wishlist;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });
});