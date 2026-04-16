import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import WishlistSidebar from '../wishlist-sidebar';
import wishlistReducer from '@/store/shop/wishlist-slice';
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
      shopWishlist: wishlistReducer,
      shopCart: cartReducer
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { id: 'user1', userName: 'Test User' }
      },
      shopWishlist: {
        wishlistItems: { items: [] },
        isLoading: false,
        error: null
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

describe('WishlistSidebar', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const store = createMockStore();
    const { container } = renderWithProviders(
      <WishlistSidebar isOpen={false} onClose={mockOnClose} />,
      store
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render empty wishlist state', () => {
    const store = createMockStore();
    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    expect(screen.getByText('Save items you love to shop them later')).toBeInTheDocument();
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
  });

  it('should render wishlist items', () => {
    const mockWishlistItems = [
      {
        productId: '1',
        title: 'Test Product 1',
        brand: 'Test Brand',
        price: 29.99,
        salePrice: 24.99,
        image: 'test-image.jpg',
        inStock: true
      },
      {
        productId: '2',
        title: 'Test Product 2',
        brand: 'Test Brand 2',
        price: 39.99,
        salePrice: 0,
        image: 'test-image-2.jpg',
        inStock: false
      }
    ];

    const store = createMockStore({
      shopWishlist: {
        wishlistItems: { items: mockWishlistItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('$24.99')).toBeInTheDocument();
    expect(screen.getByText('$39.99')).toBeInTheDocument();
  });

  it('should show out of stock status', () => {
    const mockWishlistItems = [
      {
        productId: '1',
        title: 'Out of Stock Product',
        brand: 'Test Brand',
        price: 29.99,
        salePrice: 0,
        image: 'test-image.jpg',
        inStock: false
      }
    ];

    const store = createMockStore({
      shopWishlist: {
        wishlistItems: { items: mockWishlistItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('should close sidebar when close button is clicked', () => {
    const store = createMockStore();
    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    const closeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close sidebar when overlay is clicked', () => {
    const store = createMockStore();
    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    const overlay = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate to product page when product is clicked', () => {
    const mockWishlistItems = [
      {
        productId: '123',
        title: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        salePrice: 0,
        image: 'test-image.jpg',
        inStock: true
      }
    ];

    const store = createMockStore({
      shopWishlist: {
        wishlistItems: { items: mockWishlistItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    const productTitle = screen.getByText('Test Product');
    fireEvent.click(productTitle);

    expect(mockNavigate).toHaveBeenCalledWith('/shop/product/123');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate to full wishlist when view full wishlist is clicked', () => {
    const mockWishlistItems = [
      {
        productId: '1',
        title: 'Test Product',
        brand: 'Test Brand',
        price: 29.99,
        salePrice: 0,
        image: 'test-image.jpg',
        inStock: true
      }
    ];

    const store = createMockStore({
      shopWishlist: {
        wishlistItems: { items: mockWishlistItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    const viewWishlistButton = screen.getByText('View Full Wishlist');
    fireEvent.click(viewWishlistButton);

    expect(mockNavigate).toHaveBeenCalledWith('/shop/wishlist');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate to listing when continue shopping is clicked', () => {
    const store = createMockStore();
    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    const continueShoppingButton = screen.getByText('Continue Shopping');
    fireEvent.click(continueShoppingButton);

    expect(mockNavigate).toHaveBeenCalledWith('/shop/listing');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle escape key to close sidebar', () => {
    const store = createMockStore();
    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show correct item count in header', () => {
    const mockWishlistItems = [
      { productId: '1', title: 'Product 1', brand: 'Brand 1', price: 29.99, inStock: true },
      { productId: '2', title: 'Product 2', brand: 'Brand 2', price: 39.99, inStock: true },
      { productId: '3', title: 'Product 3', brand: 'Brand 3', price: 49.99, inStock: true }
    ];

    const store = createMockStore({
      shopWishlist: {
        wishlistItems: { items: mockWishlistItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('should show singular item text for one item', () => {
    const mockWishlistItems = [
      { productId: '1', title: 'Product 1', brand: 'Brand 1', price: 29.99, inStock: true }
    ];

    const store = createMockStore({
      shopWishlist: {
        wishlistItems: { items: mockWishlistItems },
        isLoading: false,
        error: null
      }
    });

    renderWithProviders(
      <WishlistSidebar isOpen={true} onClose={mockOnClose} />,
      store
    );

    expect(screen.getByText('1 item')).toBeInTheDocument();
  });
});