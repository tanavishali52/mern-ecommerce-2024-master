/**
 * URLStateManager - Handles synchronization between filter state and URL parameters
 * Supports bookmarking, sharing, and browser navigation
 */
class URLStateManager {
  constructor() {
    this.listeners = [];
    this.isUpdating = false;
  }

  /**
   * Subscribe to URL state changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of URL state changes
   */
  notifyListeners(state) {
    this.listeners.forEach(callback => callback(state));
  }

  /**
   * Encode filter state to URL parameters
   */
  encodeFiltersToURL(filters) {
    const params = new URLSearchParams();

    // Department
    if (filters.department) {
      params.set('dept', filters.department);
    }

    // Primary Category
    if (filters.primaryCategory) {
      params.set('cat', filters.primaryCategory);
    }

    // Sub-categories
    if (filters.subCategories && filters.subCategories.length > 0) {
      params.set('sub', filters.subCategories.join(','));
    }

    // Brands
    if (filters.brands && filters.brands.length > 0) {
      params.set('brands', filters.brands.join(','));
    }

    // Price Range
    if (filters.priceRange) {
      if (filters.priceRange.min !== null && filters.priceRange.min > 0) {
        params.set('min', filters.priceRange.min.toString());
      }
      if (filters.priceRange.max !== null && filters.priceRange.max < 1000) {
        params.set('max', filters.priceRange.max.toString());
      }
    }

    // Hot Offers
    if (filters.hotOffers) {
      params.set('hot', 'true');
    }

    // Sort
    if (filters.sort && filters.sort !== 'price-lowtohigh') {
      params.set('sort', filters.sort);
    }

    // Search Query
    if (filters.searchQuery) {
      params.set('q', filters.searchQuery);
    }

    // Attributes
    if (filters.attributes) {
      if (filters.attributes.color && filters.attributes.color.length > 0) {
        params.set('colors', filters.attributes.color.join(','));
      }
      if (filters.attributes.size && filters.attributes.size.length > 0) {
        params.set('sizes', filters.attributes.size.join(','));
      }
      if (filters.attributes.material) {
        params.set('material', filters.attributes.material);
      }
    }

    return params.toString();
  }

  /**
   * Decode URL parameters to filter state
   */
  decodeURLToFilters(searchParams) {
    const params = new URLSearchParams(searchParams);
    
    const filters = {
      department: params.get('dept') || null,
      primaryCategory: params.get('cat') || null,
      subCategories: params.get('sub') ? params.get('sub').split(',') : [],
      brands: params.get('brands') ? params.get('brands').split(',') : [],
      priceRange: {
        min: params.get('min') ? parseFloat(params.get('min')) : null,
        max: params.get('max') ? parseFloat(params.get('max')) : null
      },
      hotOffers: params.get('hot') === 'true',
      sort: params.get('sort') || 'price-lowtohigh',
      searchQuery: params.get('q') || '',
      attributes: {
        color: params.get('colors') ? params.get('colors').split(',') : [],
        size: params.get('sizes') ? params.get('sizes').split(',') : [],
        material: params.get('material') || null
      }
    };

    return filters;
  }

  /**
   * Update URL with current filter state
   */
  updateURL(filters, options = {}) {
    if (this.isUpdating) return;

    const { 
      replace = false, 
      preserveOtherParams = false,
      basePath = window.location.pathname 
    } = options;

    try {
      this.isUpdating = true;

      const currentParams = new URLSearchParams(window.location.search);
      let newParams;

      if (preserveOtherParams) {
        // Keep existing non-filter parameters
        newParams = new URLSearchParams();
        for (const [key, value] of currentParams.entries()) {
          if (!this.isFilterParam(key)) {
            newParams.set(key, value);
          }
        }
        
        // Add filter parameters
        const filterParams = new URLSearchParams(this.encodeFiltersToURL(filters));
        for (const [key, value] of filterParams.entries()) {
          newParams.set(key, value);
        }
      } else {
        newParams = new URLSearchParams(this.encodeFiltersToURL(filters));
      }

      const newURL = `${basePath}${newParams.toString() ? '?' + newParams.toString() : ''}`;
      
      if (replace) {
        window.history.replaceState({ filters }, '', newURL);
      } else {
        window.history.pushState({ filters }, '', newURL);
      }

    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Get current filter state from URL
   */
  getCurrentFiltersFromURL() {
    return this.decodeURLToFilters(window.location.search);
  }

  /**
   * Check if a parameter is a filter parameter
   */
  isFilterParam(paramName) {
    const filterParams = [
      'dept', 'cat', 'sub', 'brands', 'min', 'max', 
      'hot', 'sort', 'q', 'colors', 'sizes', 'material'
    ];
    return filterParams.includes(paramName);
  }

  /**
   * Initialize URL state management
   */
  initialize(filterManager) {
    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.filters) {
        // Restore filter state from history
        filterManager.initialize(event.state.filters);
      } else {
        // Parse current URL
        const filtersFromURL = this.getCurrentFiltersFromURL();
        filterManager.initialize(filtersFromURL);
      }
      
      this.notifyListeners(this.getCurrentFiltersFromURL());
    });

    // Subscribe to filter manager changes to update URL
    filterManager.subscribe((state) => {
      if (!this.isUpdating) {
        this.updateURL(state.filters, { replace: false });
      }
    });

    // Initialize with current URL state
    const initialFilters = this.getCurrentFiltersFromURL();
    if (this.hasActiveFilters(initialFilters)) {
      filterManager.initialize(initialFilters);
    }

    return initialFilters;
  }

  /**
   * Check if filters have any active values
   */
  hasActiveFilters(filters) {
    return !!(
      filters.department ||
      filters.primaryCategory ||
      filters.subCategories.length > 0 ||
      filters.brands.length > 0 ||
      filters.priceRange.min !== null ||
      filters.priceRange.max !== null ||
      filters.hotOffers ||
      filters.searchQuery ||
      filters.attributes.color.length > 0 ||
      filters.attributes.size.length > 0 ||
      filters.attributes.material
    );
  }

  /**
   * Generate shareable URL for current filters
   */
  generateShareableURL(filters, baseURL = window.location.origin) {
    const params = this.encodeFiltersToURL(filters);
    const currentPath = window.location.pathname;
    return `${baseURL}${currentPath}${params ? '?' + params : ''}`;
  }

  /**
   * Copy current filter URL to clipboard
   */
  async copyCurrentURL() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  }

  /**
   * Clear all filter parameters from URL
   */
  clearFiltersFromURL(options = {}) {
    const { preserveOtherParams = true } = options;
    
    if (preserveOtherParams) {
      const currentParams = new URLSearchParams(window.location.search);
      const newParams = new URLSearchParams();
      
      // Keep non-filter parameters
      for (const [key, value] of currentParams.entries()) {
        if (!this.isFilterParam(key)) {
          newParams.set(key, value);
        }
      }
      
      const newURL = `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`;
      window.history.replaceState({}, '', newURL);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  /**
   * Get URL-friendly filter summary for SEO
   */
  getFilterSummary(filters) {
    const parts = [];
    
    if (filters.department) {
      parts.push(filters.department);
    }
    
    if (filters.primaryCategory) {
      parts.push(filters.primaryCategory.replace('-', ' '));
    }
    
    if (filters.subCategories.length > 0) {
      parts.push(...filters.subCategories);
    }
    
    if (filters.brands.length > 0) {
      parts.push(...filters.brands);
    }
    
    if (filters.hotOffers) {
      parts.push('hot offers');
    }
    
    if (filters.searchQuery) {
      parts.push(filters.searchQuery);
    }
    
    return parts.join(' ').toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Validate URL parameters
   */
  validateURLParams(searchParams) {
    const params = new URLSearchParams(searchParams);
    const errors = [];
    
    // Validate department
    const dept = params.get('dept');
    if (dept && !['men', 'women', 'electronics', 'lifestyle'].includes(dept)) {
      errors.push(`Invalid department: ${dept}`);
    }
    
    // Validate price range
    const min = params.get('min');
    const max = params.get('max');
    if (min && (isNaN(parseFloat(min)) || parseFloat(min) < 0)) {
      errors.push(`Invalid minimum price: ${min}`);
    }
    if (max && (isNaN(parseFloat(max)) || parseFloat(max) < 0)) {
      errors.push(`Invalid maximum price: ${max}`);
    }
    if (min && max && parseFloat(min) > parseFloat(max)) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
    
    // Validate sort
    const sort = params.get('sort');
    const validSorts = ['price-lowtohigh', 'price-hightolow', 'title-atoz', 'title-ztoa'];
    if (sort && !validSorts.includes(sort)) {
      errors.push(`Invalid sort option: ${sort}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const urlStateManager = new URLStateManager();

export default urlStateManager;