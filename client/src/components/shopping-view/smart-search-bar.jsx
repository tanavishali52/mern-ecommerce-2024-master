import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Search, X, TrendingUp, Tag, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import filterManager from '@/services/FilterManager';

const SmartSearchBar = ({ 
  className = "",
  placeholder = "Search for products, brands, or categories...",
  showSuggestions = true,
  onSearch,
  isMobile = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popularSearches, setPopularSearches] = useState(null);
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch popular searches on mount
  useEffect(() => {
    fetchPopularSearches();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !searchRef.current?.contains(event.target)
      ) {
        setShowSuggestionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length > 1 && showSuggestions) {
      debounceRef.current = setTimeout(() => {
        fetchSearchSuggestions(searchQuery);
      }, 300);
    } else {
      setSuggestions(null);
      setShowSuggestionDropdown(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, showSuggestions]);

  const fetchPopularSearches = async () => {
    try {
      const response = await fetch('/api/shop/search/popular');
      const data = await response.json();
      if (data.success) {
        setPopularSearches(data.data);
      }
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const fetchSearchSuggestions = async (query) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/shop/search?keyword=${encodeURIComponent(query)}&suggestions=true`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data);
        setShowSuggestionDropdown(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      toast({
        title: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }

    try {
      // Apply search filters using FilterManager
      await filterManager.applySearchFilters(query);
      
      // Navigate to search results or call parent handler
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/shop/search?q=${encodeURIComponent(query)}`);
      }
      
      setShowSuggestionDropdown(false);
      
      // Collapse on mobile after search
      if (isMobile) {
        setIsExpanded(false);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSuggestionClick = (suggestion, type = 'product') => {
    if (type === 'product') {
      navigate(`/shop/product/${suggestion._id}`);
    } else if (type === 'brand') {
      setSearchQuery(suggestion);
      handleSearch(suggestion);
    } else if (type === 'category') {
      // Apply category filter and navigate to listing
      filterManager.updateFilter('department', suggestion);
      navigate('/shop/listing');
    }
    setShowSuggestionDropdown(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestionDropdown(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions(null);
    setShowSuggestionDropdown(false);
    searchRef.current?.focus();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  };

  // Mobile collapsed view
  if (isMobile && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleExpanded}
        className="relative"
      >
        <Search className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
          <Input
            ref={searchRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (searchQuery.trim().length > 1) {
                setShowSuggestionDropdown(true);
              }
            }}
            className={`pl-10 pr-20 h-10 ${isMobile ? 'w-full' : 'w-96'} border-gray-300 focus:border-orange-500 focus:ring-orange-500`}
          />
          
          {/* Clear and Search buttons */}
          <div className="absolute right-2 flex items-center gap-1">
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              onClick={() => handleSearch()}
              size="sm"
              className="h-6 bg-orange-600 hover:bg-orange-700 text-white px-2"
            >
              <Search className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionDropdown && (suggestions || popularSearches) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          )}

          {suggestions && !isLoading && (
            <>
              {/* Product Suggestions */}
              {suggestions.products && suggestions.products.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <Package className="h-3 w-3" />
                    Products
                  </div>
                  {suggestions.products.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleSuggestionClick(product, 'product')}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      <img
                        src={product.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.brand}
                          </Badge>
                          <span className="text-sm font-semibold text-orange-600">
                            ${product.salePrice > 0 ? product.salePrice : product.price}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Brand Suggestions */}
              {suggestions.brands && suggestions.brands.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <Tag className="h-3 w-3" />
                    Brands
                  </div>
                  {suggestions.brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleSuggestionClick(brand, 'brand')}
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{brand}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Category Suggestions */}
              {suggestions.categories && suggestions.categories.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <Package className="h-3 w-3" />
                    Categories
                  </div>
                  {suggestions.categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleSuggestionClick(category, 'category')}
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-left capitalize"
                    >
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{category}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Popular Searches (when no suggestions) */}
          {!suggestions && popularSearches && !isLoading && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <TrendingUp className="h-3 w-3" />
                Popular Searches
              </div>
              {popularSearches.trending?.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(term);
                  }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-left"
                >
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900 capitalize">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {suggestions && !isLoading && 
           (!suggestions.products || suggestions.products.length === 0) &&
           (!suggestions.brands || suggestions.brands.length === 0) &&
           (!suggestions.categories || suggestions.categories.length === 0) && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No suggestions found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;