import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnhancedOrderDetails from '../enhanced-order-details';

// Mock fetch
global.fetch = jest.fn();

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  orderDate: '2023-12-01T00:00:00.000Z',
  totalAmount: 99.99,
  orderStatus: 'confirmed',
  paymentMethod: 'cod',
  paymentStatus: 'pending',
  cartItems: [
    {
      title: 'Test Product',
      quantity: 2,
      price: '49.99',
      images: [{ url: 'https://example.com/image.jpg' }]
    }
  ],
  guestCustomer: {
    fullName: 'John Doe',
    phoneNumber: '+1234567890',
    shippingAddress: '123 Main St',
    city: 'New York'
  }
};

const mockTimeline = [
  {
    status: 'confirmed',
    timestamp: '2023-12-01T00:00:00.000Z',
    note: 'Order confirmed'
  },
  {
    status: 'processing',
    timestamp: '2023-12-01T12:00:00.000Z',
    note: 'Order is being processed'
  }
];

describe('EnhancedOrderDetails Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders order details for guest order', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { timeline: mockTimeline }
      }),
    });

    render(<EnhancedOrderDetails order={mockOrder} isGuest={true} />);
    
    expect(screen.getByText('Order #439011')).toBeInTheDocument();
    expect(screen.getByText('Guest Order')).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  test('fetches and displays order timeline', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { timeline: mockTimeline }
      }),
    });

    render(<EnhancedOrderDetails order={mockOrder} />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/shop/order/507f1f77bcf86cd799439011/timeline', {
        credentials: 'include'
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Order confirmed')).toBeInTheDocument();
      expect(screen.getByText('Order is being processed')).toBeInTheDocument();
    });
  });

  test('handles contact support', async () => {
    const { toast } = require('react-toastify');
    
    // Mock timeline fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { timeline: mockTimeline }
      }),
    });

    // Mock support contact generation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          whatsappUrl: 'https://wa.me/1234567890?text=Hello',
          merchantWhatsApp: '+1234567890'
        }
      }),
    });

    // Mock window.open
    const mockOpen = jest.fn();
    global.window.open = mockOpen;

    render(<EnhancedOrderDetails order={mockOrder} />);
    
    await waitFor(() => {
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    const supportButton = screen.getByText('Contact Support');
    fireEvent.click(supportButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/shop/order/507f1f77bcf86cd799439011/contact-support', {
        method: 'POST',
        credentials: 'include'
      });
    });

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith('https://wa.me/1234567890?text=Hello', '_blank');
      expect(toast.success).toHaveBeenCalledWith('Opening WhatsApp with your order details');
    });
  });

  test('displays payment information correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { timeline: [] }
      }),
    });

    render(<EnhancedOrderDetails order={mockOrder} />);
    
    await waitFor(() => {
      expect(screen.getByText('Cash on Delivery')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('$99.98')).toBeInTheDocument(); // Subtotal
      expect(screen.getByText('Free')).toBeInTheDocument(); // Shipping
    });
  });

  test('handles missing order data gracefully', () => {
    render(<EnhancedOrderDetails order={null} />);
    
    expect(screen.getByText('No order details available')).toBeInTheDocument();
  });

  test('displays loading state for timeline', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    
    render(<EnhancedOrderDetails order={mockOrder} />);
    
    // Should show loading animation
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('handles timeline fetch error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<EnhancedOrderDetails order={mockOrder} />);
    
    await waitFor(() => {
      expect(screen.getByText('No timeline data available')).toBeInTheDocument();
    });
  });

  test('displays correct status colors', async () => {
    const confirmedOrder = { ...mockOrder, orderStatus: 'confirmed' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { timeline: [] }
      }),
    });

    render(<EnhancedOrderDetails order={confirmedOrder} />);
    
    await waitFor(() => {
      const statusBadge = screen.getByText('confirmed');
      expect(statusBadge.closest('.bg-green-500')).toBeInTheDocument();
    });
  });
});