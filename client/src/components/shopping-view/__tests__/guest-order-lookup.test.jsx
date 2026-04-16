import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GuestOrderLookup from '../guest-order-lookup';

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

const mockOrders = [
  {
    _id: '507f1f77bcf86cd799439011',
    orderDate: '2023-12-01T00:00:00.000Z',
    totalAmount: 99.99,
    orderStatus: 'confirmed',
    cartItems: [
      { title: 'Test Product', quantity: 1 }
    ],
    guestCustomer: {
      fullName: 'John Doe',
      phoneNumber: '+1234567890'
    }
  }
];

describe('GuestOrderLookup Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders search form', () => {
    render(<GuestOrderLookup />);
    
    expect(screen.getByText('Find Your Orders')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name (e.g., John Doe)')).toBeInTheDocument();
    expect(screen.getByText('Search Orders')).toBeInTheDocument();
  });

  test('shows error when searching with empty name', async () => {
    const { toast } = require('react-toastify');
    
    render(<GuestOrderLookup />);
    
    const searchButton = screen.getByText('Search Orders');
    fireEvent.click(searchButton);
    
    expect(toast.error).toHaveBeenCalledWith('Please enter your name to search for orders');
  });

  test('searches for orders successfully', async () => {
    const { toast } = require('react-toastify');
    const mockOnOrdersFound = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockOrders,
        message: 'Found 1 order(s)'
      }),
    });

    render(<GuestOrderLookup onOrdersFound={mockOnOrdersFound} />);
    
    const nameInput = screen.getByPlaceholderText('Enter your full name (e.g., John Doe)');
    const searchButton = screen.getByText('Search Orders');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/shop/order/guest/John%20Doe', {
        credentials: 'include'
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('Found 1 order for "John Doe"')).toBeInTheDocument();
      expect(mockOnOrdersFound).toHaveBeenCalledWith(mockOrders);
      expect(toast.success).toHaveBeenCalledWith('Found 1 order(s)');
    });
  });

  test('handles no orders found', async () => {
    const { toast } = require('react-toastify');
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        message: 'No orders found for this name'
      }),
    });

    render(<GuestOrderLookup />);
    
    const nameInput = screen.getByPlaceholderText('Enter your full name (e.g., John Doe)');
    const searchButton = screen.getByText('Search Orders');
    
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('No Orders Found')).toBeInTheDocument();
      expect(screen.getByText('We couldn\'t find any orders for "Jane Smith".')).toBeInTheDocument();
      expect(toast.info).toHaveBeenCalledWith('No orders found for this name');
    });
  });

  test('handles search error', async () => {
    const { toast } = require('react-toastify');
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<GuestOrderLookup />);
    
    const nameInput = screen.getByPlaceholderText('Enter your full name (e.g., John Doe)');
    const searchButton = screen.getByText('Search Orders');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error searching for orders. Please try again.');
    });
  });

  test('allows search on Enter key press', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockOrders,
        message: 'Found 1 order(s)'
      }),
    });

    render(<GuestOrderLookup />);
    
    const nameInput = screen.getByPlaceholderText('Enter your full name (e.g., John Doe)');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.keyPress(nameInput, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/shop/order/guest/John%20Doe', {
        credentials: 'include'
      });
    });
  });

  test('clears search results', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockOrders,
        message: 'Found 1 order(s)'
      }),
    });

    render(<GuestOrderLookup />);
    
    const nameInput = screen.getByPlaceholderText('Enter your full name (e.g., John Doe)');
    const searchButton = screen.getByText('Search Orders');
    
    // Perform search
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
    });

    // Clear search
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(nameInput.value).toBe('');
    expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
  });
});