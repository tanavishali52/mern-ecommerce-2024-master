import { categoryUtils } from '@/config/category-hierarchy';

/**
 * FilterManager - Centralized service for managing product filtering state and operations
 */
class FilterManager {
  constructor() {
    this.filters = {
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
    };
    
    this.availableBrands = [];
    this.productCounts = {};
    this.isLoading = false;
    
    // Event listeners for filter changes
    this.listeners = [];
  }

  /**
   * Subscribe to filter changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of filter changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  /**
   * Get current filter state
   */
  getState() {
    return {
      filters: { ...this.filters },
      availableBrands: [...this.availableBrands],
      productCounts: { ...this.productCounts },
      isLoading: this.isLoading
    };
  }

  /**
   * Update a specific filter and trigger related updates
   */
  async updateFilter(filterType, value, isAdd = true) {
    const previousFilters = { ...this.filters };
    
    try {
      this.isLoading = true;
      this.notifyListeners();

      switch (filterType) {
        case 'department':
          this.filters.department = value;
          // Reset dependent filters when department changes
          this.filters.primaryCategory = null;
          this.filters.subCategories = [];
          this.filters.brands = [];
          break;

        case 'primaryCategory':
          this.filters.primaryCategory = value;
          // Reset sub-categories and brands when primary category changes
          this.filters.subCategories = [];
          this.filters.brands = [];
          break;

        case 'subCategories':
          if (isAdd) {
            if (!this.filters.subCategories.includes(value)) {
              this.filters.subCategories.push(value);
            }
          } else {
            this.filters.subCategories = this.filters.subCategories.filter(cat => cat !== value);
          }
          // Reset brands when sub-categories change
          this.filters.brands = [];
          break;

        case 'brands':
          if (isAdd) {
            if (!this.filters.brands.includes(value)) {
              this.filters.brands.push(value);
            }
          } else {
            this.filters.brands = this.filters.brands.filter(brand => brand !== value);
          }
          break;

        case 'priceRange':
          this.filters.priceRange = { ...this.filters.priceRange, ...value };
          break;

        case 'attributes':
          if (value.type && value.values) {
            if (isAdd) {
              this.filters.attributes[value.type] = [
                ...new Set([...this.filters.attributes[value.type], ...value.values])
              ];
            } else {
              this.filters.attributes[value.type] = this.filters.attributes[value.type]
                .filter(attr => !value.values.includes(attr));
            }
          }
          break;

        case 'hotOffers':
          this.filters.hotOffers = value;
          break;

        case 'sort':
          this.filters.sort = value;
          break;

        case 'searchQuery':
          this.filters.searchQuery = value;
          break;

        default:
          console.warn(`Unknown filter type: ${filterType}`);
          return;
      }

      // Update available brands and counts after filter change
      await Promise.all([
        this.updateAvailableBrands(),
        this.updateFilterCounts()
      ]);

    } catch (error) {
      console.error('Error updating filter:', error);
      // Revert to previous state on error
      this.filters = previousFilters;
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Get brands available for current category selection
   */
  async updateAvailableBrands() {
    try {
      const params = new URLSearchParams();
      
      if (this.filters.department) {
        params.append('department', this.filters.department);
      }
      
      if (this.filters.primaryCategory) {
        params.append('primaryCategory', this.filters.primaryCategory);
      }
      
      if (this.filters.subCategories.length > 0) {
        params.append('subCategories', this.filters.subCategories.join(','));
      }

      const response = await fetch(`/api/shop/products/brands/available?${params}`);
      const data = await response.json();
      
      if (data.success) {
        this.availableBrands = data.data;
      } else {
        console.error('Failed to fetch available brands:', data.message);
        this.availableBrands = [];
      }
    } catch (error) {
      console.error('Error fetching available brands:', error);
      this.availableBrands = [];
    }
  }

  /**
   * Get product counts for each filter option
   */
  async updateFilterCounts() {
    try {
      const params = new URLSearchParams();
      
      if (this.filters.department) {
        params.append('department', this.filters.department);
      }
      
      if (this.filters.primaryCategory) {
        params.append('primaryCategory', this.filters.primaryCategory);
      }
      
      if (this.filters.subCategories.length > 0) {
        params.append('subCategories', this.filters.subCategories.join(','));
      }
      
      if (this.filters.brands.length > 0) {
        params.append('brands', this.filters.brands.join(','));
      }
      
      if (this.filters.hotOffers) {
        params.append('hotOffers', 'true');
      }
      
      if (this.filters.priceRange.min !== null) {
        params.append('minPrice', this.filters.priceRange.min.toString());
      }
      
      if (this.filters.priceRange.max !== null) {
        params.append('maxPrice', this.filters.priceRange.max.toString());
      }

      const response = await fetch(`/api/shop/products/filters/counts?${params}`);
      const data = await response.json();
      
      if (data.success) {
        this.productCounts = data.data;
      } else {
        console.error('Failed to fetch filter counts:', data.message);
        this.productCounts = {};
      }
    } catch (error) {
      console.error('Error fetching filter counts:', error);
      this.productCounts = {};
    }
  }

  /**
   * Apply search-based filters automatically
   */
  async applySearchFilters(searchTerms) {
    const searchQuery = searchTerms.toLowerCase().trim();
    
    if (!searchQuery) {
      await this.updateFilter('searchQuery', '');
      return;
    }

    // Update search query
    await this.updateFilter('searchQuery', searchQuery);

    // Parse search terms for automatic filter application
    const detectedFilters = this.parseSearchTerms(searchQuery);
    
    // Apply detected filters
    for (const [filterType, value] of Object.entries(detectedFilters)) {
      if (value !== null && value !== undefined) {
        await this.updateFilter(filterType, value);
      }
    }
  }

  /**
   * Parse search terms to detect categories and attributes
   */
  parseSearchTerms(searchQuery) {
    const detectedFilters = {};
    const words = searchQuery.split(' ').map(word => word.toLowerCase());
    
    // Check for department keywords
    for (const [dept, keywords] of Object.entries(this.getDepartmentKeywords())) {
      if (keywords.some(keyword => words.includes(keyword))) {
        detectedFilters.department = dept;
        break;
      }
    }
    
    // Check for sub-category keywords
    const subCategoryKeywords = this.getSubCategoryKeywords();
    for (const [subCat, keywords] of Object.entries(subCategoryKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        // Find the appropriate department and primary category for this sub-category
        const categoryInfo = this.findCategoryForSubCategory(subCat);
        if (categoryInfo) {
          detectedFilters.department = categoryInfo.department;
          detectedFilters.primaryCategory = categoryInfo.primaryCategory;
          detectedFilters.subCategories = [subCat];
        }
        break;
      }
    }
    
    // Check for color attributes
    const colorKeywords = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey'];
    const detectedColors = words.filter(word => colorKeywords.includes(word));
    if (detectedColors.length > 0) {
      detectedFilters.attributes = { type: 'color', values: detectedColors };
    }
    
    return detectedFilters;
  }

  /**
   * Find department and primary category for a given sub-category
   */
  findCategoryForSubCategory(subCategoryId) {
    const allSubCategories = categoryUtils.getAllSubCategories();
    return allSubCategories.find(subCat => subCat.id === subCategoryId);
  }

  /**
   * Get department keywords for search parsing
   */
  getDepartmentKeywords() {
    return {
      men: ['men', "men's", 'male', 'gentleman', 'guy'],
      women: ['women', "women's", 'female', 'lady', 'girl'],
      electronics: ['electronics', 'tech', 'gadget', 'device', 'computer', 'phone'],
      lifestyle: ['lifestyle', 'accessories', 'jewelry', 'perfume']
    };
  }

  /**
   * Get sub-category keywords for search parsing
   */
  getSubCategoryKeywords() {
    return {
      formal: ['formal', 'dress', 'suit', 'business', 'office', 'professional'],
      casual: ['casual', 'everyday', 'relaxed', 'comfortable', 'informal'],
      sports: ['sports', 'athletic', 'gym', 'workout', 'fitness', 'active'],
      jacket: ['jacket', 'coat', 'blazer', 'outerwear'],
      sunglasses: ['sunglasses', 'shades', 'eyewear'],
      perfume: ['perfume', 'fragrance', 'scent', 'cologne'],
      cosmetics: ['cosmetics', 'makeup', 'beauty', 'lipstick', 'foundation'],
      bags: ['bag', 'handbag', 'purse', 'tote', 'clutch', 'backpack'],
      desktop: ['desktop', 'pc', 'computer', 'workstation'],
      laptop: ['laptop', 'notebook', 'portable computer'],
      camera: ['camera', 'photography', 'photo', 'dslr'],
      tablet: ['tablet', 'ipad', 'tab'],
      headphone: ['headphone', 'headset', 'earphone', 'audio'],
      'smart-watch': ['smartwatch', 'smart watch', 'wearable', 'fitness tracker'],
      'smart-tv': ['smart tv', 'television', 'tv', 'monitor'],
      keyboard: ['keyboard', 'typing', 'mechanical'],
      mouse: ['mouse', 'pointer', 'click'],
      microphone: ['microphone', 'mic', 'recording', 'audio'],
      jewelry: ['jewelry', 'jewellery', 'ring', 'necklace', 'bracelet', 'earring']
    };
  }

  /**
   * Clear all filters
   */
  async clearAllFilters() {
    this.filters = {
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
    };
    
    await Promise.all([
      this.updateAvailableBrands(),
      this.updateFilterCounts()
    ]);
    
    this.notifyListeners();
  }

  /**
   * Get filter parameters for API calls
   */
  getFilterParams() {
    const params = {};
    
    if (this.filters.department) {
      params.department = this.filters.department;
    }
    
    if (this.filters.primaryCategory) {
      params.primaryCategory = this.filters.primaryCategory;
    }
    
    if (this.filters.subCategories.length > 0) {
      params.subCategories = this.filters.subCategories.join(',');
    }
    
    if (this.filters.brands.length > 0) {
      params.brands = this.filters.brands.join(',');
    }
    
    if (this.filters.priceRange.min !== null) {
      params.minPrice = this.filters.priceRange.min;
    }
    
    if (this.filters.priceRange.max !== null) {
      params.maxPrice = this.filters.priceRange.max;
    }
    
    if (this.filters.hotOffers) {
      params.hotOffers = 'true';
    }
    
    if (this.filters.sort) {
      params.sortBy = this.filters.sort;
    }
    
    // Include attributes if any are set
    const activeAttributes = {};
    if (this.filters.attributes.color.length > 0) {
      activeAttributes.color = this.filters.attributes.color;
    }
    if (this.filters.attributes.size.length > 0) {
      activeAttributes.size = this.filters.attributes.size;
    }
    if (this.filters.attributes.material) {
      activeAttributes.material = this.filters.attributes.material;
    }
    
    if (Object.keys(activeAttributes).length > 0) {
      params.attributes = JSON.stringify(activeAttributes);
    }
    
    return params;
  }

  /**
   * Initialize filter manager with initial state
   */
  async initialize(initialFilters = {}) {
    this.filters = { ...this.filters, ...initialFilters };
    
    await Promise.all([
      this.updateAvailableBrands(),
      this.updateFilterCounts()
    ]);
    
    this.notifyListeners();
  }
}

// Create singleton instance
const filterManager = new FilterManager();

export default filterManager;