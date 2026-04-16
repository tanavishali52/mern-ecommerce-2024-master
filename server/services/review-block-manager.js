const reviewBlocks = require('../data/review-blocks');

/**
 * ReviewBlockManager - Manages review block selection and operations
 */
class ReviewBlockManager {
  constructor() {
    this.blocks = reviewBlocks;
    this.recentlyUsedBlocks = [];
    this.maxRecentlyUsed = 5; // Track last 5 used blocks to avoid repetition
  }

  /**
   * Get all available review blocks with names and descriptions
   * @returns {Array} Array of all review blocks
   */
  getAllBlocks() {
    return this.blocks.map(block => ({
      id: block.id,
      name: block.name,
      description: block.description,
      reviewCount: block.reviews.length
    }));
  }

  /**
   * Get a specific block by ID
   * @param {number} id - Block ID
   * @returns {Object|null} Block object or null if not found
   */
  getBlockById(id) {
    return this.blocks.find(block => block.id === id) || null;
  }

  /**
   * Get multiple blocks by their IDs
   * @param {Array<number>} ids - Array of block IDs
   * @returns {Array} Array of block objects
   */
  getBlocksByIds(ids) {
    return ids.map(id => this.getBlockById(id)).filter(block => block !== null);
  }

  /**
   * Get blocks by their names
   * @param {Array<string>} names - Array of block names
   * @returns {Array} Array of block objects
   */
  getBlocksByNames(names) {
    return this.blocks.filter(block => 
      names.includes(block.name)
    );
  }

  /**
   * Get a random block, optionally excluding recently used ones
   * @param {Array<number>} excludeIds - Block IDs to exclude
   * @returns {Object|null} Random block object
   */
  getRandomBlock(excludeIds = []) {
    const availableBlocks = this.blocks.filter(block => 
      !excludeIds.includes(block.id) && 
      !this.recentlyUsedBlocks.includes(block.id)
    );

    if (availableBlocks.length === 0) {
      // If no blocks available after exclusions, use any block except excludeIds
      const fallbackBlocks = this.blocks.filter(block => !excludeIds.includes(block.id));
      if (fallbackBlocks.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * fallbackBlocks.length);
      return fallbackBlocks[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * availableBlocks.length);
    const selectedBlock = availableBlocks[randomIndex];
    
    // Track recently used block
    this.addToRecentlyUsed(selectedBlock.id);
    
    return selectedBlock;
  }

  /**
   * Get multiple random blocks avoiding consecutive duplicates
   * @param {number} count - Number of blocks to select
   * @param {Array<number>} excludeIds - Block IDs to exclude
   * @returns {Array} Array of selected blocks
   */
  getRandomBlocks(count, excludeIds = []) {
    const selectedBlocks = [];
    const usedIds = [...excludeIds];

    for (let i = 0; i < count; i++) {
      const block = this.getRandomBlock(usedIds);
      if (!block) break; // No more blocks available
      
      selectedBlocks.push(block);
      usedIds.push(block.id);
      
      // If we've used more than half the available blocks, reset to avoid infinite loops
      if (usedIds.length > this.blocks.length / 2) {
        usedIds.length = 0; // Clear used IDs to allow reuse
      }
    }

    return selectedBlocks;
  }

  /**
   * Select blocks based on generation strategy
   * @param {number} totalReviews - Total number of reviews needed
   * @param {Array<string>} preferredBlockNames - Optional preferred block names
   * @returns {Array} Array of selected blocks
   */
  selectBlocksForGeneration(totalReviews, preferredBlockNames = []) {
    const reviewsPerBlock = 5;
    const blocksNeeded = Math.ceil(totalReviews / reviewsPerBlock);

    // If specific blocks are preferred, use those first
    if (preferredBlockNames.length > 0) {
      const preferredBlocks = this.getBlocksByNames(preferredBlockNames);
      if (preferredBlocks.length >= blocksNeeded) {
        return preferredBlocks.slice(0, blocksNeeded);
      }
      
      // Use preferred blocks and fill remaining with random blocks
      const remainingNeeded = blocksNeeded - preferredBlocks.length;
      const usedIds = preferredBlocks.map(block => block.id);
      const additionalBlocks = this.getRandomBlocks(remainingNeeded, usedIds);
      
      return [...preferredBlocks, ...additionalBlocks];
    }

    // Default: select random blocks
    return this.getRandomBlocks(blocksNeeded);
  }

  /**
   * Add block ID to recently used list
   * @param {number} blockId - Block ID to add
   */
  addToRecentlyUsed(blockId) {
    this.recentlyUsedBlocks.unshift(blockId);
    if (this.recentlyUsedBlocks.length > this.maxRecentlyUsed) {
      this.recentlyUsedBlocks.pop();
    }
  }

  /**
   * Clear recently used blocks list
   */
  clearRecentlyUsed() {
    this.recentlyUsedBlocks = [];
  }

  /**
   * Get statistics about available blocks
   * @returns {Object} Block statistics
   */
  getBlockStatistics() {
    const totalBlocks = this.blocks.length;
    const totalReviews = this.blocks.reduce((sum, block) => sum + block.reviews.length, 0);
    const averageRating = this.blocks.reduce((sum, block) => {
      const blockAverage = block.reviews.reduce((ratingSum, review) => ratingSum + review.rating, 0) / block.reviews.length;
      return sum + blockAverage;
    }, 0) / totalBlocks;

    return {
      totalBlocks,
      totalReviews,
      reviewsPerBlock: totalReviews / totalBlocks,
      averageRating: Math.round(averageRating * 10) / 10,
      blockNames: this.blocks.map(block => ({
        id: block.id,
        name: block.name,
        description: block.description
      }))
    };
  }

  /**
   * Validate block selection
   * @param {Array<string|number>} blockIdentifiers - Block names or IDs
   * @returns {Object} Validation result
   */
  validateBlockSelection(blockIdentifiers) {
    const errors = [];
    const validBlocks = [];

    for (const identifier of blockIdentifiers) {
      let block = null;
      
      if (typeof identifier === 'number') {
        block = this.getBlockById(identifier);
      } else if (typeof identifier === 'string') {
        block = this.blocks.find(b => b.name === identifier);
      }

      if (block) {
        validBlocks.push(block);
      } else {
        errors.push(`Block not found: ${identifier}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validBlocks,
      validCount: validBlocks.length
    };
  }
}

module.exports = ReviewBlockManager;