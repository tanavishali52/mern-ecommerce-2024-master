import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UserProfile from '../user-profile';
import authReducer from '../../../store/auth-slice';

// Mock fetch
global.fetch = jest.fn();

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: {
      isAuthenticated: true,
      user: {
        id: 'user123',
        userName: 'testuser',
        email: 'test@example.com',
      },
    },
  },
});

const mockProfileData = {
  _id: 'user123',
  userName: 'Test User',
  email: 'test@example.com',
  role: 'user',
  joinDate: '2023-01-01T00:00:00.000Z',
  stats: {
    totalOrders: 5,
    totalSpent: 299.99,
    lastOrderDate: '2023-12-01T00:00:00.000Z',
  },
};

describe('UserProfile Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading state initially', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockProfileData }),
    });

    render(
      <Provider store={mockStore}>
        <UserProfile />
      </Provider>
    );

    expect(screen.getByText('Loading Profile...')).toBeInTheDocument();
  });

  test('renders profile data after loading', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockProfileData }),
    });

    render(
      <Provider store={mockStore}>
        <UserProfile />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Total orders
      expect(screen.getByText('$299.99')).toBeInTheDocument(); // Total spent
    });
  });

  test('enters edit mode when edit button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockProfileData }),
    });

    render(
      <Provider store={mockStore}>
        <UserProfile />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  test('saves profile changes', async () => {
    // Mock initial profile fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockProfileData }),
    });

    // Mock profile update
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { ...mockProfileData, userName: 'Updated User' },
      }),
    });

    render(
      <Provider store={mockStore}>
        <UserProfile />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Update username
    const usernameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(usernameInput, { target: { value: 'Updated User' } });

    // Save changes
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/shop/profile/user123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userName: 'Updated User',
          email: 'test@example.com',
        }),
      });
    });
  });

  test('handles profile fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <Provider store={mockStore}>
        <UserProfile />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load profile data')).toBeInTheDocument();
    });
  });
});