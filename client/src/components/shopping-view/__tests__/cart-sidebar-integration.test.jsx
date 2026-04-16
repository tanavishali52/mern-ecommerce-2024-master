import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import CartSidebar from '../cart-sidebar';
import cartReducer from '@/store/shop/cart-slice';
import authReducer from '@/store/auth-slice';

// Mock toast
const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      shopCart: cartReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { id: 'user1', userName: 'Test User' }
      },
      shopCart: {
        cartItems: { items: [] },
        isLoading: false,
        error: null
      },
      ...initialState
    }
  });
};

const renderWithProviders = (component, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('CartSidebar Integration Tests', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Checkout Navigation', () => {
    it('should close sidebar and navigate to checkout when proceed to checkout is clicked', () => {
      const mockCartItems = [
        {
          productId: '1',
          title: 'Test Product',
          brand: 'Test Brand',
          price: 29.99,
          salePrice: 0,
          quantity: 1,
          totalStock: 10,
          image: 'test-image.jpg'
        }
      ];

      const store = createMockStore({
        shopCart: {
          cartItems: { items: mockCartItems },
          isLoading: false,
          error: null
        }
      });

      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      const checkoutButton = screen.getByText('Proceed to Checkout');
      fireEvent.click(checkoutButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/shop/checkout');
    });

    it('should close sidebar and navigate to listing when continue shopping is clicked', () => {
      const store = createMockStore();
      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      const continueShoppingButton = screen.getByText('Continue Shopping');
      fireEvent.click(continueShoppingButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/shop/listing');
    });
  });

  describe('Auto-close Functionality', () => {
    it('should auto-close sidebar after removing last item from cart', async () => {
      const mockCartItems = [
        {
          productId: '1',
          title: 'Last Product',
          brand: 'Test Brand',
          price: 29.99,
          salePrice: 0,
          quantity: 1,
          totalStock: 10,
          image: 'test-image.jpg'
        }
      ];

      const store = createMockStore({
        shopCart: {
          cartItems: { items: mockCartItems },
          isLoading: false,
          error: null
        }
      });

      // Mock the dispatch to return success with empty cart
      const mockDispatch = jest.fn().mockResolvedValue({
        payload: {
          success: true,
          data: { items: [] } // Empty cart after removal
        }
      });

      store.dispatch = mockDispatch;

      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      // Find and click remove button
      const removeButton = screen.getByRole('button', { name: '' }); // Trash icon button
      fireEvent.click(removeButton);

      // Wait for the async operation
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });

      // Fast-forward the auto-close timer
      jest.advanceTimersByTime(1500);

      // Should auto-close the sidebar
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not auto-close sidebar if cart still has items after removal', async () => {
      const mockCartItems = [
        {
          productId: '1',
          title: 'Product 1',
          brand: 'Test Brand',
          price: 29.99,
          salePrice: 0,
          quantity: 1,
          totalStock: 10,
          image: 'test-image.jpg'
        },
        {
          productId: '2',
          title: 'Product 2',
          brand: 'Test Brand',
          price: 39.99,
          salePrice: 0,
          quantity: 1,
          totalStock: 10,
          image: 'test-image-2.jpg'
        }
      ];

      const store = createMockStore({
        shopCart: {
          cartItems: { items: mockCartItems },
          isLoading: false,
          error: null
        }
      });

      // Mock the dispatch to return success with remaining items
      const mockDispatch = jest.fn().mockResolvedValue({
        payload: {
          success: true,
          data: { 
            items: [mockCartItems[1]] // One item remaining
          }
        }
      });

      store.dispatch = mockDispatch;

      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      // Find and click first remove button
      const removeButtons = screen.getAllByRole('button', { name: '' });
      const removeButton = removeButtons.find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );
      
      if (removeButton) {
        fireEvent.click(removeButton);
      }

      // Wait for the async operation
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });

      // Fast-forward the auto-close timer
      jest.advanceTimersByTime(1500);

      // Should NOT auto-close the sidebar since items remain
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close sidebar when Escape key is pressed', () => {
      const store = createMockStore();
      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close sidebar when other keys are pressed', () => {
      const store = createMockStore();
      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should only respond to Escape when sidebar is open', () => {
      const store = createMockStore();
      renderWithProviders(
        <CartSidebar isOpen={false} onClose={mockOnClose} />,
        store
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Management', () => {
    it('should prevent body scroll when sidebar is open', () => {
      const store = createMockStore();
      
      // Mock document.body.style
      const originalOverflow = document.body.style.overflow;
      
      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      expect(document.body.style.overflow).toBe('hidden');

      // Cleanup
      document.body.style.overflow = originalOverflow;
    });

    it('should restore body scroll when sidebar is closed', () => {
      const store = createMockStore();
      
      const { rerender } = renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      expect(document.body.style.overflow).toBe('hidden');

      // Close sidebar
      rerender(
        <Provider store={store}>
          <BrowserRouter>
            <CartSidebar isOpen={false} onClose={mockOnClose} />
          </BrowserRouter>
        </Provider>
      );

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when cart update fails', async () => {
      const mockCartItems = [
        {
          productId: '1',
          title: 'Test Product',
          brand: 'Test Brand',
          price: 29.99,
          salePrice: 0,
          quantity: 1,
          totalStock: 10,
          image: 'test-image.jpg'
        }
      ];

      const store = createMockStore({
        shopCart: {
          cartItems: { items: mockCartItems },
          isLoading: false,
          error: null
        }
      });

      // Mock the dispatch to return failure
      const mockDispatch = jest.fn().mockRejectedValue(new Error('Update failed'));
      store.dispatch = mockDispatch;

      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      // Find and click quantity increase button
      const increaseButton = screen.getByRole('button', { name: '' }); // Plus icon
      fireEvent.click(increaseButton);

      // Wait for the async operation to fail
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Update failed",
          description: "Failed to update item quantity",
          variant: "destructive"
        });
      });
    });

    it('should show error toast when item removal fails', async () => {
      const mockCartItems = [
        {
          productId: '1',
          title: 'Test Product',
          brand: 'Test Brand',
          price: 29.99,
          salePrice: 0,
          quantity: 1,
          totalStock: 10,
          image: 'test-image.jpg'
        }
      ];

      const store = createMockStore({
        shopCart: {
          cartItems: { items: mockCartItems },
          isLoading: false,
          error: null
        }
      });

      // Mock the dispatch to return failure
      const mockDispatch = jest.fn().mockRejectedValue(new Error('Remove failed'));
      store.dispatch = mockDispatch;

      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      // Find and click remove button
      const removeButton = screen.getByRole('button', { name: '' }); // Trash icon
      fireEvent.click(removeButton);

      // Wait for the async operation to fail
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Remove failed",
          description: "Failed to remove item from cart",
          variant: "destructive"
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should disable buttons during loading', async () => {
      const mockCartItems = [
        {
          productId: '1',
          title: 'Test Product',
          brand: 'Test Brand',
          price: 29.99,
          salePrice: 0,
          quantity: 1,
          totalStock: 10,
          image: 'test-image.jpg'
        }
      ];

      const store = createMockStore({
        shopCart: {
          cartItems: { items: mockCartItems },
          isLoading: false,
          error: null
        }
      });

      // Mock the dispatch to return a pending promise
      const mockDispatch = jest.fn().mockImplementation(() => new Promise(() => {}));
      store.dispatch = mockDispatch;

      renderWithProviders(
        <CartSidebar isOpen={true} onClose={mockOnClose} />,
        store
      );

      // Find and click quantity increase button
      const increaseButton = screen.getByRole('button', { name: '' }); // Plus icon
      fireEvent.click(increaseButton);

      // Buttons should be disabled during loading
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const quantityButtons = buttons.filter(btn => 
          btn.querySelector('svg')?.classList.contains('lucide-plus') ||
          btn.querySelector('svg')?.classList.contains('lucide-minus') ||
          btn.querySelector('svg')?.classList.contains('lucide-trash-2')
        );
        
        quantityButtons.forEach(button => {
          expect(button).toBeDisabled();
        });
      });
    });
  });
});