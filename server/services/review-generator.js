const ReviewBlockManager = require('./review-block-manager');
const ProductReview = require('../models/Review');
const mongoose = require('mongoose');

/**
 * ReviewGenerator handles the generation of authentic product reviews in blocks
 */
class ReviewGenerator {
  constructor() {
    this.blockManager = new ReviewBlockManager();
  }

  /**
   * Generate reviews for a product using predefined blocks
   * @param {string} productId - Product ID to generate reviews for
   * @param {number} totalReviews - Total number of reviews to generate (5, 20, 50, 100)
   * @param {boolean} includeImages - Whether to include placeholder for images
   * @returns {Promise<Object>} Generation result with created reviews and statistics
   */
  async generateReviewsByBlocks(productId, totalReviews, includeImages = false) {
    try {
      // Validate inputs
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID provided');
      }

      if (![5, 20, 50, 100].includes(totalReviews)) {
        throw new Error('Total reviews must be 5, 20, 50, or 100');
      }

      // Calculate block distribution
      const blockDistribution = this.calculateBlockDistribution(totalReviews);
      console.log(`Generating ${totalReviews} reviews using ${blockDistribution.fullBlocks} full blocks and ${blockDistribution.remainingReviews} additional reviews`);

      // Select random blocks
      const selectedBlocks = this.blockManager.getRandomBlocks(blockDistribution.fullBlocks);
      
      // Process all reviews
      const allReviews = [];
      let blockIndex = 0;

      // Process full blocks
      for (const block of selectedBlocks) {
        const blockReviews = await this.processReviewBlock(
          block, 
          productId, 
          blockIndex, 
          includeImages
        );
        allReviews.push(...blockReviews);
        blockIndex++;
      }

      // Handle remaining reviews if needed (for non-multiple-of-5 requests)
      if (blockDistribution.remainingReviews > 0) {
        const partialBlock = this.blockManager.getRandomBlock();
        const partialReviews = await this.processReviewBlock(
          partialBlock, 
          productId, 
          blockIndex, 
          includeImages,
          blockDistribution.remainingReviews
        );
        allReviews.push(...partialReviews);
      }

      // Batch insert all reviews for performance
      const createdReviews = await this.batchInsertReviews(allReviews);

      // Calculate statistics
      const statistics = this.calculateGenerationStats(createdReviews);

      return {
        success: true,
        productId,
        totalGenerated: createdReviews.length,
        reviews: createdReviews,
        statistics,
        blocksUsed: selectedBlocks.map(b => b.id),
        message: `Successfully generated ${createdReviews.length} reviews for product`
      };

    } catch (error) {
      console.error('Error generating reviews:', error);
      throw new Error(`Review generation failed: ${error.message}`);
    }
  }

  /**
   * Process a single review block and create review objects
   * @param {Object} blockData - Block data from ReviewBlockManager
   * @param {string} productId - Product ID
   * @param {number} blockIndex - Index of this block in the generation sequence
   * @param {boolean} includeImages - Whether to include image placeholders
   * @param {number} limitReviews - Limit number of reviews from this block (for partial blocks)
   * @returns {Promise<Array>} Array of review objects ready for database insertion
   */
  async processReviewBlock(blockData, productId, blockIndex, includeImages = false, limitReviews = null) {
    const reviewsToProcess = limitReviews ? blockData.reviews.slice(0, limitReviews) : blockData.reviews;
    const processedReviews = [];

    for (let i = 0; i < reviewsToProcess.length; i++) {
      const reviewData = reviewsToProcess[i];
      
      const reviewObject = {
        productId: new mongoose.Types.ObjectId(productId),
        userId: null, // null for generated reviews
        userName: reviewData.username,
        reviewMessage: reviewData.comment,
        reviewValue: reviewData.rating,
        isGenerated: true,
        generatedAt: new Date(),
        blockId: blockData.id,
        blockPosition: i,
        images: [] // Will be populated later if images are added
      };

      processedReviews.push(reviewObject);
    }

    return processedReviews;
  }

  /**
   * Calculate how to distribute reviews across blocks
   * @param {number} totalReviews - Total reviews requested
   * @returns {Object} Block distribution information
   */
  calculateBlockDistribution(totalReviews) {
    const fullBlocks = Math.floor(totalReviews / 5);
    const remainingReviews = totalReviews % 5;

    return {
      fullBlocks,
      remainingReviews,
      totalBlocks: remainingReviews > 0 ? fullBlocks + 1 : fullBlocks
    };
  }

  /**
   * Batch insert reviews for optimal database performance
   * @param {Array} reviews - Array of review objects
   * @returns {Promise<Array>} Array of created review documents
   */
  async batchInsertReviews(reviews) {
    try {
      // Use insertMany for batch insertion
      const createdReviews = await ProductReview.insertMany(reviews, {
        ordered: false, // Continue inserting even if some fail
        rawResult: false // Return the documents, not just the result
      });

      console.log(`Successfully inserted ${createdReviews.length} reviews in batch`);
      return createdReviews;

    } catch (error) {
      // Handle partial success in batch operations
      if (error.writeErrors && error.insertedDocs) {
        console.warn(`Batch insert partially successful: ${error.insertedDocs.length} inserted, ${error.writeErrors.length} failed`);
        return error.insertedDocs;
      }
      throw error;
    }
  }

  /**
   * Calculate statistics for the generated reviews
   * @param {Array} reviews - Array of created review documents
   * @returns {Object} Statistics object
   */
  calculateGenerationStats(reviews) {
    const ratings = reviews.map(r => r.reviewValue);
    const ratingCounts = ratings.reduce((counts, rating) => {
      counts[rating] = (counts[rating] || 0) + 1;
      return counts;
    }, {});

    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    const uniqueBlocks = new Set(reviews.map(r => r.blockId));
    const uniqueUsernames = new Set(reviews.map(r => r.userName));

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution: ratingCounts,
      blocksUsed: uniqueBlocks.size,
      uniqueUsernames: uniqueUsernames.size,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Regenerate all reviews for a product (delete existing generated reviews and create new ones)
   * @param {string} productId - Product ID
   * @param {number} totalReviews - Number of reviews to generate
   * @param {boolean} includeImages - Whether to include images
   * @returns {Promise<Object>} Regeneration result
   */
  async regenerateProductReviews(productId, totalReviews, includeImages = false) {
    try {
      // Delete existing generated reviews for this product
      const deleteResult = await ProductReview.deleteMany({
        productId: new mongoose.Types.ObjectId(productId),
        isGenerated: true
      });

      console.log(`Deleted ${deleteResult.deletedCount} existing generated reviews`);

      // Generate new reviews
      const result = await this.generateReviewsByBlocks(productId, totalReviews, includeImages);
      
      return {
        ...result,
        deletedCount: deleteResult.deletedCount,
        message: `Regenerated ${result.totalGenerated} reviews (deleted ${deleteResult.deletedCount} old reviews)`
      };

    } catch (error) {
      console.error('Error regenerating reviews:', error);
      throw new Error(`Review regeneration failed: ${error.message}`);
    }
  }

  /**
   * Get generation statistics for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product review statistics
   */
  async getProductReviewStats(productId) {
    try {
      const [generatedReviews, realReviews] = await Promise.all([
        ProductReview.find({ 
          productId: new mongoose.Types.ObjectId(productId), 
          isGenerated: true 
        }),
        ProductReview.find({ 
          productId: new mongoose.Types.ObjectId(productId), 
          isGenerated: false 
        })
      ]);

      const allReviews = [...generatedReviews, ...realReviews];
      const allRatings = allReviews.map(r => r.reviewValue);
      
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
        : 0;

      return {
        total: allReviews.length,
        generated: generatedReviews.length,
        real: realReviews.length,
        averageRating: Math.round(averageRating * 100) / 100,
        generatedBlocks: [...new Set(generatedReviews.map(r => r.blockId))].length,
        lastGenerated: generatedReviews.length > 0 
          ? Math.max(...generatedReviews.map(r => new Date(r.generatedAt).getTime()))
          : null
      };

    } catch (error) {
      console.error('Error getting product review stats:', error);
      throw new Error(`Failed to get review statistics: ${error.message}`);
    }
  }

  /**
   * Validate generation parameters
   * @param {string} productId - Product ID
   * @param {number} totalReviews - Number of reviews
   * @returns {Object} Validation result
   */
  validateGenerationParams(productId, totalReviews) {
    const errors = [];

    if (!productId) {
      errors.push('Product ID is required');
    } else if (!mongoose.Types.ObjectId.isValid(productId)) {
      errors.push('Invalid product ID format');
    }

    if (!totalReviews) {
      errors.push('Total reviews count is required');
    } else if (![5, 20, 50, 100].includes(totalReviews)) {
      errors.push('Total reviews must be 5, 20, 50, or 100');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available generation options
   * @returns {Object} Available options for review generation
   */
  getGenerationOptions() {
    const blockStats = this.blockManager.getBlockStats();
    
    return {
      availableReviewCounts: [5, 20, 50, 100],
      blockInfo: {
        totalBlocks: blockStats.totalBlocks,
        reviewsPerBlock: 5,
        averageRating: blockStats.averageRating,
        ratingDistribution: blockStats.ratingDistribution
      },
      features: {
        imageSupport: true,
        bulkGeneration: true,
        regeneration: true,
        statisticsTracking: true
      }
    };
  }
}

module.exports = ReviewGenerator;