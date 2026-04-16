const ReviewImageService = require('../review-image-service');
const ReviewImage = require('../../models/ReviewImage');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../models/ReviewImage');
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    access: jest.fn(),
    copyFile: jest.fn(),
    unlink: jest.fn()
  }
}));

describe('ReviewImageService', () => {
  let imageService;
  const mockReviewId = new mongoose.Types.ObjectId().toString();
  const mockImageId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    imageService = new ReviewImageService();
    jest.clearAllMocks();
  });

  describe('constructor and initialization', () => {
    test('should initialize with correct configuration', () => {
      expect(imageService.maxFileSize).toBe(5 * 1024 * 1024);
      expect(imageService.maxImagesPerReview).toBe(10);
      expect(imageService.supportedFormats).toEqual(['jpg', 'jpeg', 'png', 'webp']);
    });

    test('should create upload directories', async () => {
      fs.mkdir.mockResolvedValue();
      
      await imageService.initializeDirectories();
      
      expect(fs.mkdir).toHaveBeenCalledTimes(2);
      expect(fs.mkdir).toHaveBeenCalledWith(imageService.uploadDir, { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith(imageService.thumbnailDir, { recursive: true });
    });
  });

  describe('getMulterConfig', () => {
    test('should return valid multer configuration', () => {
      const config = imageService.getMulterConfig();
      
      expect(config).toBeDefined();
      expect(config.options.limits.fileSize).toBe(imageService.maxFileSize);
      expect(config.options.limits.files).toBe(imageService.maxImagesPerReview);
    });

    test('should accept supported file formats', () => {
      const config = imageService.getMulterConfig();
      const fileFilter = config.options.fileFilter;
      
      const supportedFile = { originalname: 'test.jpg' };
      const unsupportedFile = { originalname: 'test.txt' };
      
      let result;
      fileFilter(null, supportedFile, (err, accepted) => {
        result = { err, accepted };
      });
      expect(result.accepted).toBe(true);
      expect(result.err).toBeNull();
      
      fileFilter(null, unsupportedFile, (err, accepted) => {
        result = { err, accepted };
      });
      expect(result.accepted).toBe(false);
      expect(result.err).toBeInstanceOf(Error);
    });
  });

  describe('validateImageFile', () => {
    const mockFile = {
      path: '/tmp/test.jpg',
      size: 1024 * 1024, // 1MB
      originalname: 'test.jpg',
      mimetype: 'image/jpeg'
    };

    test('should validate correct image file', async () => {
      fs.access.mockResolvedValue();
      
      const result = await imageService.validateImageFile(mockFile);
      expect(result).toBe(true);
    });

    test('should reject oversized files', async () => {
      const oversizedFile = { ...mockFile, size: 10 * 1024 * 1024 }; // 10MB
      fs.access.mockResolvedValue();
      
      await expect(imageService.validateImageFile(oversizedFile))
        .rejects.toThrow('File size exceeds 5MB limit');
    });

    test('should reject unsupported formats', async () => {
      const unsupportedFile = { 
        ...mockFile, 
        originalname: 'test.gif',
        mimetype: 'image/gif'
      };
      fs.access.mockResolvedValue();
      
      await expect(imageService.validateImageFile(unsupportedFile))
        .rejects.toThrow('Unsupported format: gif');
    });

    test('should reject invalid MIME types', async () => {
      const invalidMimeFile = { 
        ...mockFile, 
        mimetype: 'text/plain'
      };
      fs.access.mockResolvedValue();
      
      await expect(imageService.validateImageFile(invalidMimeFile))
        .rejects.toThrow('Invalid MIME type: text/plain');
    });
  });

  describe('generateThumbnail', () => {
    const mockFile = {
      filename: 'test-123.jpg',
      path: '/tmp/test-123.jpg'
    };

    test('should generate thumbnail successfully', async () => {
      fs.copyFile.mockResolvedValue();
      
      const result = await imageService.generateThumbnail(mockFile);
      
      expect(result).toContain('thumb-test-123.jpg');
      expect(fs.copyFile).toHaveBeenCalled();
    });

    test('should handle thumbnail generation failure gracefully', async () => {
      fs.copyFile.mockRejectedValue(new Error('Copy failed'));
      
      const result = await imageService.generateThumbnail(mockFile);
      
      expect(result).toBeNull();
    });
  });

  describe('uploadReviewImages', () => {
    const mockFiles = [
      {
        originalname: 'test1.jpg',
        filename: 'review-123-1.jpg',
        path: '/tmp/review-123-1.jpg',
        size: 1024,
        mimetype: 'image/jpeg'
      }
    ];

    beforeEach(() => {
      fs.access.mockResolvedValue();
      fs.copyFile.mockResolvedValue();
      ReviewImage.find.mockResolvedValue([]); // No existing images
    });

    test('should upload images successfully', async () => {
      const mockSavedImage = { 
        _id: mockImageId, 
        reviewId: mockReviewId,
        filename: 'review-123-1.jpg'
      };
      
      ReviewImage.prototype.save = jest.fn().mockResolvedValue(mockSavedImage);
      
      const result = await imageService.uploadReviewImages(mockFiles, mockReviewId);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockSavedImage);
    });

    test('should reject invalid review ID', async () => {
      await expect(imageService.uploadReviewImages(mockFiles, 'invalid-id'))
        .rejects.toThrow('Invalid review ID provided');
    });

    test('should reject empty file array', async () => {
      await expect(imageService.uploadReviewImages([], mockReviewId))
        .rejects.toThrow('No files provided for upload');
    });

    test('should reject too many files', async () => {
      const tooManyFiles = Array(11).fill(mockFiles[0]);
      
      await expect(imageService.uploadReviewImages(tooManyFiles, mockReviewId))
        .rejects.toThrow('Maximum 10 images allowed per review');
    });

    test('should respect existing image limit', async () => {
      // Mock existing images
      ReviewImage.find.mockResolvedValue(Array(4).fill({ _id: 'existing' }));
      
      const twoMoreFiles = [mockFiles[0], mockFiles[0]];
      
      await expect(imageService.uploadReviewImages(twoMoreFiles, mockReviewId))
        .rejects.toThrow('Review can have maximum 10 images. Currently has 4');
    });
  });

  describe('getReviewImages', () => {
    test('should get images for valid review ID', async () => {
      const mockImages = [
        { _id: '1', reviewId: mockReviewId, filename: 'img1.jpg' },
        { _id: '2', reviewId: mockReviewId, filename: 'img2.jpg' }
      ];
      
      ReviewImage.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockImages)
      });
      
      const result = await imageService.getReviewImages(mockReviewId);
      
      expect(result).toEqual(mockImages);
      expect(ReviewImage.find).toHaveBeenCalledWith({
        reviewId: expect.any(mongoose.Types.ObjectId)
      });
    });

    test('should reject invalid review ID', async () => {
      await expect(imageService.getReviewImages('invalid-id'))
        .rejects.toThrow('Invalid review ID provided');
    });
  });

  describe('deleteImage', () => {
    const mockImage = {
      _id: mockImageId,
      filename: 'test.jpg',
      thumbnailUrl: '/uploads/review-thumbnails/thumb-test.jpg'
    };

    test('should delete image successfully', async () => {
      ReviewImage.findById.mockResolvedValue(mockImage);
      ReviewImage.findByIdAndDelete.mockResolvedValue(mockImage);
      fs.unlink.mockResolvedValue();
      
      const result = await imageService.deleteImage(mockImageId);
      
      expect(result).toBe(true);
      expect(fs.unlink).toHaveBeenCalledTimes(2); // Main image and thumbnail
      expect(ReviewImage.findByIdAndDelete).toHaveBeenCalledWith(mockImageId);
    });

    test('should reject invalid image ID', async () => {
      await expect(imageService.deleteImage('invalid-id'))
        .rejects.toThrow('Invalid image ID provided');
    });

    test('should reject non-existent image', async () => {
      ReviewImage.findById.mockResolvedValue(null);
      
      await expect(imageService.deleteImage(mockImageId))
        .rejects.toThrow('Image not found');
    });

    test('should continue with database deletion if file deletion fails', async () => {
      ReviewImage.findById.mockResolvedValue(mockImage);
      ReviewImage.findByIdAndDelete.mockResolvedValue(mockImage);
      fs.unlink.mockRejectedValue(new Error('File not found'));
      
      const result = await imageService.deleteImage(mockImageId);
      
      expect(result).toBe(true);
      expect(ReviewImage.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  describe('getImageStats', () => {
    const mockImages = [
      { filename: 'test1.jpg', size: 1024 },
      { filename: 'test2.png', size: 2048 },
      { filename: 'test3.jpg', size: 1536 }
    ];

    test('should calculate correct statistics', async () => {
      ReviewImage.find.mockResolvedValue(mockImages);
      
      const stats = await imageService.getImageStats();
      
      expect(stats).toMatchObject({
        totalImages: 3,
        totalSize: 4608,
        averageSize: 1536,
        formatDistribution: { jpg: 2, png: 1 },
        reviewId: 'all'
      });
    });

    test('should handle empty image set', async () => {
      ReviewImage.find.mockResolvedValue([]);
      
      const stats = await imageService.getImageStats();
      
      expect(stats.totalImages).toBe(0);
      expect(stats.averageSize).toBe(0);
    });

    test('should filter by review ID when provided', async () => {
      ReviewImage.find.mockResolvedValue(mockImages);
      
      await imageService.getImageStats(mockReviewId);
      
      expect(ReviewImage.find).toHaveBeenCalledWith({
        reviewId: expect.any(mongoose.Types.ObjectId)
      });
    });
  });

  describe('getServiceConfig', () => {
    test('should return correct service configuration', () => {
      const config = imageService.getServiceConfig();
      
      expect(config).toMatchObject({
        maxFileSize: 5 * 1024 * 1024,
        maxImagesPerReview: 10,
        supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        endpoints: {
          upload: '/api/admin/reviews/:reviewId/images',
          delete: '/api/admin/images/:imageId',
          get: '/api/admin/reviews/:reviewId/images'
        }
      });
    });
  });
});