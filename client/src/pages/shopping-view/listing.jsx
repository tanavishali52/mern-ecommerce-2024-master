import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sortOptions } from "@/config";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { AuthDialog } from "@/components/auth/auth-dialog";
import EnhancedProductCard from "@/components/shopping-view/enhanced-product-card";

function ShoppingListing() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  const { productList, isLoading } = useSelector((state) => state.shopProducts);
  
  // Local state
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("price-lowtohigh");
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Get category from URL params
  const categorySearchParam = searchParams.get("category");

  // Initialize filters and fetch products
  useEffect(() => {
    const initialFilters = {};
    
    // Set category filter if present in URL
    if (categorySearchParam) {
      initialFilters.category = [categorySearchParam];
    }
    
    setFilters(initialFilters);
    
    // Fetch products with initial filters
    dispatch(fetchAllFilteredProducts({ 
      filterParams: initialFilters, 
      sortParams: sort 
    }));
  }, [dispatch, categorySearchParam, sort]);

  // Fetch products when filters change
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ 
      filterParams: filters, 
      sortParams: sort 
    }));
  }, [dispatch, filters, sort]);

  const handleSort = (value) => {
    setSort(value);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {categorySearchParam ? (
                      <>Products in {categorySearchParam}</>
                    ) : (
                      'All Products'
                    )}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {isLoading ? (
                      'Loading...'
                    ) : (
                      `${productList?.length || 0} products found`
                    )}
                  </p>
                </div>
                
                {/* Sort Dropdown */}
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 min-w-[140px] justify-between"
                      >
                        <ArrowUpDownIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Sort by</span>
                        <span className="sm:hidden">Sort</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuRadioGroup
                        value={sort}
                        onValueChange={handleSort}
                      >
                        {sortOptions.map((sortItem) => (
                          <DropdownMenuRadioItem
                            value={sortItem.id}
                            key={sortItem.id}
                          >
                            {sortItem.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-4 md:p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
              ) : productList && productList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {productList.map((productItem) => (
                    <EnhancedProductCard
                      key={productItem._id}
                      product={productItem}
                      onAuthRequired={() => setShowAuthDialog(true)}
                    />
                  ))}
                </div>
              ) : (
                // Empty State - Show message but try to fetch all products
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">
                    {categorySearchParam 
                      ? `No products found in ${categorySearchParam} category. Showing all products instead.`
                      : "Loading all available products..."
                    }
                  </p>
                  <Button
                    onClick={() => {
                      setFilters({});
                      dispatch(fetchAllFilteredProducts({ 
                        filterParams: {}, 
                        sortParams: sort 
                      }));
                    }}
                    variant="outline"
                  >
                    Show All Products
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="login"
      />
    </>
  );
}

export default ShoppingListing;