import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import WhatsAppSettings from '../whatsapp-settings';
import settingsReducer from '@/store/admin/settings-slice';

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock the WhatsApp service
jest.mock('@/services/whatsapp-service', () => ({
  validatePhoneNumber: jest.fn((number) => /^\+[1-9]\d{1,14}$/.test(number)),
  validateMessage: jest.fn((message) => message && message.length >= 1 && message.length <= 500)
}));

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

const renderWithProviders = (component, { store = createMockStore() } = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('WhatsAppSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render WhatsApp settings form', () => {
    renderWithProviders(<WhatsAppSettings />);

    expect(screen.getByText('WhatsApp Settings')).toBeInTheDocument();
    expect(screen.getByText('Enable WhatsApp Support')).toBeInTheDocument();
    expect(screen.getByLabelText(/WhatsApp Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Default Message/i)).toBeInTheDocument();
  });

  test('should display current settings values', () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Custom message',
        enabled: true
      }
    });

    renderWithProviders(<WhatsAppSettings />, { store });

    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Custom message')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
  });

  test('should handle form field changes', async () => {
    renderWithProviders(<WhatsAppSettings />);

    const phoneInput = screen.getByLabelText(/WhatsApp Phone Number/i);
    const messageInput = screen.getByLabelText(/Default Message/i);
    const enableSwitch = screen.getByRole('switch');

    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    fireEvent.change(messageInput, { target: { value: 'New message' } });
    fireEvent.click(enableSwitch);

    expect(phoneInput.value).toBe('+1234567890');
    expect(messageInput.value).toBe('New message');
    expect(enableSwitch).toBeChecked();
  });

  test('should validate phone number format', async () => {
    renderWithProviders(<WhatsAppSettings />);

    const phoneInput = screen.getByLabelText(/WhatsApp Phone Number/i);
    const enableSwitch = screen.getByRole('switch');
    const saveButton = screen.getByText('Save Settings');

    // Enable WhatsApp and enter invalid phone number
    fireEvent.click(enableSwitch);
    fireEvent.change(phoneInput, { target: { value: 'invalid-number' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Phone number must be in E.164 format/i)).toBeInTheDocument();
    });
  });

  test('should validate message length', async () => {
    renderWithProviders(<WhatsAppSettings />);

    const messageInput = screen.getByLabelText(/Default Message/i);
    const saveButton = screen.getByText('Save Settings');

    // Enter message that's too long
    fireEvent.change(messageInput, { target: { value: 'A'.repeat(501) } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Message must be between 1 and 500 characters/i)).toBeInTheDocument();
    });
  });

  test('should require phone number when enabled', async () => {
    renderWithProviders(<WhatsAppSettings />);

    const enableSwitch = screen.getByRole('switch');
    const saveButton = screen.getByText('Save Settings');

    // Enable WhatsApp without phone number
    fireEvent.click(enableSwitch);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Phone number is required when WhatsApp is enabled/i)).toBeInTheDocument();
    });
  });

  test('should show character count for message', () => {
    renderWithProviders(<WhatsAppSettings />);

    const messageInput = screen.getByLabelText(/Default Message/i);
    
    fireEvent.change(messageInput, { target: { value: 'Hello World' } });

    expect(screen.getByText('(11/500 characters)')).toBeInTheDocument();
  });

  test('should show preview when configured', () => {
    renderWithProviders(<WhatsAppSettings />);

    const phoneInput = screen.getByLabelText(/WhatsApp Phone Number/i);
    const messageInput = screen.getByLabelText(/Default Message/i);
    const enableSwitch = screen.getByRole('switch');

    // Configure WhatsApp
    fireEvent.click(enableSwitch);
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    fireEvent.change(messageInput, { target: { value: 'Hello World' } });

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/web\.whatsapp\.com\/send/)).toBeInTheDocument();
  });

  test('should handle reset button', () => {
    const store = createMockStore({
      whatsapp: {
        number: '+1234567890',
        message: 'Custom message',
        enabled: true
      }
    });

    renderWithProviders(<WhatsAppSettings />, { store });

    const phoneInput = screen.getByLabelText(/WhatsApp Phone Number/i);
    const resetButton = screen.getByText('Reset');

    // Change the phone number
    fireEvent.change(phoneInput, { target: { value: '+9876543210' } });
    expect(phoneInput.value).toBe('+9876543210');

    // Reset should restore original value
    fireEvent.click(resetButton);
    expect(phoneInput.value).toBe('+1234567890');
  });

  test('should disable save button when no changes', () => {
    renderWithProviders(<WhatsAppSettings />);

    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).toBeDisabled();
  });

  test('should enable save button when changes are made', () => {
    renderWithProviders(<WhatsAppSettings />);

    const phoneInput = screen.getByLabelText(/WhatsApp Phone Number/i);
    const saveButton = screen.getByText('Save Settings');

    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    expect(saveButton).not.toBeDisabled();
  });

  test('should show loading state', () => {
    const store = createMockStore({
      isLoading: true
    });

    renderWithProviders(<WhatsAppSettings />, { store });

    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeDisabled();
  });

  test('should display error message', () => {
    const store = createMockStore({
      error: { message: 'Failed to load settings' }
    });

    renderWithProviders(<WhatsAppSettings />, { store });

    expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
  });

  test('should show help section', () => {
    renderWithProviders(<WhatsAppSettings />);

    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('Enable WhatsApp Support')).toBeInTheDocument();
    expect(screen.getByText('Add Your Phone Number')).toBeInTheDocument();
    expect(screen.getByText('Customize the Message')).toBeInTheDocument();
  });
});