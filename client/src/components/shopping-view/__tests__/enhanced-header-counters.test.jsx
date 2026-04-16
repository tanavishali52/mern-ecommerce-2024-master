import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import EnhancedHeader from '../enhanced-header';
import authReducer from '@/store/auth-slice';
import cartReducer from '@/store/shop/cart-slice';
import wishlistReducer from '@/store/shop/wishlist-slice';

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
      shopCart: cartReducer,
      shopWishlist: wishlistReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { id: 'user1', userName: 'Test User', email: 'test@example.com' }
      },
      shopCart: {
        cartItems: { items: [] },
        isLoading: false,
        error: null
      },
      shopWishlist: {
        wishlistItems: { items: [] },
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

describe('EnhancedHeader Counter Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('should display animated cart counter with correct count', () => {
    const mockCartItems = [
      { productId: '1', quantity: 2, title: 'Product 1', price: 29.99 },
      { productId: '2', quantity: 1, title: 'Product 2', price: 39.99 }
    ];

    const store = createMockStore({
      shopCart: {
        cartItems: { items: mockCartItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    // Should show total quantity (2 + 1 = 3)
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Should have orange color for cart counter
    const cartBadge = screen.getByText('3');
    expect(cartBadge).toHaveClass('bg-orange-600');
  });

  it('should display animated wishlist counter with correct count', () => {
    const mockWishlistItems = [
      { productId: '1', title: 'Wishlist Product 1', price: 29.99 },
      { productId: '2', title: 'Wishlist Product 2', price: 39.99 },
      { productId: '3', title: 'Wishlist Product 3', price: 49.99 }
    ];

    const store = createMockStore({
      shopWishlist: {
        wishlistItems: { items: mockWishlistItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    // Should show wishlist count (3 items)
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Should have red color for wishlist counter
    const wishlistBadge = screen.getByText('3');
    expect(wishlistBadge).toHaveClass('bg-red-500');
  });

  it('should not display counters when counts are zero', () => {
    const store = createMockStore({
      shopCart: {
        cartItems: { items: [] },
        isLoading: false,
        error: null
      },
      shopWishlist: {
        wishlistItems: { items: [] },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    // Should not display any counter badges
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should display 99+ when cart count exceeds 99', () => {
    const mockCartItems = Array.from({ length: 50 }, (_, i) => ({
      productId: `${i + 1}`,
      quantity: 3, // 50 * 3 = 150 total items
      title: `Product ${i + 1}`,
      price: 29.99
    }));

    const store = createMockStore({
      shopCart: {
        cartItems: { items: mockCartItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should display 99+ when wishlist count exceeds 99', () => {
    const mockWishlistItems = Array.from({ length: 105 }, (_, i) => ({
      productId: `${i + 1}`,
      title: `Wishlist Product ${i + 1}`,
      price: 29.99
    }));

    const store = createMockStore({
      shopWishlist: {
        wishlistItems: { items: mockWishlistItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should handle cart icon click with authentication check', () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: false,
        user: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    const cartButton = screen.getByRole('button', { name: /cart/i });
    fireEvent.click(cartButton);

    // Should not navigate when not authenticated
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle wishlist icon click with authentication check', () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: false,
        user: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
    fireEvent.click(wishlistButton);

    // Should not navigate when not authenticated
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should open wishlist sidebar when authenticated user clicks wishlist', async () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: true,
        user: { id: 'user1', userName: 'Test User' }
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    const wishlistButton = screen.getByRole('button', { name: /wishlist/i });
    fireEvent.click(wishlistButton);

    // Should open wishlist sidebar
    await waitFor(() => {
      expect(screen.getByText('Wishlist')).toBeInTheDocument();
    });
  });

  it('should update counters when Redux state changes', async () => {
    const store = createMockStore();

    const { rerender } = renderWithProviders(<EnhancedHeader />, store);

    // Initially no counters
    expect(screen.queryByText('1')).not.toBeInTheDocument();

    // Update store with new cart items
    const updatedStore = createMockStore({
      shopCart: {
        cartItems: { 
          items: [{ productId: '1', quantity: 1, title: 'Product 1', price: 29.99 }] 
        },
        isLoading: false,
        error: null
      }
    });

    rerender(
      <Provider store={updatedStore}>
        <BrowserRouter>
          <EnhancedHeader />
        </BrowserRouter>
      </Provider>
    );

    // Should now show cart counter
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('should position counters correctly on action icons', () => {
    const store = createMockStore({
      shopCart: {
        cartItems: { 
          items: [{ productId: '1', quantity: 2, title: 'Product 1', price: 29.99 }] 
        },
        isLoading: false,
        error: null
      },
      shopWishlist: {
        wishlistItems: { 
          items: [{ productId: '1', title: 'Wishlist Product 1', price: 29.99 }] 
        },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    // Both counters should be positioned at top-right
    const cartBadge = screen.getByText('2');
    const wishlistBadge = screen.getByText('1');

    expect(cartBadge).toHaveClass('absolute -top-2 -right-2');
    expect(wishlistBadge).toHaveClass('absolute -top-2 -right-2');
  });
});

describe('Mobile Responsive Counter Tests', () => {
  beforeEach(() => {
    // Mock mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('should display counters correctly on mobile', () => {
    const store = createMockStore({
      shopCart: {
        cartItems: { 
          items: [{ productId: '1', quantity: 3, title: 'Product 1', price: 29.99 }] 
        },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    // Counter should still be visible on mobile
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should maintain counter functionality in mobile menu', () => {
    const store = createMockStore({
      shopCart: {
        cartItems: { 
          items: [{ productId: '1', quantity: 1, title: 'Product 1', price: 29.99 }] 
        },
        isLoading: false,
        error: null
      },
      shopWishlist: {
        wishlistItems: { 
          items: [{ productId: '1', title: 'Wishlist Product 1', price: 29.99 }] 
        },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(<EnhancedHeader />, store);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Should show counters in mobile menu
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});