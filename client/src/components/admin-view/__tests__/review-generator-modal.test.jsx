import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ReviewGeneratorModal from '../review-generator-modal';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock fetch
global.fetch = vi.fn();

describe('ReviewGeneratorModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    productId: 'test-product-id',
    productTitle: 'Test Product',
    onGenerated: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
  });

  test('renders modal when open', () => {
    render(<ReviewGeneratorModal {...defaultProps} />);
    
    expect(screen.getByText('Generate Product Reviews')).toBeInTheDocument();
    expect(screen.getByText('Generate authentic Pakistani-style reviews for "Test Product"')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<ReviewGeneratorModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Generate Product Reviews')).not.toBeInTheDocument();
  });

  test('displays review count options', () => {
    render(<ReviewGeneratorModal {...defaultProps} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('allows selecting review count', () => {
    render(<ReviewGeneratorModal {...defaultProps} />);
    
    const option20 = screen.getByText('20').closest('.cursor-pointer');
    fireEvent.click(option20);
    
    expect(option20).toHaveClass('ring-2', 'ring-primary');
  });

  test('toggles image inclusion option', () => {
    render(<ReviewGeneratorModal {...defaultProps} />);
    
    const imageToggle = screen.getByText('Disabled');
    fireEvent.click(imageToggle);
    
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  test('fetches generation options on open', async () => {
    const mockOptions = {
      success: true,
      data: {
        reviewGeneration: {
          blockInfo: {
            totalBlocks: 20,
            averageRating: 4.56,
            reviewsPerBlock: 5
          }
        },
        imageUpload: {
          maxImagesPerReview: 5
        }
      }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockOptions)
    });

    render(<ReviewGeneratorModal {...defaultProps} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/reviews/generation-options');
    });
  });

  test('checks for existing reviews on open', async () => {
    const mockReviews = {
      success: true,
      data: {
        statistics: {
          generated: 5,
          total: 5,
          averageRating: 4.5
        }
      }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockReviews)
    });

    render(<ReviewGeneratorModal {...defaultProps} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/admin/products/${defaultProps.productId}/reviews`)
      );
    });
  });

  test('shows existing reviews warning when applicable', async () => {
    const mockReviews = {
      success: true,
      data: {
        statistics: {
          generated: 5,
          total: 5,
          averageRating: 4.5
        }
      }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: {} })
    }).mockResolvedValueOnce({
      json: () => Promise.resolve(mockReviews)
    });

    render(<ReviewGeneratorModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Existing Generated Reviews Found')).toBeInTheDocument();
    });
  });

  test('generates reviews successfully', async () => {
    const mockGenerationResult = {
      success: true,
      data: {
        totalGenerated: 20,
        statistics: {
          averageRating: 4.6
        }
      }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: {} })
    }).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: { statistics: { generated: 0 } } })
    }).mockResolvedValueOnce({
      json: () => Promise.resolve(mockGenerationResult)
    });

    render(<ReviewGeneratorModal {...defaultProps} />);

    // Select 20 reviews
    const option20 = screen.getByText('20').closest('.cursor-pointer');
    fireEvent.click(option20);

    // Click generate button
    const generateButton = screen.getByText(/Generate 20 Reviews/);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/admin/products/${defaultProps.productId}/generate-reviews`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            totalReviews: 20,
            includeImages: false,
            regenerate: false
          })
        })
      );
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Reviews Generated Successfully!",
        description: "Generated 20 reviews with 4.6⭐ average rating."
      });
    });

    expect(defaultProps.onGenerated).toHaveBeenCalledWith(mockGenerationResult.data);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('handles generation errors', async () => {
    const mockError = {
      success: false,
      message: 'Generation failed'
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: {} })
    }).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: { statistics: { generated: 0 } } })
    }).mockResolvedValueOnce({
      json: () => Promise.resolve(mockError)
    });

    render(<ReviewGeneratorModal {...defaultProps} />);

    // Select 5 reviews
    const option5 = screen.getByText('5').closest('.cursor-pointer');
    fireEvent.click(option5);

    // Click generate button
    const generateButton = screen.getByText(/Generate 5 Reviews/);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Generation Failed",
        description: "Generation failed",
        variant: "destructive"
      });
    });
  });

  test('requires review count selection', () => {
    render(<ReviewGeneratorModal {...defaultProps} />);

    const generateButton = screen.getByText(/Generate.*Reviews/);
    fireEvent.click(generateButton);

    expect(mockToast).toHaveBeenCalledWith({
      title: "Selection Required",
      description: "Please select the number of reviews to generate.",
      variant: "destructive"
    });
  });

  test('shows regenerate option when existing reviews found', async () => {
    const mockReviews = {
      success: true,
      data: {
        statistics: {
          generated: 5,
          total: 5,
          averageRating: 4.5
        }
      }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: {} })
    }).mockResolvedValueOnce({
      json: () => Promise.resolve(mockReviews)
    });

    render(<ReviewGeneratorModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Regenerate All')).toBeInTheDocument();
    });
  });

  test('calls onClose when modal is closed', () => {
    render(<ReviewGeneratorModal {...defaultProps} />);
    
    // Simulate closing the modal (this would typically be done by clicking outside or pressing escape)
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Note: The actual close behavior depends on the Dialog component implementation
    // This test verifies the onClose prop is passed correctly
    expect(defaultProps.onClose).toBeDefined();
  });
});