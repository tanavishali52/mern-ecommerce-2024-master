import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon, ShoppingCartIcon, HeartIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, ShareIcon } from 'lucide-react';
import { fetchProductDetails, setProductDetails, fetchAllFilteredProducts } from '@/store/shop/products-slice';
import { addToCart, fetchCartItems } from '@/store/shop/cart-slice';
import { addToWishlist, fetchWishlistItems } from '@/store/shop/wishlist-slice';
import { getSessionId } from '@/utils/session';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { getReviews, addReview } from '@/store/shop/review-slice';
import StarRatingComponent from '@/components/common/star-rating';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ShoppingProductTile from '@/components/shopping-view/product-tile';
import EnhancedReviewDisplay from '@/components/shopping-view/enhanced-review-display';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { productDetails, isLoading, productList } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { reviews } = useSelector((state) => state.shopReview);

  // Fetch product details when component mounts
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(setProductDetails(null));
    };
  }, [dispatch, productId]);

  // Fetch reviews and wishlist when product details are loaded
  useEffect(() => {
    if (productDetails?._id) {
      dispatch(getReviews(productDetails._id));
      const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
      if (effectiveUserId) {
        dispatch(fetchWishlistItems(effectiveUserId));
      }
    }
  }, [productDetails, dispatch, isAuthenticated, user?.id]);

  // Fetch related products based on category
  useEffect(() => {
    if (productDetails?.category) {
      dispatch(fetchAllFilteredProducts({
        filterParams: { category: [productDetails.category] },
        sortParams: 'price-lowtohigh'
      }));
    }
  }, [productDetails, dispatch]);

  // Set related products from productList
  useEffect(() => {
    if (productDetails && productList) {
      const related = productList
        .filter(product => 
          product._id !== productDetails._id && 
          product.category === productDetails.category
        )
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [productDetails, productList]);

  const handleAddToCart = () => {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();

    let getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === productDetails?._id
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > productDetails?.totalStock) {
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
        productId: productDetails?._id,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(effectiveUserId));
        toast({
          title: "Product added to cart successfully!",
        });
      }
    });
  };

  const handleAddToWishlist = () => {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    dispatch(addToWishlist({ 
      userId: effectiveUserId, 
      productId: productDetails?._id 
    })).then((res) => {
      if (res.payload?.success) {
        toast({ title: "Added to wishlist" });
        dispatch(fetchWishlistItems(effectiveUserId));
      }
    });
  };

  const handleBuyNow = () => {
    navigate('/shop/checkout', {
      state: {
        selectedProduct: productDetails,
        fromBuyNow: true
      }
    });
  };

  const handleImageNavigation = (direction) => {
    if (!productDetails?.images?.length) return;

    if (direction === 'prev') {
      setCurrentImageIndex(prev =>
        prev === 0 ? productDetails.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev =>
        prev === productDetails.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleShareClick = () => {
    const productUrl = `${window.location.origin}/shop/product/${productDetails?._id}`;

    if (navigator.share) {
      // Use native share API if available
      navigator.share({
        title: productDetails?.title,
        text: `Check out this product: ${productDetails?.title}`,
        url: productUrl,
      }).catch((error) => {
        console.log('Error sharing:', error);
        // If native share fails, show copy option
        copyToClipboard(productUrl);
      });
    } else {
      // Always show copy option for desktop/browsers without native share
      copyToClipboard(productUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Product link copied!",
        description: "The product link has been copied to your clipboard. You can now paste and share it anywhere!",
        duration: 3000,
      });
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      toast({
        title: "Copy this link to share:",
        description: url,
        duration: 5000,
      });
    });
  };

  const handleBackClick = () => {
    // Try to go back, but if there's no history, redirect to home
    try {
      // Check if we can go back by using a flag
      const canGoBack = window.history.state !== null || document.referrer !== '';

      if (canGoBack) {
        navigate(-1);
      } else {
        // If no referrer and no state, likely opened in new tab
        navigate('/shop/home');
      }
    } catch (error) {
      // Fallback to home page
      navigate('/shop/home');
    }
  };

  const handleAddReview = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button onClick={() => navigate('/shop/home')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const averageReview = productDetails?.averageReview || 4.5;

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back and Share buttons */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="bg-white hover:bg-orange-50 rounded-full shadow-md border border-gray-200 hover:border-orange-300 w-10 h-10"
              onClick={handleShareClick}
            >
              <ShareIcon className="h-5 w-5 text-gray-600 hover:text-orange-600 transition-colors" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto max-w-7xl px-4 py-6">
        
        {/* Desktop Layout: Image + Product Info Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          
          {/* Product Images Section */}
          <div className="relative">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={productDetails?.images?.[currentImageIndex]?.url || '/placeholder-image.jpg'}
                alt={productDetails?.title}
                className="w-full h-full object-cover"
              />

              {/* Image navigation */}
              {productDetails?.images?.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow-lg w-12 h-12"
                    onClick={() => handleImageNavigation('prev')}
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow-lg w-12 h-12"
                    onClick={() => handleImageNavigation('next')}
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image indicators */}
              {productDetails?.images?.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {productDetails.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/60'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6 lg:space-y-8">
            
            {/* Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {productDetails?.title}
              </h1>
            </div>

            {/* Review Stars */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(averageReview)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 font-medium">
                ({averageReview.toFixed(1)}) • {reviews?.length || 0} reviews
              </span>
            </div>

            {/* Price */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {productDetails?.salePrice > 0 ? (
                  <>
                    <span className="text-4xl lg:text-5xl font-bold text-orange-600">
                      {productDetails?.salePrice}
                    </span>
                    <span className="text-2xl text-gray-500 line-through">
                      {productDetails?.price}
                    </span>
                    <Badge className="bg-red-100 text-red-800 font-semibold text-sm px-3 py-1">
                      {Math.round(((productDetails?.price - productDetails?.salePrice) / productDetails?.price) * 100)}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                    {productDetails?.price}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${productDetails?.totalStock > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                <span className="text-base text-gray-600 font-medium">
                  {productDetails?.totalStock > 0
                    ? `${productDetails.totalStock} in stock`
                    : 'Out of stock'
                  }
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 border-2 border-gray-300 hover:border-orange-500 flex-shrink-0"
                  aria-label="Add to Wishlist"
                  onClick={handleAddToWishlist}
                >
                  <HeartIcon className={`w-6 h-6 ${wishlistItems?.items?.some(i => i.productId === productDetails?._id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={productDetails?.totalStock === 0}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold h-14 text-lg"
                  size="lg"
                >
                  Buy Now
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={productDetails?.totalStock === 0}
                variant="outline"
                className="w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold h-14 text-lg"
                size="lg"
              >
                <ShoppingCartIcon className="w-6 h-6 mr-3" />
                Add to Cart
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {productDetails?.description}
              </p>

              {/* Category and Brand */}
              <div className="flex gap-3 pt-3">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1">
                  {productDetails?.category}
                </Badge>
                <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 px-3 py-1">
                  {productDetails?.brand}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(averageReview)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {averageReview.toFixed(1)} out of 5 ({reviews?.length || 0} reviews)
              </span>
            </div>
          </div>

          {/* Add Review Form */}
          {isAuthenticated ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Write a Review</h3>
              <div className="flex items-center gap-3">
                <StarRatingComponent rating={rating} onRatingChange={setRating} />
                <span className="text-sm text-gray-600 font-medium">
                  {rating} out of 5 stars
                </span>
              </div>
              <Input
                value={reviewMsg}
                onChange={(e) => setReviewMsg(e.target.value)}
                placeholder="Share your experience with this product..."
                className="rounded-lg"
              />
              <Button
                onClick={handleAddReview}
                disabled={reviewMsg.trim() === "" || rating === 0}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold w-full"
              >
                Submit Review
              </Button>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                Please login to share your review
              </p>
              <Button
                onClick={() => setShowAuthDialog(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
              >
                Login to Review
              </Button>
            </div>
          )}

          {/* Enhanced Review Display */}
          <EnhancedReviewDisplay 
            reviews={reviews || []}
            productId={productDetails?._id}
            showPagination={true}
            itemsPerPage={5}
            showFilters={true}
          />
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ShoppingProductTile
                  key={product._id}
                  product={product}
                  handleGetProductDetails={(productId) => navigate(`/shop/product/${productId}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="login"
      />
    </div>
  );
};

export default ProductDetailsPage;