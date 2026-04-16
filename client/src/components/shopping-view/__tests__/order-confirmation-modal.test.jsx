import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderConfirmationModal from '../order-confirmation-modal';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockOrderData = {
  orderId: '507f1f77bcf86cd799439011',
  totalAmount: 99.99,
  customerName: 'John Doe',
  paymentMethod: 'cod',
  isGuest: true
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('OrderConfirmationModal Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders order confirmation details', () => {
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={mockOrderData} 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('#439011')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Cash on Delivery')).toBeInTheDocument();
  });

  test('shows countdown timer', () => {
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={mockOrderData} 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText(/Redirecting to your account page in 5 seconds/)).toBeInTheDocument();
  });

  test('countdown decreases over time', async () => {
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={mockOrderData} 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText(/5 seconds/)).toBeInTheDocument();
    
    // Fast-forward 1 second
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/4 seconds/)).toBeInTheDocument();
    });
  });

  test('redirects after countdown reaches zero', async () => {
    const mockOnClose = jest.fn();
    
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={mockOrderData} 
        onClose={mockOnClose} 
      />
    );
    
    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/shop/account');
    });
  });

  test('stops countdown when "Stay on this page" is clicked', async () => {
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={mockOrderData} 
        onClose={jest.fn()} 
      />
    );
    
    const stayButton = screen.getByText('Stay on this page');
    fireEvent.click(stayButton);
    
    // Fast-forward time - should not redirect
    jest.advanceTimersByTime(10000);
    
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('redirects immediately when "View Order Details" is clicked', async () => {
    const mockOnClose = jest.fn();
    
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={mockOrderData} 
        onClose={mockOnClose} 
      />
    );
    
    const viewButton = screen.getByText('View Order Details');
    fireEvent.click(viewButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/shop/account');
    });
  });

  test('displays guest customer information', () => {
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={mockOrderData} 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText(/As a guest customer, use your name "John Doe"/)).toBeInTheDocument();
  });

  test('shows different delivery time for different payment methods', () => {
    const paypalOrderData = { ...mockOrderData, paymentMethod: 'paypal' };
    
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={paypalOrderData} 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText('3-5 business days')).toBeInTheDocument();
  });

  test('handles missing order data gracefully', () => {
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={null} 
        onClose={jest.fn()} 
      />
    );
    
    // Should not render anything when orderData is null
    expect(screen.queryByText('Order Confirmed!')).not.toBeInTheDocument();
  });

  test('does not start countdown when modal is closed', () => {
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={false} 
        orderData={mockOrderData} 
        onClose={jest.fn()} 
      />
    );
    
    // Fast-forward time
    jest.advanceTimersByTime(10000);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('displays estimated delivery date', () => {
    renderWithRouter(
      <OrderConfirmationModal 
        isOpen={true} 
        orderData={mockOrderData} 
        onClose={jest.fn()} 
      />
    );
    
    // Should show an estimated delivery date (7 days from now for COD)
    expect(screen.getByText(/Expected by:/)).toBeInTheDocument();
  });
});