import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ReviewImageUploader from '../review-image-uploader';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock fetch
global.fetch = vi.fn();

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('ReviewImageUploader', () => {
  const defaultProps = {
    reviewId: 'test-review-id',
    existingImages: [],
    onImagesUpdated: vi.fn(),
    maxImages: 5,
    maxFileSize: 5 * 1024 * 1024
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
  });

  test('renders upload area when slots available', () => {
    render(<ReviewImageUploader {...defaultProps} />);
    
    expect(screen.getByText('Upload New Images')).toBeInTheDocument();
    expect(screen.getByText('5 slots remaining')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop images here')).toBeInTheDocument();
  });

  test('shows existing images', () => {
    const existingImages = [
      {
        _id: 'img-1',
        url: 'http://example.com/image1.jpg',
        originalName: 'image1.jpg',
        size: 1024000
      },
      {
        _id: 'img-2',
        url: 'http://example.com/image2.jpg',
        originalName: 'image2.jpg',
        size: 2048000
      }
    ];

    render(<ReviewImageUploader {...defaultProps} existingImages={existingImages} />);
    
    expect(screen.getByText('Existing Images (2/5)')).toBeInTheDocument();
    expect(screen.getByText('image1.jpg')).toBeInTheDocument();
    expect(screen.getByText('image2.jpg')).toBeInTheDocument();
    expect(screen.getByText('3 slots remaining')).toBeInTheDocument();
  });

  test('shows maximum images reached when no slots available', () => {
    const existingImages = Array(5).fill(null).map((_, i) => ({
      _id: `img-${i}`,
      url: `http://example.com/image${i}.jpg`,
      originalName: `image${i}.jpg`,
      size: 1024000
    }));

    render(<ReviewImageUploader {...defaultProps} existingImages={existingImages} />);
    
    expect(screen.getByText('Maximum images reached')).toBeInTheDocument();
    expect(screen.getByText('This review already has the maximum of 10 images.')).toBeInTheDocument();
    expect(screen.queryByText('Upload New Images')).not.toBeInTheDocument();
  });

  test('handles file selection', () => {
    render(<ReviewImageUploader {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /select images/i });
    
    // Create mock file
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock the file input
    const input = document.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  test('validates file types', () => {
    render(<ReviewImageUploader {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    
    // Create invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    Object.defineProperty(input, 'files', {
      value: [invalidFile],
      writable: false,
    });

    fireEvent.change(input);

    expect(mockToast).toHaveBeenCalledWith({
      title: "Upload Validation Failed",
      description: expect.stringContaining("Unsupported format"),
      variant: "destructive"
    });
  });

  test('validates file size', () => {
    render(<ReviewImageUploader {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    
    // Create oversized file
    const oversizedFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
      type: 'image/jpeg' 
    });
    
    Object.defineProperty(oversizedFile, 'size', {
      value: 6 * 1024 * 1024,
      writable: false
    });

    Object.defineProperty(input, 'files', {
      value: [oversizedFile],
      writable: false,
    });

    fireEvent.change(input);

    expect(mockToast).toHaveBeenCalledWith({
      title: "Upload Validation Failed",
      description: expect.stringContaining("File too large"),
      variant: "destructive"
    });
  });

  test('validates maximum image count', () => {
    render(<ReviewImageUploader {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    
    // Create 6 files (exceeds max of 5)
    const files = Array(6).fill(null).map((_, i) => 
      new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
    );
    
    Object.defineProperty(input, 'files', {
      value: files,
      writable: false,
    });

    fireEvent.change(input);

    expect(mockToast).toHaveBeenCalledWith({
      title: "Upload Validation Failed",
      description: expect.stringContaining("Cannot upload 6 files"),
      variant: "destructive"
    });
  });

  test('handles drag and drop', () => {
    render(<ReviewImageUploader {...defaultProps} />);
    
    const dropZone = screen.getByText('Drag & drop images here').closest('div');
    
    // Test drag enter
    fireEvent.dragEnter(dropZone);
    expect(screen.getByText('Drop images here')).toBeInTheDocument();
    
    // Test drag leave
    fireEvent.dragLeave(dropZone);
    expect(screen.getByText('Drag & drop images here')).toBeInTheDocument();
    
    // Test drop
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [mockFile]
      }
    };
    
    fireEvent.drop(dropZone, dropEvent);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  test('uploads images successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        uploadedImages: [
          { _id: 'new-img-1', originalName: 'test.jpg' }
        ]
      }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    render(<ReviewImageUploader {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByText('Selected Images (1)')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload 1 Image');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/admin/reviews/${defaultProps.reviewId}/images`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Images Uploaded Successfully",
      description: "Uploaded 1 images to the review."
    });

    expect(defaultProps.onImagesUpdated).toHaveBeenCalledWith(mockResponse.data.uploadedImages);
  });

  test('handles upload failure', async () => {
    const mockError = {
      success: false,
      message: 'Upload failed'
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockError)
    });

    render(<ReviewImageUploader {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('Selected Images (1)')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload 1 Image');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Upload Failed",
        description: "Upload failed",
        variant: "destructive"
      });
    });
  });

  test('removes preview images', () => {
    render(<ReviewImageUploader {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    // Find and click remove button
    const removeButton = document.querySelector('button[class*="absolute"]');
    if (removeButton) {
      fireEvent.click(removeButton);
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    }
  });

  test('clears all selected images', () => {
    render(<ReviewImageUploader {...defaultProps} />);
    
    const input = document.querySelector('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  test('deletes existing images', async () => {
    const existingImages = [
      {
        _id: 'img-1',
        url: 'http://example.com/image1.jpg',
        originalName: 'image1.jpg',
        size: 1024000
      }
    ];

    const mockResponse = {
      success: true,
      data: {
        deletedImage: { id: 'img-1', filename: 'image1.jpg' }
      }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(<ReviewImageUploader {...defaultProps} existingImages={existingImages} />);
    
    // Find delete button (trash icon)
    const deleteButton = document.querySelector('button[class*="text-red-600"]') || 
                        document.querySelector('svg[class*="lucide-trash-2"]')?.closest('button');
    
    if (deleteButton) {
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/images/img-1', { method: 'DELETE' });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Image Deleted",
        description: '"image1.jpg" has been deleted successfully.'
      });
    }
  });
});