const ReviewBlockManager = require('../review-block-manager');

describe('ReviewBlockManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ReviewBlockManager();
  });

  describe('getAllBlocks', () => {
    test('should return all blocks with basic info', () => {
      const blocks = manager.getAllBlocks();
      
      expect(blocks).toHaveLength(20);
      expect(blocks[0]).toHaveProperty('id');
      expect(blocks[0]).toHaveProperty('name');
      expect(blocks[0]).toHaveProperty('description');
      expect(blocks[0]).toHaveProperty('reviewCount');
      expect(blocks[0].reviewCount).toBe(5);
    });
  });

  describe('getBlockById', () => {
    test('should return correct block by ID', () => {
      const block = manager.getBlockById(1);
      
      expect(block).toBeTruthy();
      expect(block.id).toBe(1);
      expect(block.name).toBe('Skincare Enthusiasts');
      expect(block.reviews).toHaveLength(5);
    });

    test('should return null for invalid ID', () => {
      const block = manager.getBlockById(999);
      expect(block).toBeNull();
    });
  });

  describe('getBlocksByNames', () => {
    test('should return blocks by names', () => {
      const blocks = manager.getBlocksByNames(['Skincare Enthusiasts', 'Daily Users']);
      
      expect(blocks).toHaveLength(2);
      expect(blocks[0].name).toBe('Skincare Enthusiasts');
      expect(blocks[1].name).toBe('Daily Users');
    });

    test('should return empty array for invalid names', () => {
      const blocks = manager.getBlocksByNames(['Invalid Name']);
      expect(blocks).toHaveLength(0);
    });
  });

  describe('getRandomBlock', () => {
    test('should return a random block', () => {
      const block = manager.getRandomBlock();
      
      expect(block).toBeTruthy();
      expect(block).toHaveProperty('id');
      expect(block).toHaveProperty('name');
      expect(block).toHaveProperty('reviews');
    });

    test('should exclude specified IDs', () => {
      const excludeIds = [1, 2, 3, 4, 5];
      const block = manager.getRandomBlock(excludeIds);
      
      expect(block).toBeTruthy();
      expect(excludeIds).not.toContain(block.id);
    });

    test('should return null when all blocks are excluded', () => {
      const allIds = Array.from({ length: 20 }, (_, i) => i + 1);
      const block = manager.getRandomBlock(allIds);
      
      expect(block).toBeNull();
    });
  });

  describe('getRandomBlocks', () => {
    test('should return specified number of blocks', () => {
      const blocks = manager.getRandomBlocks(5);
      
      expect(blocks).toHaveLength(5);
      
      // Check that all blocks are unique
      const ids = blocks.map(block => block.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(5);
    });

    test('should respect exclude IDs', () => {
      const excludeIds = [1, 2];
      const blocks = manager.getRandomBlocks(3, excludeIds);
      
      expect(blocks).toHaveLength(3);
      blocks.forEach(block => {
        expect(excludeIds).not.toContain(block.id);
      });
    });
  });

  describe('selectBlocksForGeneration', () => {
    test('should select correct number of blocks for review count', () => {
      const blocks = manager.selectBlocksForGeneration(25); // 5 blocks needed
      
      expect(blocks).toHaveLength(5);
    });

    test('should use preferred blocks when specified', () => {
      const preferredNames = ['Skincare Enthusiasts', 'Daily Users'];
      const blocks = manager.selectBlocksForGeneration(10, preferredNames);
      
      expect(blocks).toHaveLength(2);
      expect(blocks[0].name).toBe('Skincare Enthusiasts');
      expect(blocks[1].name).toBe('Daily Users');
    });

    test('should fill remaining slots with random blocks', () => {
      const preferredNames = ['Skincare Enthusiasts'];
      const blocks = manager.selectBlocksForGeneration(15, preferredNames); // 3 blocks needed
      
      expect(blocks).toHaveLength(3);
      expect(blocks[0].name).toBe('Skincare Enthusiasts');
      expect(blocks[1]).toBeTruthy();
      expect(blocks[2]).toBeTruthy();
    });
  });

  describe('validateBlockSelection', () => {
    test('should validate correct block names', () => {
      const result = manager.validateBlockSelection(['Skincare Enthusiasts', 'Daily Users']);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validBlocks).toHaveLength(2);
    });

    test('should validate correct block IDs', () => {
      const result = manager.validateBlockSelection([1, 2]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validBlocks).toHaveLength(2);
    });

    test('should return errors for invalid identifiers', () => {
      const result = manager.validateBlockSelection(['Invalid Name', 999]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.validBlocks).toHaveLength(0);
    });
  });

  describe('getBlockStatistics', () => {
    test('should return correct statistics', () => {
      const stats = manager.getBlockStatistics();
      
      expect(stats.totalBlocks).toBe(20);
      expect(stats.totalReviews).toBe(100); // 20 blocks * 5 reviews each
      expect(stats.reviewsPerBlock).toBe(5);
      expect(stats.averageRating).toBeGreaterThan(0);
      expect(stats.blockNames).toHaveLength(20);
    });
  });

  describe('recently used tracking', () => {
    test('should track recently used blocks', () => {
      manager.addToRecentlyUsed(1);
      manager.addToRecentlyUsed(2);
      
      expect(manager.recentlyUsedBlocks).toContain(1);
      expect(manager.recentlyUsedBlocks).toContain(2);
    });

    test('should limit recently used list size', () => {
      for (let i = 1; i <= 10; i++) {
        manager.addToRecentlyUsed(i);
      }
      
      expect(manager.recentlyUsedBlocks).toHaveLength(5);
      expect(manager.recentlyUsedBlocks[0]).toBe(10); // Most recent first
    });

    test('should clear recently used blocks', () => {
      manager.addToRecentlyUsed(1);
      manager.clearRecentlyUsed();
      
      expect(manager.recentlyUsedBlocks).toHaveLength(0);
    });
  });
});