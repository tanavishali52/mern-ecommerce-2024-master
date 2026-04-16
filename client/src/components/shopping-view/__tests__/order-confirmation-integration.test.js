import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ShoppingAccount from '../../../pages/shopping-view/account';
import OrderConfirmationModal from '../order-confirmation-modal';
import OrderSuccessBanner from '../order-success-banner';

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { isAuthenticated: false, user: null, isLoading: false }, action) => state,
      shopOrder: (state = { orderList: [], orderDetails: null }, action) => state,
      ...initialState
    }
  });
};

// Mock components and hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
  };
});

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const renderWithProviders = (component, { store = createMockStore(), ...options } = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>,
    options
  );
};

describe('Order Confirmation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Guest Order Flow', () => {
    it('should display order confirmation modal and redirect to account page for guest users', async () => {
      const mockOrderData = {
        orderId: '507f1f77bcf86cd799439011',
        totalAmount: 99.99,
        customerName: 'John Doe',
        paymentMethod: 'cod',
        isGuest: true,
        orderDate: new Date().toISOString()
      };

      const mockOnClose = vi.fn();
      const mockNavigate = vi.fn();

      // Mock useNavigate
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      renderWithProviders(
        <OrderConfirmationModal
          isOpen={true}
          orderData={mockOrderData}
          onClose={mockOnClose}
        />
      );

      // Check if order confirmation modal displays correctly
      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('#439011')).toBeInTheDocument(); // Order number
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Wait for countdown and check redirect
      await waitFor(() => {
        expect(screen.getByText(/Redirecting to your account page in/)).toBeInTheDocument();
      });

      // Click "View Order Details" button
      const viewOrderButton = screen.getByText('View Order Details');
      fireEvent.click(viewOrderButton);

      // Verify navigation was called with correct parameters
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/shop/account?orderConfirmed=true&orderId=507f1f77bcf86cd799439011')
        );
      });
    });

    it('should handle guest order lookup with pre-populated name', async () => {
      const mockStore = createMockStore({
        auth: (state = { isAuthenticated: false, user: null, isLoading: false }, action) => state
      });

      // Mock URL search params with guest customer name
      const mockSearchParams = new URLSearchParams({
        customerName: 'Jane Smith',
        tab: 'guest-lookup'
      });

      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useSearchParams: () => [mockSearchParams, vi.fn()]
        };
      });

      renderWithProviders(<ShoppingAccount />, { store: mockStore });

      // Check if guest lookup tab is active
      await waitFor(() => {
        expect(screen.getByText('Find Orders')).toBeInTheDocument();
      });

      // Check if customer name is pre-populated (would need to check input value)
      const nameInput = screen.getByPlaceholderText(/Enter your full name/);
      expect(nameInput).toBeInTheDocument();
    });
  });

  describe('Registered User Flow', () => {
    it('should display order confirmation and highlight new order for registered users', async () => {
      const mockStore = createMockStore({
        auth: (state = { 
          isAuthenticated: true, 
          user: { id: '1', userName: 'testuser' }, 
          isLoading: false 
        }, action) => state,
        shopOrder: (state = { 
          orderList: [
            {
              _id: '507f1f77bcf86cd799439011',
              orderDate: new Date().toISOString(),
              orderStatus: 'confirmed',
              totalAmount: 99.99
            }
          ], 
          orderDetails: null 
        }, action) => state
      });

      // Mock URL search params with order confirmation
      const mockSearchParams = new URLSearchParams({
        orderConfirmed: 'true',
        orderId: '507f1f77bcf86cd799439011',
        highlight: '507f1f77bcf86cd799439011',
        tab: 'orders'
      });

      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useSearchParams: () => [mockSearchParams, vi.fn()]
        };
      });

      renderWithProviders(<ShoppingAccount />, { store: mockStore });

      // Check if success banner is displayed
      await waitFor(() => {
        expect(screen.getByText('Order Successfully Placed!')).toBeInTheDocument();
      });

      // Check if orders tab is active
      expect(screen.getByText('Order History')).toBeInTheDocument();

      // Check if order is highlighted (would have special styling)
      expect(screen.getByText('New Order')).toBeInTheDocument();
    });

    it('should display user profile information correctly', async () => {
      const mockStore = createMockStore({
        auth: (state = { 
          isAuthenticated: true, 
          user: { id: '1', userName: 'testuser' }, 
          isLoading: false 
        }, action) => state
      });

      renderWithProviders(<ShoppingAccount />, { store: mockStore });

      // Check if user is welcomed by name
      await waitFor(() => {
        expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
      });

      // Check if profile tab is available
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  describe('Success Banner Component', () => {
    it('should display success banner with correct order information', () => {
      const mockOrderData = {
        orderId: '507f1f77bcf86cd799439011',
        totalAmount: 149.99,
        customerName: 'Alice Johnson',
        paymentMethod: 'cod',
        isGuest: false
      };

      const mockOnDismiss = vi.fn();

      renderWithProviders(
        <OrderSuccessBanner
          orderData={mockOrderData}
          isVisible={true}
          onDismiss={mockOnDismiss}
          autoHideDelay={5000}
        />
      );

      // Check banner content
      expect(screen.getByText('Order Successfully Placed!')).toBeInTheDocument();
      expect(screen.getByText('#439011')).toBeInTheDocument();
      expect(screen.getByText('$149.99')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

      // Check auto-hide countdown
      expect(screen.getByText(/This message will auto-hide in/)).toBeInTheDocument();
    });

    it('should handle manual dismissal of success banner', () => {
      const mockOrderData = {
        orderId: '507f1f77bcf86cd799439011',
        totalAmount: 75.50,
        customerName: 'Bob Wilson',
        isGuest: true
      };

      const mockOnDismiss = vi.fn();

      renderWithProviders(
        <OrderSuccessBanner
          orderData={mockOrderData}
          isVisible={true}
          onDismiss={mockOnDismiss}
        />
      );

      // Find and click dismiss button
      const dismissButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(dismissButton);

      // Verify onDismiss was called
      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should show different message for guest vs registered users', () => {
      const guestOrderData = {
        orderId: '507f1f77bcf86cd799439011',
        totalAmount: 50.00,
        customerName: 'Guest User',
        isGuest: true
      };

      const { rerender } = renderWithProviders(
        <OrderSuccessBanner
          orderData={guestOrderData}
          isVisible={true}
          onDismiss={vi.fn()}
        />
      );

      // Check guest message
      expect(screen.getByText(/guest order has been confirmed/)).toBeInTheDocument();

      // Test registered user message
      const registeredOrderData = { ...guestOrderData, isGuest: false };
      
      rerender(
        <Provider store={createMockStore()}>
          <BrowserRouter>
            <OrderSuccessBanner
              orderData={registeredOrderData}
              isVisible={true}
              onDismiss={vi.fn()}
            />
          </BrowserRouter>
        </Provider>
      );

      expect(screen.getByText(/Your order has been confirmed/)).toBeInTheDocument();
    });
  });

  describe('URL Parameter Handling', () => {
    it('should properly parse and handle order confirmation URL parameters', async () => {
      const mockStore = createMockStore({
        auth: (state = { isAuthenticated: false, user: null, isLoading: false }, action) => state
      });

      const mockSearchParams = new URLSearchParams({
        orderConfirmed: 'true',
        orderId: '507f1f77bcf86cd799439011',
        totalAmount: '199.99',
        customerName: 'Test Customer',
        paymentMethod: 'cod'
      });

      const mockSetSearchParams = vi.fn();

      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useSearchParams: () => [mockSearchParams, mockSetSearchParams]
        };
      });

      renderWithProviders(<ShoppingAccount />, { store: mockStore });

      // Verify success banner appears with correct data
      await waitFor(() => {
        expect(screen.getByText('Order Successfully Placed!')).toBeInTheDocument();
        expect(screen.getByText('Test Customer')).toBeInTheDocument();
      });

      // Verify URL parameters are cleaned up
      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalledWith({});
      }, { timeout: 2000 });
    });

    it('should handle malformed URL parameters gracefully', async () => {
      const mockStore = createMockStore({
        auth: (state = { isAuthenticated: false, user: null, isLoading: false }, action) => state
      });

      // Malformed parameters
      const mockSearchParams = new URLSearchParams({
        orderConfirmed: 'invalid',
        orderId: '',
        totalAmount: 'not-a-number'
      });

      const mockSetSearchParams = vi.fn();

      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useSearchParams: () => [mockSearchParams, mockSetSearchParams]
        };
      });

      renderWithProviders(<ShoppingAccount />, { store: mockStore });

      // Should not crash and should show default guest view
      await waitFor(() => {
        expect(screen.getByText('Find Orders')).toBeInTheDocument();
      });

      // Should clean up parameters
      expect(mockSetSearchParams).toHaveBeenCalledWith({});
    });
  });

  describe('Navigation Features', () => {
    it('should provide continue shopping functionality', async () => {
      const mockStore = createMockStore({
        auth: (state = { isAuthenticated: true, user: { userName: 'testuser' }, isLoading: false }, action) => state
      });

      const mockNavigate = vi.fn();

      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      renderWithProviders(<ShoppingAccount />, { store: mockStore });

      // Find and click continue shopping button
      const continueButton = screen.getByText('Continue Shopping');
      fireEvent.click(continueButton);

      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('/shop/home');
    });
  });
});