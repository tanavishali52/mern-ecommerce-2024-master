/**
 * Test scenarios for ProductImageUpload component workflow
 * These tests verify the bug fixes and new 10-image limit functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProductImageUpload from '../image-upload';

// Mock dependencies
vi.mock('../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('axios');

describe('ProductImageUpload Workflow Tests', () => {
  const mockProps = {
    imageFiles: [],
    setImageFiles: vi.fn(),
    uploadedImageUrls: [],
    setUploadedImageUrls: vi.fn(),
    setImageLoadingState: vi.fn(),
    imageLoadingState: false,
    isEditMode: false,
    isCustomStyling: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bug Fix Verification', () => {
    test('should not show duplicate images when adding second image', () => {
      const { rerender } = render(<ProductImageUpload {...mockProps} />);
      
      // Simulate adding first image
      const firstFile = new File(['test'], 'test1.jpg', { type: 'image/jpeg' });
      rerender(<ProductImageUpload {...mockProps} imageFiles={[firstFile]} />);
      
      // Verify only one image is shown
      expect(screen.getAllByText(/test1\.jpg/)).toHaveLength(1);
      
      // Simulate adding second image
      const secondFile = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
      rerender(<ProductImageUpload {...mockProps} imageFiles={[firstFile, secondFile]} />);
      
      // Verify both images are shown without duplicates
      expect(screen.getByText(/test1\.jpg/)).toBeInTheDocument();
      expect(screen.getByText(/test2\.jpg/)).toBeInTheDocument();
      expect(screen.getAllByText(/\.jpg/)).toHaveLength(2);
    });

    test('should show correct count after removing images', () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['test3'], 'test3.jpg', { type: 'image/jpeg' })
      ];
      
      const { rerender } = render(<ProductImageUpload {...mockProps} imageFiles={files} />);
      
      // Verify all 3 images are shown
      expect(screen.getAllByText(/\.jpg/)).toHaveLength(3);
      
      // Simulate removing middle image
      const updatedFiles = [files[0], files[2]]; // Remove index 1
      rerender(<ProductImageUpload {...mockProps} imageFiles={updatedFiles} />);
      
      // Verify correct count (2 images remaining)
      expect(screen.getAllByText(/\.jpg/)).toHaveLength(2);
      expect(screen.getByText(/test1\.jpg/)).toBeInTheDocument();
      expect(screen.getByText(/test3\.jpg/)).toBeInTheDocument();
      expect(screen.queryByText(/test2\.jpg/)).not.toBeInTheDocument();
    });
  });

  describe('10-Image Limit Verification', () => {
    test('should accept up to 10 images', () => {
      const files = Array.from({ length: 10 }, (_, i) => 
        new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      
      render(<ProductImageUpload {...mockProps} imageFiles={files} />);
      
      // Verify all 10 images are displayed
      expect(screen.getAllByText(/\.jpg/)).toHaveLength(10);
      
      // Verify "Add more images" button is not shown when at limit
      expect(screen.queryByText('Add more images')).not.toBeInTheDocument();
    });

    test('should show error when trying to add more than 10 images', () => {
      const mockToast = vi.fn();
      vi.mocked(require('../ui/use-toast').useToast).mockReturnValue({ toast: mockToast });
      
      const existingFiles = Array.from({ length: 8 }, (_, i) => 
        new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      
      render(<ProductImageUpload {...mockProps} imageFiles={existingFiles} />);
      
      // Try to add 3 more files (would exceed 10 limit)
      const input = screen.getByRole('textbox', { hidden: true });
      const newFiles = Array.from({ length: 3 }, (_, i) => 
        new File([`new${i}`], `new${i}.jpg`, { type: 'image/jpeg' })
      );
      
      Object.defineProperty(input, 'files', {
        value: newFiles,
        writable: false,
      });
      
      fireEvent.change(input);
      
      // Verify error toast was called
      expect(mockToast).toHaveBeenCalledWith({
        title: "Too many files",
        description: "Maximum 10 images allowed",
        variant: "destructive"
      });
    });

    test('should show correct UI text for 10-image limit', () => {
      render(<ProductImageUpload {...mockProps} />);
      
      // Verify UI shows "Max 10" instead of "Max 5"
      expect(screen.getByText('Upload Images (Max 10)')).toBeInTheDocument();
      expect(screen.getByText(/max 10/)).toBeInTheDocument();
      
      // Verify old "Max 5" text is not present
      expect(screen.queryByText(/max 5/i)).not.toBeInTheDocument();
    });
  });

  describe('State Synchronization', () => {
    test('should maintain synchronized arrays when removing images', () => {
      const mockSetImageFiles = vi.fn();
      const mockSetUploadedImageUrls = vi.fn();
      
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];
      
      render(<ProductImageUpload 
        {...mockProps} 
        imageFiles={files}
        setImageFiles={mockSetImageFiles}
        setUploadedImageUrls={mockSetUploadedImageUrls}
      />);
      
      // Click remove button for first image
      const removeButtons = screen.getAllByLabelText('Remove File');
      fireEvent.click(removeButtons[0]);
      
      // Verify both setters were called with filter functions
      expect(mockSetImageFiles).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSetUploadedImageUrls).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});