import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, TrendingUp, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { AuthDialog } from "@/components/auth/auth-dialog";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import SmartSearchBar from "@/components/shopping-view/smart-search-bar";
import UnifiedFilterSidebar from "@/components/shopping-view/unified-filter-sidebar";
import filterManager from "@/services/FilterManager";

function EnhancedSearchPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const { productDetails } = useSelector((state) => state.shopProducts);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Local state
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filterState, setFilterState] = useState(filterManager.getState());
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to filter manager updates
  useEffect(() => {
    const unsubscribe = filterManager.subscribe((newState) => {
      setFilterState(newState);
      // Perform search when filters change
      if (newState.filters.searchQuery) {
        performSearch(newState.filters.searchQuery, newState.filters);
      }
    });
    return unsubscribe;
  }, []);

  // Initialize search from URL parameters
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      filterManager.applySearchFilters(query);
    } else {
      // Load popular searches if no query
      fetchPopularSearches();
      loadSearchHistory();
    }
  }, [searchParams]);

  // Fetch popular searches
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

  // Load search history from localStorage
  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history.slice(0, 5)); // Keep only last 5 searches
    } catch (error) {
      console.error('Error loading search history:', error);
      setSearchHistory([]);
    }
  };

  // Save search to history
  const saveToSearchHistory = (query) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updatedHistory = [
        query,
        ...history.filter(item => item !== query)
      ].slice(0, 10); // Keep only last 10 searches
      
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory.slice(0, 5));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Clear search history
  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  // Perform search with filters
  const performSearch = async (query, filters = {}, page = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setPagination({});
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('keyword', query);
      params.append('page', page.toString());
      params.append('limit', '20');

      // Add filter parameters if any
      if (filters.department) params.append('department', filters.department);
      if (filters.primaryCategory) params.append('primaryCategory', filters.primaryCategory);
      if (filters.subCategories?.length > 0) params.append('subCategories', filters.subCategories.join(','));
      if (filters.brands?.length > 0) params.append('brands', filters.brands.join(','));
      if (filters.hotOffers) params.append('hotOffers', 'true');
      if (filters.sort) params.append('sortBy', filters.sort);
      if (filters.priceRange?.min !== null) params.append('minPrice', filters.priceRange.min);
      if (filters.priceRange?.max !== null) params.append('maxPrice', filters.priceRange.max);

      const response = await fetch(`/api/shop/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setPagination(data.pagination || {});
        
        // Save successful search to history
        saveToSearchHistory(query);
        
        // Apply suggested filters if any
        if (data.filterSuggestions && Object.keys(data.filterSuggestions).length > 0) {
          // Auto-apply suggested filters
          const suggestions = data.filterSuggestions;
          if (suggestions.departments?.length > 0) {
            await filterManager.updateFilter('department', suggestions.departments[0]);
          }
          if (suggestions.categories?.length > 0) {
            // Find the category info and apply appropriate filters
            // This would need category mapping logic
          }
        }
      } else {
        console.error('Search failed:', data.message);
        setSearchResults([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults([]);
      setPagination({});
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    navigate(`/shop/search?${newParams.toString()}`, { replace: true });
    
    // Apply search filters
    await filterManager.applySearchFilters(query);
  };

  const handleGetProductDetails = (productId) => {
    dispatch(fetchProductDetails(productId));
  };

  const clearAllFilters = async () => {
    await filterManager.clearAllFilters();
    if (searchQuery) {
      performSearch(searchQuery, {});
    }
  };

  const getActiveFilterCount = () => {
    const { filters } = filterState;
    let count = 0;
    
    if (filters.department) count++;
    if (filters.primaryCategory) count++;
    if (filters.subCategories?.length > 0) count += filters.subCategories.length;
    if (filters.brands?.length > 0) count += filters.brands.length;
    if (filters.hotOffers) count++;
    if (filters.priceRange?.min !== null || filters.priceRange?.max !== null) count++;
    if (filters.attributes?.color?.length > 0) count += filters.attributes.color.length;
    if (filters.attributes?.size?.length > 0) count += filters.attributes.size.length;
    
    return count;
  };

  // Handle product details dialog
  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <SmartSearchBar
                placeholder="Search for products, brands, or categories..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        {searchQuery && (
          <div className="md:hidden bg-white border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-gray-700"
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">Refine Search</span>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
              
              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-4 md:py-6">
          {!searchQuery ? (
            /* No Search Query - Show Suggestions */
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Recent Searches</h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearchHistory}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {searchHistory.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(query)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md text-left transition-colors"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Popular Searches</h2>
                  </div>
                  <div className="space-y-3">
                    {/* Trending Terms */}
                    {popularSearches.trending?.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(term)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md text-left transition-colors"
                      >
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-700 capitalize">{term}</span>
                      </button>
                    ))}
                    
                    {/* Popular Brands */}
                    {popularSearches.brands?.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Popular Brands
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.brands.map((brand, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-orange-50 hover:border-orange-300"
                              onClick={() => handleSearch(brand)}
                            >
                              {brand}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Popular Categories */}
                    {popularSearches.categories?.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Popular Categories
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.categories.map((category, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 capitalize"
                              onClick={() => handleSearch(category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-4 md:gap-6 lg:gap-8">
              
              {/* Desktop Filter Sidebar */}
              <div className="hidden md:block">
                <div className="sticky top-24">
                  <UnifiedFilterSidebar />
                </div>
              </div>

              {/* Search Results */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Results Header */}
                <div className="p-4 md:p-6 border-b">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                        Search Results for "{searchQuery}"
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        {isLoading ? (
                          'Searching...'
                        ) : (
                          `${pagination.totalResults || searchResults.length || 0} results found`
                        )}
                      </p>
                    </div>

                    {/* Active Filters Display */}
                    {getActiveFilterCount() > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {filterState.filters.department && (
                          <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                            <span>{filterState.filters.department}</span>
                            <button
                              onClick={() => filterManager.updateFilter('department', null)}
                              className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        
                        {filterState.filters.hotOffers && (
                          <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            <span>Hot Offers</span>
                            <button
                              onClick={() => filterManager.updateFilter('hotOffers', false)}
                              className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Grid */}
                <div className="p-4 md:p-6">
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {[...Array(8)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {searchResults.map((productItem) => (
                          <ShoppingProductTile
                            key={productItem._id}
                            handleGetProductDetails={handleGetProductDetails}
                            product={productItem}
                          />
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!pagination.hasPrevPage}
                              onClick={() => performSearch(searchQuery, filterState.filters, pagination.currentPage - 1)}
                            >
                              Previous
                            </Button>
                            
                            <span className="text-sm text-gray-600 px-4">
                              Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!pagination.hasNextPage}
                              onClick={() => performSearch(searchQuery, filterState.filters, pagination.currentPage + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* No Results */
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-500 mb-4">
                        We couldn't find any products matching "{searchQuery}"
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Try:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Checking your spelling</li>
                          <li>• Using different keywords</li>
                          <li>• Searching for more general terms</li>
                        </ul>
                      </div>
                      {getActiveFilterCount() > 0 && (
                        <Button
                          onClick={clearAllFilters}
                          variant="outline"
                          className="mt-4"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl">
              <UnifiedFilterSidebar 
                isMobile={true}
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          </div>
        )}
      </div>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
      
      <AuthDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="login"
      />
    </>
  );
}

export default EnhancedSearchPage;