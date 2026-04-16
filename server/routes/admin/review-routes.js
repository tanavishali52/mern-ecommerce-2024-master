const express = require('express');
const router = express.Router();

const {
  getAvailableBlocks,
  getGenerationOptions,
  generateProductReviews,
  getProductReviews,
  updateReview,
  deleteReview
} = require('../../controllers/admin/review-controller');

// Get available review blocks
router.get('/blocks', getAvailableBlocks);

// Get generation options and statistics
router.get('/generation-options', getGenerationOptions);

// Generate reviews for a product
router.post('/products/:productId/generate-reviews', generateProductReviews);

// Get reviews for a product (admin view)
router.get('/products/:productId/reviews', getProductReviews);

// Update a specific review
router.put('/:reviewId', updateReview);

// Delete a specific review
router.delete('/:reviewId', deleteReview);

module.exports = router;