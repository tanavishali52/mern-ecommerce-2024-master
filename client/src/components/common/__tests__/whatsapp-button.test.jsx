import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WhatsAppButton from '../whatsapp-button';
import settingsReducer from '@/store/admin/settings-slice';
import * as whatsappService from '@/services/whatsapp-service';

// Mock the WhatsApp service
jest.mock('@/services/whatsapp-service', () => ({
  validateWhatsAppConfig: jest.fn(),
  openWhatsApp: jest.fn()
}));

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      adminSettings: settingsReducer
    },
    preloadedState: {
      adminSettings: {
        whatsapp: {
          number: '',
          message: "Hello! I'm interested in your products.",
          enabled: false
        },
        isLoading: false,
        error: null,
        ...initialState
      }
    }
  });
};

const renderWithProvider = (component, { store = createMockStore() } = {}) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('WhatsAppButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  test('should not render when WhatsApp is not configured', () => {
    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: false });

    renderWithProvider(<WhatsAppButton />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('should render when WhatsApp is properly configured', () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });

    renderWithProvider(<WhatsAppButton />, { store });

    expect(screen.getByRole('button', { name: /contact us on whatsapp/i })).toBeInTheDocument();
  });

  test('should not render when there is a loading error', () => {
    const store = createMockStore({
      error: { message: 'Failed to load settings' }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });

    renderWithProvider(<WhatsAppButton />, { store });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('should call openWhatsApp when button is clicked', () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });
    whatsappService.openWhatsApp.mockReturnValue(true);

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    fireEvent.click(button);

    expect(whatsappService.openWhatsApp).toHaveBeenCalledWith('+1234567890', 'Hello World');
  });

  test('should handle click when no phone number is configured', () => {
    const store = createMockStore({
      whatsapp: {
        number: '',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    fireEvent.click(button);

    expect(mockConsoleError).toHaveBeenCalledWith('WhatsApp number not configured');
    expect(whatsappService.openWhatsApp).not.toHaveBeenCalled();
  });

  test('should handle WhatsApp opening failure', async () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });
    whatsappService.openWhatsApp.mockReturnValue(false);

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to open WhatsApp. Please try again.');
    });

    // Should show error tooltip
    expect(screen.getByText('Failed to open WhatsApp. Please try again.')).toBeInTheDocument();
  });

  test('should handle unexpected errors during click', async () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });
    whatsappService.openWhatsApp.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'An error occurred while opening WhatsApp',
        expect.any(Error)
      );
    });

    // Should show error tooltip
    expect(screen.getByText('An error occurred while opening WhatsApp')).toBeInTheDocument();
  });

  test('should show tooltip on hover', async () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    
    fireEvent.mouseEnter(button);

    // Wait for tooltip to appear (500ms delay)
    await waitFor(() => {
      expect(screen.getByText('Need help? Chat with us!')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('should hide tooltip on mouse leave', async () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    
    fireEvent.mouseEnter(button);
    
    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByText('Need help? Chat with us!')).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.mouseLeave(button);

    // Tooltip should disappear
    await waitFor(() => {
      expect(screen.queryByText('Need help? Chat with us!')).not.toBeInTheDocument();
    });
  });

  test('should not show tooltip when there is an error', async () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });
    whatsappService.openWhatsApp.mockReturnValue(false);

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    
    // First click to trigger error
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to open WhatsApp. Please try again.')).toBeInTheDocument();
    });

    // Now try to hover - tooltip should not appear
    fireEvent.mouseEnter(button);

    // Wait and ensure success tooltip doesn't appear
    await new Promise(resolve => setTimeout(resolve, 600));
    expect(screen.queryByText('Need help? Chat with us!')).not.toBeInTheDocument();
  });

  test('should clear error after timeout', async () => {
    jest.useFakeTimers();

    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });
    whatsappService.openWhatsApp.mockReturnValue(false);

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    fireEvent.click(button);

    // Error should be visible
    await waitFor(() => {
      expect(screen.getByText('Failed to open WhatsApp. Please try again.')).toBeInTheDocument();
    });

    // Fast forward 3 seconds
    jest.advanceTimersByTime(3000);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Failed to open WhatsApp. Please try again.')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('should have proper accessibility attributes', () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    expect(button).toHaveAttribute('aria-label', 'Contact us on WhatsApp');
  });

  test('should disable button when there is an error', async () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });
    whatsappService.openWhatsApp.mockReturnValue(false);

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  test('should show pulse animation when no error', () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });

    renderWithProvider(<WhatsAppButton />, { store });

    // Check for pulse animation element
    const pulseElement = document.querySelector('.animate-ping');
    expect(pulseElement).toBeInTheDocument();
  });

  test('should hide pulse animation when there is an error', async () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Hello World',
        enabled: true
      }
    });

    whatsappService.validateWhatsAppConfig.mockReturnValue({ isValid: true });
    whatsappService.openWhatsApp.mockReturnValue(false);

    renderWithProvider(<WhatsAppButton />, { store });

    const button = screen.getByRole('button', { name: /contact us on whatsapp/i });
    fireEvent.click(button);

    await waitFor(() => {
      const pulseElement = document.querySelector('.animate-ping');
      expect(pulseElement).not.toBeInTheDocument();
    });
  });
});