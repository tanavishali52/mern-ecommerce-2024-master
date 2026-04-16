import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Import sections
// Note: Anon design components will be created as tasks are implemented

// Import existing components
import Banner from '@/components/shopping-view/banner';
import ShoppingProductTile from '@/components/shopping-view/product-tile';
import { AuthDialog } from '@/components/auth/auth-dialog';

// Import actions
import {
  fetchAllFilteredProducts,
} from '@/store/shop/products-slice';
import { addToCart, fetchCartItems } from '@/store/shop/cart-slice';
import { getFeatureImages } from '@/store/common-slice';
import { getSessionId } from '@/utils/session';

const AnonHomePage = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { productList } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleGetProductDetails(getCurrentProductId) {
    // Navigate to product detail page instead of opening modal
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();

    let getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: effectiveUserId,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(effectiveUserId));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  // Get featured products (first 8 products)
  const featuredProducts = productList?.slice(0, 8) || [];

  // Get new arrivals (next 4 products)
  const newArrivals = productList?.slice(8, 12) || [];

  // Get trending products (next 4 products)
  const trendingProducts = productList?.slice(12, 16) || [];

  return (
    <div className="anon-home-page">
      {/* Hero Banner Section */}
      <Banner featureImages={featureImageList} />

      {/* Main Product Container */}
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4">

          {/* Featured Products Grid */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Featured Products</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                  />
                ))
              ) : (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Dialogs */}
      <AuthDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="login"
      />
    </div>
  );
};

export default AnonHomePage;