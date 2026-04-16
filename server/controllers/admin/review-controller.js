const ReviewBlockManager = require('../../services/review-block-manager');
const ProductReview = require('../../models/Review');
const Product = require('../../models/Product');

const reviewBlockManager = new ReviewBlockManager();

/**
 * Get all available review blocks with names and descriptions
 */
const getAvailableBlocks = async (req, res) => {
  try {
    const blocks = reviewBlockManager.getAllBlocks();
    
    res.status(200).json({
      success: true,
      data: blocks,
      message: 'Available review blocks fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching available blocks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available blocks'
    });
  }
};

/**
 * Get generation options and statistics
 */
const getGenerationOptions = async (req, res) => {
  try {
    const blockStats = reviewBlockManager.getBlockStatistics();
    
    const options = {
      reviewGeneration: {
        blockInfo: {
          totalBlocks: blockStats.totalBlocks,
          reviewsPerBlock: blockStats.reviewsPerBlock,
          averageRating: blockStats.averageRating
        },
        availableOptions: [5, 20, 50, 100]
      },
      imageUpload: {
        maxImagesPerReview: 5,
        supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: '5MB'
      },
      blockNames: blockStats.blockNames
    };
    
    res.status(200).json({
      success: true,
      data: options,
      message: 'Generation options fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching generation options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch generation options'
    });
  }
};

/**
 * Generate reviews for a product using selected blocks
 */
const generateProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { totalReviews, includeImages = false, regenerate = false, preferredBlocks = [] } = req.body;

    // Validate input
    if (!totalReviews || totalReviews <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total reviews must be a positive number'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If regenerating, delete existing generated reviews
    if (regenerate) {
      await ProductReview.deleteMany({ 
        productId: productId, 
        isGenerated: true 
      });
    }

    // Select blocks for generation
    const selectedBlocks = reviewBlockManager.selectBlocksForGeneration(
      totalReviews, 
      preferredBlocks
    );

    if (selectedBlocks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid blocks found for generation'
      });
    }

    // Generate reviews from selected blocks
    const generatedReviews = [];
    let reviewsGenerated = 0;
    const reviewsPerBlock = 5;

    for (const block of selectedBlocks) {
      if (reviewsGenerated >= totalReviews) break;

      const reviewsFromThisBlock = Math.min(
        reviewsPerBlock, 
        totalReviews - reviewsGenerated
      );

      for (let i = 0; i < reviewsFromThisBlock; i++) {
        const reviewData = block.reviews[i];
        if (!reviewData) break;

        const review = new ProductReview({
          productId: productId,
          userId: null, // Generated reviews don't have user IDs
          userName: reviewData.username,
          reviewMessage: reviewData.comment,
          reviewValue: reviewData.rating,
          isGenerated: true,
          generatedAt: new Date(),
          blockId: block.id,
          blockPosition: i
        });

        generatedReviews.push(review);
        reviewsGenerated++;
      }
    }

    // Save all generated reviews
    const savedReviews = await ProductReview.insertMany(generatedReviews);

    // Calculate new average rating for the product
    const allReviews = await ProductReview.find({ productId: productId });
    const averageRating = allReviews.reduce((sum, review) => sum + review.reviewValue, 0) / allReviews.length;
    
    // Update product with new average rating
    await Product.findByIdAndUpdate(productId, {
      averageReview: Math.round(averageRating * 10) / 10
    });

    // Prepare response statistics
    const statistics = {
      totalGenerated: savedReviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      blocksUsed: selectedBlocks.length,
      blockNames: selectedBlocks.map(block => block.name)
    };

    res.status(200).json({
      success: true,
      data: {
        reviews: savedReviews,
        statistics,
        totalGenerated: savedReviews.length
      },
      message: `Successfully generated ${savedReviews.length} reviews`
    });

  } catch (error) {
    console.error('Error generating reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate reviews'
    });
  }
};

/**
 * Get reviews for a product (admin view with additional info)
 */
const getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { type, limit = 50, page = 1 } = req.query;

    const query = { productId };
    
    // Filter by review type if specified
    if (type === 'generated') {
      query.isGenerated = true;
    } else if (type === 'real') {
      query.isGenerated = { $ne: true };
    }

    const skip = (page - 1) * limit;
    
    const reviews = await ProductReview.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'userName email');

    const totalReviews = await ProductReview.countDocuments(query);
    const generatedCount = await ProductReview.countDocuments({ productId, isGenerated: true });
    const realCount = await ProductReview.countDocuments({ productId, isGenerated: { $ne: true } });

    // Calculate statistics
    const allProductReviews = await ProductReview.find({ productId });
    const averageRating = allProductReviews.length > 0 
      ? allProductReviews.reduce((sum, review) => sum + review.reviewValue, 0) / allProductReviews.length 
      : 0;

    const statistics = {
      total: totalReviews,
      generated: generatedCount,
      real: realCount,
      averageRating: Math.round(averageRating * 10) / 10
    };

    res.status(200).json({
      success: true,
      data: {
        reviews,
        statistics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          limit: parseInt(limit)
        }
      },
      message: 'Reviews fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

/**
 * Update a specific review
 */
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reviewMessage, reviewValue, userName } = req.body;

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review fields
    if (reviewMessage !== undefined) review.reviewMessage = reviewMessage;
    if (reviewValue !== undefined) review.reviewValue = reviewValue;
    if (userName !== undefined) review.userName = userName;
    
    review.updatedAt = new Date();

    await review.save();

    // Recalculate product average rating
    const allReviews = await ProductReview.find({ productId: review.productId });
    const averageRating = allReviews.reduce((sum, r) => sum + r.reviewValue, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(review.productId, {
      averageReview: Math.round(averageRating * 10) / 10
    });

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

/**
 * Delete a specific review
 */
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const productId = review.productId;

    // Delete the review
    await ProductReview.findByIdAndDelete(reviewId);

    // Recalculate product average rating
    const remainingReviews = await ProductReview.find({ productId });
    const averageRating = remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.reviewValue, 0) / remainingReviews.length
      : 0;
    
    await Product.findByIdAndUpdate(productId, {
      averageReview: Math.round(averageRating * 10) / 10
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

module.exports = {
  getAvailableBlocks,
  getGenerationOptions,
  generateProductReviews,
  getProductReviews,
  updateReview,
  deleteReview
};