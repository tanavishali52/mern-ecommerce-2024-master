import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ReviewManagementDashboard from '../review-management-dashboard';
import GeneratedReviewsManager from '../generated-reviews-manager';
import ReviewBulkActions from '../review-bulk-actions';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock fetch
global.fetch = vi.fn();

describe('Review Management Integration', () => {
  const mockProduct = {
    _id: 'test-product-id',
    title: 'Test Product'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
  });

  describe('ReviewManagementDashboard', () => {
    test('renders dashboard with all tabs', () => {
      render(<ReviewManagementDashboard product={mockProduct} />);
      
      expect(screen.getByText('Review Management Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Manage Reviews')).toBeInTheDocument();
      expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('fetches review statistics on mount', async () => {
      const mockStats = {
        success: true,
        data: {
          statistics: {
            total: 25,
            generated: 20,
            real: 5,
            averageRating: 4.5
          }
        }
      };

      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockStats)
      });

      render(<ReviewManagementDashboard product={mockProduct} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/admin/products/${mockProduct._id}/reviews`)
        );
      });
    });

    test('displays statistics cards when data is available', async () => {
      const mockStats = {
        success: true,
        data: {
          statistics: {
            total: 25,
            generated: 20,
            real: 5,
            averageRating: 4.5
          }
        }
      };

      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockStats)
      });

      render(<ReviewManagementDashboard product={mockProduct} />);

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('4.5⭐')).toBeInTheDocument();
      });
    });

    test('handles refresh functionality', async () => {
      const mockStats = {
        success: true,
        data: {
          statistics: {
            total: 25,
            generated: 20,
            real: 5,
            averageRating: 4.5
          }
        }
      };

      fetch.mockResolvedValue({
        json: () => Promise.resolve(mockStats)
      });

      render(<ReviewManagementDashboard product={mockProduct} />);

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Data Refreshed",
          description: "Review statistics have been updated."
        });
      });
    });

    test('switches between tabs correctly', () => {
      render(<ReviewManagementDashboard product={mockProduct} />);

      const manageTab = screen.getByText('Manage Reviews');
      fireEvent.click(manageTab);

      // Should show the manage reviews content
      expect(screen.getByText('Manage Reviews')).toHaveClass('data-[state=active]:bg-background');
    });
  });

  describe('GeneratedReviewsManager', () => {
    const mockReviewsResponse = {
      success: true,
      data: {
        reviews: [
          {
            _id: 'review-1',
            userName: 'Ali_Khan92',
            reviewMessage: 'Great product!',
            reviewValue: 5,
            isGenerated: true,
            createdAt: '2024-01-01T00:00:00Z',
            blockId: 1,
            images: []
          },
          {
            _id: 'review-2',
            userName: 'Sana_Ali_PK',
            reviewMessage: 'Good quality',
            reviewValue: 4,
            isGenerated: true,
            createdAt: '2024-01-02T00:00:00Z',
            blockId: 1,
            images: []
          }
        ],
        statistics: {
          total: 2,
          generated: 2,
          real: 0,
          averageRating: 4.5
        },
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalReviews: 2,
          limit: 10
        }
      }
    };

    test('displays reviews list', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockReviewsResponse)
      });

      render(
        <GeneratedReviewsManager 
          productId={mockProduct._id}
          productTitle={mockProduct.title}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Ali_Khan92')).toBeInTheDocument();
        expect(screen.getByText('Sana_Ali_PK')).toBeInTheDocument();
        expect(screen.getByText('Great product!')).toBeInTheDocument();
        expect(screen.getByText('Good quality')).toBeInTheDocument();
      });
    });

    test('handles review editing', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockReviewsResponse)
      });

      render(
        <GeneratedReviewsManager 
          productId={mockProduct._id}
          productTitle={mockProduct.title}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Ali_Khan92')).toBeInTheDocument();
      });

      // Click edit button for first review
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(btn => 
        btn.querySelector('svg')?.getAttribute('class')?.includes('lucide-edit-3')
      );
      
      if (editButton) {
        fireEvent.click(editButton);

        // Should show edit form
        expect(screen.getByDisplayValue('Ali_Khan92')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Great product!')).toBeInTheDocument();
      }
    });

    test('handles review deletion', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockReviewsResponse)
      }).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true })
      }).mockResolvedValueOnce({
        json: () => Promise.resolve(mockReviewsResponse)
      });

      // Mock window.confirm
      window.confirm = vi.fn(() => true);

      render(
        <GeneratedReviewsManager 
          productId={mockProduct._id}
          productTitle={mockProduct.title}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Ali_Khan92')).toBeInTheDocument();
      });

      // Click delete button for first review
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector('svg')?.getAttribute('class')?.includes('lucide-trash-2')
      );
      
      if (deleteButton) {
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(
            '/api/admin/reviews/review-1',
            { method: 'DELETE' }
          );
        });
      }
    });

    test('handles filtering and sorting', async () => {
      fetch.mockResolvedValue({
        json: () => Promise.resolve(mockReviewsResponse)
      });

      render(
        <GeneratedReviewsManager 
          productId={mockProduct._id}
          productTitle={mockProduct.title}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Ali_Khan92')).toBeInTheDocument();
      });

      // Test filter change
      const filterSelect = screen.getByDisplayValue('All Reviews');
      fireEvent.click(filterSelect);
      
      const generatedOption = screen.getByText('Generated');
      fireEvent.click(generatedOption);

      // Should trigger new API call with filter
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=generated')
        );
      });
    });
  });

  describe('ReviewBulkActions', () => {
    const mockProps = {
      selectedReviews: ['review-1', 'review-2'],
      onSelectionChange: vi.fn(),
      onBulkAction: vi.fn(),
      totalReviews: 10,
      productId: mockProduct._id
    };

    test('displays selected count', () => {
      render(<ReviewBulkActions {...mockProps} />);
      
      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(screen.getByText('2 of 10 reviews selected')).toBeInTheDocument();
    });

    test('handles bulk delete', async () => {
      fetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true })
      });

      render(<ReviewBulkActions {...mockProps} />);

      const deleteButton = screen.getByText('Delete Selected');
      fireEvent.click(deleteButton);

      // Should show confirmation dialog
      expect(screen.getByText('Confirm Bulk Delete')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete 2 selected reviews?')).toBeInTheDocument();

      const confirmButton = screen.getByText('Delete 2 Reviews');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/reviews/review-1', { method: 'DELETE' });
        expect(fetch).toHaveBeenCalledWith('/api/admin/reviews/review-2', { method: 'DELETE' });
      });
    });

    test('handles regenerate all reviews', async () => {
      const mockRegenerateResponse = {
        success: true,
        data: {
          totalGenerated: 20,
          statistics: { averageRating: 4.6 }
        }
      };

      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockRegenerateResponse)
      });

      render(<ReviewBulkActions {...mockProps} />);

      const regenerateButton = screen.getByText('Regenerate All');
      fireEvent.click(regenerateButton);

      // Should show regenerate dialog
      expect(screen.getByText('Regenerate All Reviews')).toBeInTheDocument();

      const confirmButton = screen.getByText('Regenerate Reviews');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `/api/admin/products/${mockProduct._id}/generate-reviews`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              totalReviews: 20,
              regenerate: true
            })
          })
        );
      });
    });

    test('handles CSV export', async () => {
      const mockExportResponse = {
        success: true,
        data: {
          reviews: [
            {
              userName: 'Ali_Khan92',
              reviewValue: 5,
              reviewMessage: 'Great product!',
              isGenerated: true,
              createdAt: '2024-01-01T00:00:00Z'
            }
          ]
        }
      };

      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockExportResponse)
      });

      // Mock URL.createObjectURL and related methods
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      // Mock document.createElement and click
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn()
      };
      document.createElement = vi.fn(() => mockAnchor);

      render(<ReviewBulkActions {...mockProps} />);

      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/admin/products/${mockProduct._id}/reviews?limit=1000`)
        );
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Export Successful",
          description: "Exported 1 reviews to CSV."
        });
      });
    });

    test('disables actions when no reviews selected', () => {
      const propsWithNoSelection = {
        ...mockProps,
        selectedReviews: []
      };

      render(<ReviewBulkActions {...propsWithNoSelection} />);

      const deleteButton = screen.getByText('Delete Selected');
      expect(deleteButton).toBeDisabled();
    });
  });
});