import FilterManager from '../FilterManager';

// Mock fetch
global.fetch = jest.fn();

describe('FilterManager', () => {
  let filterManager;

  beforeEach(() => {
    filterManager = new FilterManager();
    jest.clearAllMocks();
    
    // Mock successful API responses
    fetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: []
      })
    });
  });

  describe('initialization', () => {
    test('should initialize with default filter state', () => {
      const state = filterManager.getState();
      
      expect(state.filters).toEqual({
        department: null,
        primaryCategory: null,
        subCategories: [],
        brands: [],
        priceRange: { min: null, max: null },
        attributes: {
          color: [],
          size: [],
          material: null
        },
        hotOffers: false,
        sort: 'price-lowtohigh',
        searchQuery: ''
      });
      
      expect(state.availableBrands).toEqual([]);
      expect(state.productCounts).toEqual({});
      expect(state.isLoading).toBe(false);
    });

    test('should initialize with provided initial filters', async () => {
      const initialFilters = {
        department: 'electronics',
        hotOffers: true
      };
      
      await filterManager.initialize(initialFilters);
      
      const state = filterManager.getState();
      expect(state.filters.department).toBe('electronics');
      expect(state.filters.hotOffers).toBe(true);
    });
  });

  describe('filter updates', () => {
    test('should update department filter and reset dependent filters', async () => {
      // Set some initial state
      filterManager.filters.primaryCategory = 'gadgets-hardware';
      filterManager.filters.subCategories = ['laptop'];
      filterManager.filters.brands = ['apple'];
      
      await filterManager.updateFilter('department', 'electronics');
      
      const state = filterManager.getState();
      expect(state.filters.department).toBe('electronics');
      expect(state.filters.primaryCategory).toBe(null);
      expect(state.filters.subCategories).toEqual([]);
      expect(state.filters.brands).toEqual([]);
    });

    test('should update primary category and reset dependent filters', async () => {
      filterManager.filters.subCategories = ['laptop'];
      filterManager.filters.brands = ['apple'];
      
      await filterManager.updateFilter('primaryCategory', 'gadgets-hardware');
      
      const state = filterManager.getState();
      expect(state.filters.primaryCategory).toBe('gadgets-hardware');
      expect(state.filters.subCategories).toEqual([]);
      expect(state.filters.brands).toEqual([]);
    });

    test('should add and remove sub-categories', async () => {
      await filterManager.updateFilter('subCategories', 'laptop', true);
      expect(filterManager.filters.subCategories).toContain('laptop');
      
      await filterManager.updateFilter('subCategories', 'desktop', true);
      expect(filterManager.filters.subCategories).toContain('desktop');
      
      await filterManager.updateFilter('subCategories', 'laptop', false);
      expect(filterManager.filters.subCategories).not.toContain('laptop');
      expect(filterManager.filters.subCategories).toContain('desktop');
    });

    test('should add and remove brands', async () => {
      await filterManager.updateFilter('brands', 'apple', true);
      expect(filterManager.filters.brands).toContain('apple');
      
      await filterManager.updateFilter('brands', 'dell', true);
      expect(filterManager.filters.brands).toContain('dell');
      
      await filterManager.updateFilter('brands', 'apple', false);
      expect(filterManager.filters.brands).not.toContain('apple');
      expect(filterManager.filters.brands).toContain('dell');
    });

    test('should update price range', async () => {
      await filterManager.updateFilter('priceRange', { min: 100, max: 500 });
      
      expect(filterManager.filters.priceRange.min).toBe(100);
      expect(filterManager.filters.priceRange.max).toBe(500);
    });

    test('should update attributes', async () => {
      await filterManager.updateFilter('attributes', { 
        type: 'color', 
        values: ['red', 'blue'] 
      }, true);
      
      expect(filterManager.filters.attributes.color).toEqual(['red', 'blue']);
      
      await filterManager.updateFilter('attributes', { 
        type: 'color', 
        values: ['red'] 
      }, false);
      
      expect(filterManager.filters.attributes.color).toEqual(['blue']);
    });

    test('should update hot offers filter', async () => {
      await filterManager.updateFilter('hotOffers', true);
      expect(filterManager.filters.hotOffers).toBe(true);
      
      await filterManager.updateFilter('hotOffers', false);
      expect(filterManager.filters.hotOffers).toBe(false);
    });

    test('should update sort filter', async () => {
      await filterManager.updateFilter('sort', 'price-hightolow');
      expect(filterManager.filters.sort).toBe('price-hightolow');
    });
  });

  describe('search functionality', () => {
    test('should parse department keywords from search', async () => {
      const parseSearchTerms = filterManager.parseSearchTerms.bind(filterManager);
      
      const result1 = parseSearchTerms("men's jacket");
      expect(result1.department).toBe('men');
      
      const result2 = parseSearchTerms("electronics laptop");
      expect(result2.department).toBe('electronics');
    });

    test('should parse sub-category keywords from search', async () => {
      const parseSearchTerms = filterManager.parseSearchTerms.bind(filterManager);
      
      const result = parseSearchTerms("laptop computer");
      expect(result.department).toBe('electronics');
      expect(result.primaryCategory).toBe('gadgets-hardware');
      expect(result.subCategories).toContain('laptop');
    });

    test('should parse color attributes from search', async () => {
      const parseSearchTerms = filterManager.parseSearchTerms.bind(filterManager);
      
      const result = parseSearchTerms("blue red jacket");
      expect(result.attributes).toEqual({
        type: 'color',
        values: ['blue', 'red']
      });
    });

    test('should apply search filters automatically', async () => {
      await filterManager.applySearchFilters("men's blue jacket");
      
      expect(filterManager.filters.searchQuery).toBe("men's blue jacket");
      // Note: The actual filter application would depend on the parseSearchTerms implementation
    });
  });

  describe('API integration', () => {
    test('should fetch available brands', async () => {
      const mockBrands = [
        { id: 'apple', label: 'Apple', count: 5 },
        { id: 'dell', label: 'Dell', count: 3 }
      ];
      
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockBrands
        })
      });
      
      filterManager.filters.department = 'electronics';
      await filterManager.updateAvailableBrands();
      
      expect(filterManager.availableBrands).toEqual(mockBrands);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/shop/products/brands/available?department=electronics')
      );
    });

    test('should fetch filter counts', async () => {
      const mockCounts = {
        subCategories: { laptop: 5, desktop: 3 },
        brands: { Apple: 4, Dell: 6 },
        hotOffers: 8
      };
      
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: mockCounts
        })
      });
      
      filterManager.filters.department = 'electronics';
      filterManager.filters.primaryCategory = 'gadgets-hardware';
      await filterManager.updateFilterCounts();
      
      expect(filterManager.productCounts).toEqual(mockCounts);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/shop/products/filters/counts?department=electronics&primaryCategory=gadgets-hardware')
      );
    });

    test('should handle API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      await filterManager.updateAvailableBrands();
      
      expect(filterManager.availableBrands).toEqual([]);
    });
  });

  describe('event system', () => {
    test('should notify listeners on filter changes', async () => {
      const listener = jest.fn();
      const unsubscribe = filterManager.subscribe(listener);
      
      await filterManager.updateFilter('department', 'electronics');
      
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
    });

    test('should remove listeners when unsubscribed', async () => {
      const listener = jest.fn();
      const unsubscribe = filterManager.subscribe(listener);
      
      unsubscribe();
      
      await filterManager.updateFilter('department', 'electronics');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    test('should generate correct filter parameters for API calls', () => {
      filterManager.filters = {
        department: 'electronics',
        primaryCategory: 'gadgets-hardware',
        subCategories: ['laptop', 'desktop'],
        brands: ['apple', 'dell'],
        priceRange: { min: 100, max: 500 },
        attributes: {
          color: ['red', 'blue'],
          size: ['M', 'L'],
          material: null
        },
        hotOffers: true,
        sort: 'price-hightolow',
        searchQuery: 'test'
      };
      
      const params = filterManager.getFilterParams();
      
      expect(params).toEqual({
        department: 'electronics',
        primaryCategory: 'gadgets-hardware',
        subCategories: 'laptop,desktop',
        brands: 'apple,dell',
        minPrice: 100,
        maxPrice: 500,
        hotOffers: 'true',
        sortBy: 'price-hightolow',
        attributes: JSON.stringify({
          color: ['red', 'blue'],
          size: ['M', 'L']
        })
      });
    });

    test('should clear all filters', async () => {
      // Set some filters
      filterManager.filters.department = 'electronics';
      filterManager.filters.brands = ['apple'];
      filterManager.filters.hotOffers = true;
      
      await filterManager.clearAllFilters();
      
      const state = filterManager.getState();
      expect(state.filters.department).toBe(null);
      expect(state.filters.brands).toEqual([]);
      expect(state.filters.hotOffers).toBe(false);
    });
  });
});