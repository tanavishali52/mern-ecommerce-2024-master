const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ReviewImage = require('../models/ReviewImage');
const mongoose = require('mongoose');

/**
 * ReviewImageService handles image uploads, processing, and management for reviews
 */
class ReviewImageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads/review-images');
    this.thumbnailDir = path.join(__dirname, '../uploads/review-thumbnails');
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.maxImagesPerReview = 10;
    this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp'];
    
    // Ensure upload directories exist
    this.initializeDirectories();
  }

  /**
   * Initialize upload directories
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.thumbnailDir, { recursive: true });
      console.log('Review image directories initialized');
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  /**
   * Configure multer for image uploads
   * @returns {Object} Multer configuration
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `review-${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().slice(1);
      
      if (this.supportedFormats.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file format. Supported formats: ${this.supportedFormats.join(', ')}`), false);
      }
    };

    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: this.maxImagesPerReview
      }
    });

    // Return both the multer instance and configuration for testing
    return {
      upload,
      options: {
        limits: {
          fileSize: this.maxFileSize,
          files: this.maxImagesPerReview
        },
        fileFilter
      }
    };
  }

  /**
   * Upload multiple images for a review
   * @param {Array} files - Array of uploaded files from multer
   * @param {string} reviewId - Review ID to associate images with
   * @returns {Promise<Array>} Array of created image documents
   */
  async uploadReviewImages(files, reviewId) {
    try {
      if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new Error('Invalid review ID provided');
      }

      if (!files || files.length === 0) {
        throw new Error('No files provided for upload');
      }

      if (files.length > this.maxImagesPerReview) {
        throw new Error(`Maximum ${this.maxImagesPerReview} images allowed per review`);
      }

      // Check if review already has images and respect the limit
      const existingImages = await this.getReviewImages(reviewId);
      if (existingImages.length + files.length > this.maxImagesPerReview) {
        throw new Error(`Review can have maximum ${this.maxImagesPerReview} images. Currently has ${existingImages.length}`);
      }

      const imageDocuments = [];

      for (const file of files) {
        try {
          // Validate file
          await this.validateImageFile(file);

          // Generate thumbnail (simplified - in production you'd use sharp or similar)
          const thumbnailPath = await this.generateThumbnail(file);

          // Create image document
          const imageDoc = new ReviewImage({
            reviewId: new mongoose.Types.ObjectId(reviewId),
            originalName: file.originalname,
            filename: file.filename,
            url: `/uploads/review-images/${file.filename}`,
            thumbnailUrl: thumbnailPath ? `/uploads/review-thumbnails/${path.basename(thumbnailPath)}` : null,
            size: file.size,
            mimeType: file.mimetype
          });

          const savedImage = await imageDoc.save();
          imageDocuments.push(savedImage);

        } catch (fileError) {
          // Clean up file if processing failed
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error cleaning up failed file:', unlinkError);
          }
          throw fileError;
        }
      }

      console.log(`Successfully uploaded ${imageDocuments.length} images for review ${reviewId}`);
      return imageDocuments;

    } catch (error) {
      console.error('Error uploading review images:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Validate uploaded image file
   * @param {Object} file - Multer file object
   * @returns {Promise<boolean>} Validation result
   */
  async validateImageFile(file) {
    try {
      // Check file exists
      await fs.access(file.path);

      // Check file size
      if (file.size > this.maxFileSize) {
        throw new Error(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
      }

      // Check file format
      const ext = path.extname(file.originalname).toLowerCase().slice(1);
      if (!this.supportedFormats.includes(ext)) {
        throw new Error(`Unsupported format: ${ext}`);
      }

      // Additional MIME type validation
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp'
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(`Invalid MIME type: ${file.mimetype}`);
      }

      return true;

    } catch (error) {
      throw new Error(`File validation failed: ${error.message}`);
    }
  }

  /**
   * Generate thumbnail for uploaded image (simplified implementation)
   * @param {Object} file - Multer file object
   * @returns {Promise<string|null>} Thumbnail file path or null
   */
  async generateThumbnail(file) {
    try {
      // In a production environment, you would use sharp, jimp, or similar library
      // For now, we'll create a placeholder thumbnail system
      
      const thumbnailFilename = `thumb-${file.filename}`;
      const thumbnailPath = path.join(this.thumbnailDir, thumbnailFilename);
      
      // Copy original file as thumbnail (in production, resize it)
      await fs.copyFile(file.path, thumbnailPath);
      
      console.log(`Generated thumbnail: ${thumbnailFilename}`);
      return thumbnailPath;

    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null; // Non-critical error, continue without thumbnail
    }
  }

  /**
   * Get all images for a specific review
   * @param {string} reviewId - Review ID
   * @returns {Promise<Array>} Array of image documents
   */
  async getReviewImages(reviewId) {
    try {
      if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new Error('Invalid review ID provided');
      }

      const images = await ReviewImage.find({
        reviewId: new mongoose.Types.ObjectId(reviewId)
      }).sort({ createdAt: 1 });

      return images;

    } catch (error) {
      console.error('Error getting review images:', error);
      throw new Error(`Failed to get review images: ${error.message}`);
    }
  }

  /**
   * Delete a specific image
   * @param {string} imageId - Image ID to delete
   * @returns {Promise<boolean>} Deletion success
   */
  async deleteImage(imageId) {
    try {
      if (!imageId || !mongoose.Types.ObjectId.isValid(imageId)) {
        throw new Error('Invalid image ID provided');
      }

      const image = await ReviewImage.findById(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Delete physical files
      const imagePath = path.join(this.uploadDir, image.filename);
      const thumbnailPath = image.thumbnailUrl ? 
        path.join(this.thumbnailDir, path.basename(image.thumbnailUrl)) : null;

      try {
        await fs.unlink(imagePath);
        if (thumbnailPath) {
          await fs.unlink(thumbnailPath);
        }
      } catch (fileError) {
        console.warn('Error deleting physical files:', fileError);
        // Continue with database deletion even if file deletion fails
      }

      // Delete database record
      await ReviewImage.findByIdAndDelete(imageId);

      console.log(`Successfully deleted image: ${imageId}`);
      return true;

    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete all images for a review
   * @param {string} reviewId - Review ID
   * @returns {Promise<number>} Number of images deleted
   */
  async deleteReviewImages(reviewId) {
    try {
      if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new Error('Invalid review ID provided');
      }

      const images = await this.getReviewImages(reviewId);
      let deletedCount = 0;

      for (const image of images) {
        try {
          await this.deleteImage(image._id.toString());
          deletedCount++;
        } catch (deleteError) {
          console.error(`Error deleting image ${image._id}:`, deleteError);
          // Continue with other images
        }
      }

      console.log(`Deleted ${deletedCount}/${images.length} images for review ${reviewId}`);
      return deletedCount;

    } catch (error) {
      console.error('Error deleting review images:', error);
      throw new Error(`Failed to delete review images: ${error.message}`);
    }
  }

  /**
   * Update image metadata
   * @param {string} imageId - Image ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated image document
   */
  async updateImageMetadata(imageId, updates) {
    try {
      if (!imageId || !mongoose.Types.ObjectId.isValid(imageId)) {
        throw new Error('Invalid image ID provided');
      }

      const allowedUpdates = ['originalName'];
      const filteredUpdates = {};

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No valid updates provided');
      }

      const updatedImage = await ReviewImage.findByIdAndUpdate(
        imageId,
        { ...filteredUpdates, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedImage) {
        throw new Error('Image not found');
      }

      return updatedImage;

    } catch (error) {
      console.error('Error updating image metadata:', error);
      throw new Error(`Image update failed: ${error.message}`);
    }
  }

  /**
   * Get image statistics
   * @param {string} reviewId - Optional review ID to filter by
   * @returns {Promise<Object>} Image statistics
   */
  async getImageStats(reviewId = null) {
    try {
      const query = reviewId ? { reviewId: new mongoose.Types.ObjectId(reviewId) } : {};
      
      const images = await ReviewImage.find(query);
      
      const totalImages = images.length;
      const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
      const formatCounts = images.reduce((counts, img) => {
        const ext = path.extname(img.filename).toLowerCase().slice(1);
        counts[ext] = (counts[ext] || 0) + 1;
        return counts;
      }, {});

      const averageSize = totalImages > 0 ? totalSize / totalImages : 0;

      return {
        totalImages,
        totalSize,
        averageSize: Math.round(averageSize),
        formatDistribution: formatCounts,
        reviewId: reviewId || 'all'
      };

    } catch (error) {
      console.error('Error getting image statistics:', error);
      throw new Error(`Failed to get image statistics: ${error.message}`);
    }
  }

  /**
   * Clean up orphaned images (images without associated reviews)
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanupOrphanedImages() {
    try {
      const ProductReview = require('../models/Review');
      
      // Get all image records
      const allImages = await ReviewImage.find({});
      
      // Get all valid review IDs
      const validReviewIds = new Set(
        (await ProductReview.find({}, '_id')).map(r => r._id.toString())
      );

      const orphanedImages = allImages.filter(img => 
        !validReviewIds.has(img.reviewId.toString())
      );

      let cleanedCount = 0;
      for (const image of orphanedImages) {
        try {
          await this.deleteImage(image._id.toString());
          cleanedCount++;
        } catch (deleteError) {
          console.error(`Error cleaning orphaned image ${image._id}:`, deleteError);
        }
      }

      return {
        totalImages: allImages.length,
        orphanedFound: orphanedImages.length,
        cleanedUp: cleanedCount,
        remaining: orphanedImages.length - cleanedCount
      };

    } catch (error) {
      console.error('Error cleaning up orphaned images:', error);
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  }

  /**
   * Get service configuration
   * @returns {Object} Service configuration
   */
  getServiceConfig() {
    return {
      maxFileSize: this.maxFileSize,
      maxImagesPerReview: this.maxImagesPerReview,
      supportedFormats: this.supportedFormats,
      uploadDir: this.uploadDir,
      thumbnailDir: this.thumbnailDir,
      endpoints: {
        upload: '/api/admin/reviews/:reviewId/images',
        delete: '/api/admin/images/:imageId',
        get: '/api/admin/reviews/:reviewId/images'
      }
    };
  }
}

module.exports = ReviewImageService;