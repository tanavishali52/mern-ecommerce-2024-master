const ReviewGenerator = require('../review-generator');
const ProductReview = require('../../models/Review');
const mongoose = require('mongoose');

// Mock the ProductReview model
jest.mock('../../models/Review');

describe('ReviewGenerator', () => {
  let reviewGenerator;
  const mockProductId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    reviewGenerator = new ReviewGenerator();
    jest.clearAllMocks();
  });

  describe('calculateBlockDistribution', () => {
    test('should calculate correct distribution for 5 reviews', () => {
      const result = reviewGenerator.calculateBlockDistribution(5);
      
      expect(result).toEqual({
        fullBlocks: 1,
        remainingReviews: 0,
        totalBlocks: 1
      });
    });

    test('should calculate correct distribution for 20 reviews', () => {
      const result = reviewGenerator.calculateBlockDistribution(20);
      
      expect(result).toEqual({
        fullBlocks: 4,
        remainingReviews: 0,
        totalBlocks: 4
      });
    });

    test('should calculate correct distribution for 50 reviews', () => {
      const result = reviewGenerator.calculateBlockDistribution(50);
      
      expect(result).toEqual({
        fullBlocks: 10,
        remainingReviews: 0,
        totalBlocks: 10
      });
    });

    test('should calculate correct distribution for 100 reviews', () => {
      const result = reviewGenerator.calculateBlockDistribution(100);
      
      expect(result).toEqual({
        fullBlocks: 20,
        remainingReviews: 0,
        totalBlocks: 20
      });
    });

    test('should handle non-multiple-of-5 numbers', () => {
      const result = reviewGenerator.calculateBlockDistribution(23);
      
      expect(result).toEqual({
        fullBlocks: 4,
        remainingReviews: 3,
        totalBlocks: 5
      });
    });
  });

  describe('processReviewBlock', () => {
    const mockBlock = {
      id: 1,
      reviews: [
        { username: 'Ali_Khan92', rating: 5, comment: 'Great product' },
        { username: 'Sana_Ali_PK', rating: 4, comment: 'Good quality' },
        { username: 'Ahmed_Raza786', rating: 5, comment: 'Excellent' },
        { username: 'ZaraWrites', rating: 4, comment: 'Nice product' },
        { username: 'Bilal_Official', rating: 5, comment: 'Perfect' }
      ]
    };

    test('should process full block correctly', async () => {
      const result = await reviewGenerator.processReviewBlock(
        mockBlock, 
        mockProductId, 
        0, 
        false
      );

      expect(result).toHaveLength(5);
      expect(result[0]).toMatchObject({
        productId: expect.any(mongoose.Types.ObjectId),
        userId: null,
        userName: 'Ali_Khan92',
        reviewMessage: 'Great product',
        reviewValue: 5,
        isGenerated: true,
        blockId: 1,
        blockPosition: 0,
        images: []
      });
    });

    test('should process partial block correctly', async () => {
      const result = await reviewGenerator.processReviewBlock(
        mockBlock, 
        mockProductId, 
        0, 
        false, 
        3
      );

      expect(result).toHaveLength(3);
      expect(result[2]).toMatchObject({
        userName: 'Ahmed_Raza786',
        blockPosition: 2
      });
    });

    test('should set correct block positions', async () => {
      const result = await reviewGenerator.processReviewBlock(
        mockBlock, 
        mockProductId, 
        0, 
        false
      );

      result.forEach((review, index) => {
        expect(review.blockPosition).toBe(index);
      });
    });
  });

  describe('calculateGenerationStats', () => {
    const mockReviews = [
      { reviewValue: 5, blockId: 1, userName: 'User1' },
      { reviewValue: 4, blockId: 1, userName: 'User2' },
      { reviewValue: 5, blockId: 2, userName: 'User3' },
      { reviewValue: 4, blockId: 2, userName: 'User4' },
      { reviewValue: 5, blockId: 3, userName: 'User5' }
    ];

    test('should calculate correct statistics', () => {
      const stats = reviewGenerator.calculateGenerationStats(mockReviews);

      expect(stats).toMatchObject({
        totalReviews: 5,
        averageRating: 4.6,
        ratingDistribution: { '4': 2, '5': 3 },
        blocksUsed: 3,
        uniqueUsernames: 5
      });
      expect(stats.generatedAt).toBeDefined();
    });

    test('should handle single rating', () => {
      const singleReview = [{ reviewValue: 5, blockId: 1, userName: 'User1' }];
      const stats = reviewGenerator.calculateGenerationStats(singleReview);

      expect(stats.averageRating).toBe(5);
      expect(stats.totalReviews).toBe(1);
    });
  });

  describe('validateGenerationParams', () => {
    test('should validate correct parameters', () => {
      const result = reviewGenerator.validateGenerationParams(mockProductId, 20);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid product ID', () => {
      const result = reviewGenerator.validateGenerationParams('invalid-id', 20);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid product ID format');
    });

    test('should reject invalid review count', () => {
      const result = reviewGenerator.validateGenerationParams(mockProductId, 15);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Total reviews must be 5, 20, 50, or 100');
    });

    test('should reject missing parameters', () => {
      const result = reviewGenerator.validateGenerationParams(null, null);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product ID is required');
      expect(result.errors).toContain('Total reviews count is required');
    });
  });

  describe('batchInsertReviews', () => {
    const mockReviews = [
      { userName: 'User1', reviewValue: 5 },
      { userName: 'User2', reviewValue: 4 }
    ];

    test('should successfully batch insert reviews', async () => {
      const mockInsertedReviews = mockReviews.map((review, index) => ({
        ...review,
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date()
      }));

      ProductReview.insertMany.mockResolvedValue(mockInsertedReviews);

      const result = await reviewGenerator.batchInsertReviews(mockReviews);

      expect(ProductReview.insertMany).toHaveBeenCalledWith(mockReviews, {
        ordered: false,
        rawResult: false
      });
      expect(result).toEqual(mockInsertedReviews);
    });

    test('should handle partial batch insert failure', async () => {
      const mockError = {
        writeErrors: [{ index: 1, errmsg: 'Duplicate key' }],
        insertedDocs: [mockReviews[0]]
      };

      ProductReview.insertMany.mockRejectedValue(mockError);

      const result = await reviewGenerator.batchInsertReviews(mockReviews);

      expect(result).toEqual([mockReviews[0]]);
    });

    test('should throw error for complete batch failure', async () => {
      const mockError = new Error('Database connection failed');
      ProductReview.insertMany.mockRejectedValue(mockError);

      await expect(reviewGenerator.batchInsertReviews(mockReviews))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('getGenerationOptions', () => {
    test('should return correct generation options', () => {
      const options = reviewGenerator.getGenerationOptions();

      expect(options).toMatchObject({
        availableReviewCounts: [5, 20, 50, 100],
        blockInfo: {
          totalBlocks: 20,
          reviewsPerBlock: 5,
          averageRating: expect.any(Number),
          ratingDistribution: expect.any(Object)
        },
        features: {
          imageSupport: true,
          bulkGeneration: true,
          regeneration: true,
          statisticsTracking: true
        }
      });
    });
  });

  describe('generateReviewsByBlocks', () => {
    beforeEach(() => {
      // Mock successful batch insert
      ProductReview.insertMany.mockResolvedValue([
        { _id: '1', reviewValue: 5, blockId: 1, userName: 'User1' },
        { _id: '2', reviewValue: 4, blockId: 1, userName: 'User2' }
      ]);
    });

    test('should validate input parameters', async () => {
      await expect(reviewGenerator.generateReviewsByBlocks('invalid-id', 5))
        .rejects.toThrow('Invalid product ID provided');

      await expect(reviewGenerator.generateReviewsByBlocks(mockProductId, 15))
        .rejects.toThrow('Total reviews must be 5, 20, 50, or 100');
    });

    test('should generate correct number of reviews', async () => {
      const result = await reviewGenerator.generateReviewsByBlocks(mockProductId, 5);

      expect(result.success).toBe(true);
      expect(result.totalGenerated).toBe(2); // Mocked return
      expect(result.productId).toBe(mockProductId);
      expect(result.statistics).toBeDefined();
      expect(result.blocksUsed).toBeDefined();
    });
  });

  describe('regenerateProductReviews', () => {
    test('should delete existing and generate new reviews', async () => {
      ProductReview.deleteMany.mockResolvedValue({ deletedCount: 3 });
      ProductReview.insertMany.mockResolvedValue([
        { _id: '1', reviewValue: 5, blockId: 1, userName: 'User1' }
      ]);

      const result = await reviewGenerator.regenerateProductReviews(mockProductId, 5);

      expect(ProductReview.deleteMany).toHaveBeenCalledWith({
        productId: expect.any(mongoose.Types.ObjectId),
        isGenerated: true
      });
      expect(result.deletedCount).toBe(3);
      expect(result.success).toBe(true);
    });
  });
});