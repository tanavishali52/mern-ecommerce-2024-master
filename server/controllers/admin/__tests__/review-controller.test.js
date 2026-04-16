const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const reviewController = require('../review-controller');
const ProductReview = require('../../../models/Review');
const Product = require('../../../models/Product');
const ReviewImage = require('../../../models/ReviewImage');

// Mock dependencies
jest.mock('../../../models/Review');
jest.mock('../../../models/Product');
jest.mock('../../../models/ReviewImage');
jest.mock('../../../services/review-generator');
jest.mock('../../../services/review-image-service');

// Create test app
const app = express();
app.use(express.json());

// Add test routes
app.post('/products/:id/generate-reviews', reviewController.generateProductReviews);
app.get('/products/:id/reviews', reviewController.getProductReviews);
app.put('/reviews/:id', reviewController.editReview);
app.delete('/reviews/:id', reviewController.deleteReview);
app.get('/reviews/generation-options', reviewController.getGenerationOptions);

describe('Review Controller', () => {
  const mockProductId = new mongoose.Types.ObjectId().toString();
  const mockReviewId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /products/:id/generate-reviews', () => {
    const mockProduct = {
      _id: mockProductId,
      title: 'Test Product'
    };

    beforeEach(() => {
      Product.findById.mockResolvedValue(mockProduct);
      ProductReview.countDocuments.mockResolvedValue(0);
    });

    test('should generate reviews successfully', async () => {
      const mockResult = {
        success: true,
        totalGenerated: 5,
        reviews: [],
        statistics: { averageRating: 4.6 },
        blocksUsed: [1]
      };

      // Mock the review generator
      const ReviewGenerator = require('../../../services/review-generator');
      ReviewGenerator.prototype.validateGenerationParams = jest.fn().mockReturnValue({ valid: true });
      ReviewGenerator.prototype.generateReviewsByBlocks = jest.fn().mockResolvedValue(mockResult);

      const response = await request(app)
        .post(`/products/${mockProductId}/generate-reviews`)
        .send({ totalReviews: 5 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reviews generated successfully');
    });

    test('should reject invalid product ID', async () => {
      Product.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/products/invalid-id/generate-reviews')
        .send({ totalReviews: 5 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should reject invalid review count', async () => {
      const ReviewGenerator = require('../../../services/review-generator');
      ReviewGenerator.prototype.validateGenerationParams = jest.fn().mockReturnValue({
        valid: false,
        errors: ['Total reviews must be 5, 20, 50, or 100']
      });

      const response = await request(app)
        .post(`/products/${mockProductId}/generate-reviews`)
        .send({ totalReviews: 15 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle existing generated reviews', async () => {
      ProductReview.countDocuments.mockResolvedValue(5);

      const response = await request(app)
        .post(`/products/${mockProductId}/generate-reviews`)
        .send({ totalReviews: 5 });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Product already has generated reviews');
    });

    test('should regenerate when requested', async () => {
      ProductReview.countDocuments.mockResolvedValue(5);
      
      const mockResult = {
        success: true,
        totalGenerated: 5,
        deletedCount: 5
      };

      const ReviewGenerator = require('../../../services/review-generator');
      ReviewGenerator.prototype.validateGenerationParams = jest.fn().mockReturnValue({ valid: true });
      ReviewGenerator.prototype.regenerateProductReviews = jest.fn().mockResolvedValue(mockResult);

      const response = await request(app)
        .post(`/products/${mockProductId}/generate-reviews`)
        .send({ totalReviews: 5, regenerate: true });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /products/:id/reviews', () => {
    const mockProduct = {
      _id: mockProductId,
      title: 'Test Product'
    };

    const mockReviews = [
      {
        _id: mockReviewId,
        userName: 'Ali_Khan92',
        reviewMessage: 'Great product',
        reviewValue: 5,
        isGenerated: true
      }
    ];

    beforeEach(() => {
      Product.findById.mockResolvedValue(mockProduct);
      ProductReview.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockReviews)
      });
      ProductReview.countDocuments.mockResolvedValue(1);
    });

    test('should get reviews successfully', async () => {
      const ReviewGenerator = require('../../../services/review-generator');
      ReviewGenerator.prototype.getProductReviewStats = jest.fn().mockResolvedValue({
        total: 1,
        generated: 1,
        real: 0,
        averageRating: 5
      });

      const response = await request(app)
        .get(`/products/${mockProductId}/reviews`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toEqual(mockReviews);
    });

    test('should handle pagination', async () => {
      const ReviewGenerator = require('../../../services/review-generator');
      ReviewGenerator.prototype.getProductReviewStats = jest.fn().mockResolvedValue({});

      const response = await request(app)
        .get(`/products/${mockProductId}/reviews`)
        .query({ page: 2, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.currentPage).toBe(2);
    });

    test('should filter by review type', async () => {
      const ReviewGenerator = require('../../../services/review-generator');
      ReviewGenerator.prototype.getProductReviewStats = jest.fn().mockResolvedValue({});

      const response = await request(app)
        .get(`/products/${mockProductId}/reviews`)
        .query({ type: 'generated' });

      expect(response.status).toBe(200);
      expect(ProductReview.find).toHaveBeenCalledWith(
        expect.objectContaining({ isGenerated: true })
      );
    });
  });

  describe('PUT /reviews/:id', () => {
    const mockReview = {
      _id: mockReviewId,
      userName: 'Ali_Khan92',
      reviewMessage: 'Great product',
      reviewValue: 5,
      productId: new mongoose.Types.ObjectId(mockProductId)
    };

    beforeEach(() => {
      ProductReview.findById.mockResolvedValue(mockReview);
      ProductReview.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          ...mockReview,
          userName: 'Updated_User'
        })
      });
    });

    test('should update review successfully', async () => {
      const response = await request(app)
        .put(`/reviews/${mockReviewId}`)
        .send({ userName: 'Updated_User' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should validate review value range', async () => {
      const response = await request(app)
        .put(`/reviews/${mockReviewId}`)
        .send({ reviewValue: 6 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Review value must be an integer between 1 and 5');
    });

    test('should reject empty username', async () => {
      const response = await request(app)
        .put(`/reviews/${mockReviewId}`)
        .send({ userName: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username cannot be empty');
    });

    test('should handle non-existent review', async () => {
      ProductReview.findById.mockResolvedValue(null);

      const response = await request(app)
        .put(`/reviews/${mockReviewId}`)
        .send({ userName: 'Updated_User' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Review not found');
    });
  });

  describe('DELETE /reviews/:id', () => {
    const mockReview = {
      _id: mockReviewId,
      userName: 'Ali_Khan92',
      reviewValue: 5,
      productId: new mongoose.Types.ObjectId(mockProductId)
    };

    beforeEach(() => {
      ProductReview.findById.mockResolvedValue(mockReview);
      ProductReview.findByIdAndDelete.mockResolvedValue(mockReview);
    });

    test('should delete review successfully', async () => {
      const ReviewImageService = require('../../../services/review-image-service');
      ReviewImageService.prototype.deleteReviewImages = jest.fn().mockResolvedValue(2);

      const response = await request(app)
        .delete(`/reviews/${mockReviewId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedImagesCount).toBe(2);
    });

    test('should handle non-existent review', async () => {
      ProductReview.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/reviews/${mockReviewId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Review not found');
    });
  });

  describe('GET /reviews/generation-options', () => {
    test('should get generation options successfully', async () => {
      const ReviewGenerator = require('../../../services/review-generator');
      const ReviewImageService = require('../../../services/review-image-service');
      
      ReviewGenerator.prototype.getGenerationOptions = jest.fn().mockReturnValue({
        availableReviewCounts: [5, 20, 50, 100],
        blockInfo: { totalBlocks: 20 }
      });
      
      ReviewImageService.prototype.getServiceConfig = jest.fn().mockReturnValue({
        maxFileSize: 5242880,
        maxImagesPerReview: 5,
        supportedFormats: ['jpg', 'jpeg', 'png', 'webp']
      });

      const response = await request(app)
        .get('/reviews/generation-options');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviewGeneration.availableReviewCounts).toEqual([5, 20, 50, 100]);
    });
  });
});