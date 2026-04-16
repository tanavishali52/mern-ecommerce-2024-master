import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import EnhancedReviewDisplay from "./enhanced-review-display";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails, fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "../auth/auth-dialog";
import { openGuestCheckout } from "@/store/shop/guest-checkout-slice";
import { getSessionId } from "@/utils/session";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { productList } = useSelector((state) => state.shopProducts);
  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? (productDetails?.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === (productDetails?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();

    let getCartItems = cartItems.items || [];

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

  function handleBuyNowClick() {
    navigate('/shop/checkout', { 
      state: { 
        selectedProduct: productDetails,
        fromBuyNow: true 
      } 
    });
  }

  function handleRelatedProductClick(product) {
    dispatch(setProductDetails(product));
    setCurrentImageIndex(0);
    setRating(0);
    setReviewMsg("");
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setCurrentImageIndex(0);
  }

  function handleAddReview() {
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
  }

  // Fetch related products based on category or brand
  useEffect(() => {
    if (productDetails && productList) {
      const related = productList
        .filter(product => 
          product._id !== productDetails._id && 
          (product.category === productDetails.category || product.brand === productDetails.brand)
        )
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [productDetails, productList]);

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto backdrop-blur-sm">
          <DialogTitle className="sr-only">Product Details</DialogTitle>
          <DialogDescription className="sr-only">
            View product details, images, and reviews. Add the product to your cart or leave a review.
          </DialogDescription>
          
          <div className="grid lg:grid-cols-2 gap-8 p-6">
            {/* Left Column - Product Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 shadow-lg">
                <img
                  src={productDetails?.images?.[currentImageIndex]?.url || productDetails?.image}
                  alt={productDetails?.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x800/f0f0f0/666666?text=Product+Image";
                  }}
                />
                {(productDetails?.images?.length > 1 || (productDetails?.image && productDetails?.images?.length)) && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full transition-all duration-200 hover:scale-110"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full transition-all duration-200 hover:scale-110"
                      onClick={handleNextImage}
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Navigation */}
              {productDetails?.images?.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {productDetails.images.map((image, index) => (
                    <button
                      key={index}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        currentImageIndex === index 
                          ? 'border-orange-500 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                    >
                      <img
                        src={image.url}
                        alt={`${productDetails?.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/200x200/f0f0f0/666666?text=Image";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Information */}
            <div className="space-y-6">
              {/* 1. Product Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                  {productDetails?.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{productDetails?.category}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{productDetails?.brand}</span>
                </div>
              </div>

              {/* 2. Pricing */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  {productDetails?.salePrice > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-orange-600">
                        PKR {productDetails?.salePrice}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        PKR {productDetails?.price}
                      </span>
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                        {Math.round(((productDetails?.price - productDetails?.salePrice) / productDetails?.price) * 100)}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      PKR {productDetails?.price}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {productDetails?.totalStock > 0 ? (
                    <span className="text-green-600 font-medium">
                      ✓ {productDetails?.totalStock} in stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      ✗ Out of stock
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Action Buttons */}
              <div className="space-y-3">
                {productDetails?.totalStock === 0 ? (
                  <Button 
                    className="w-full h-12 bg-gray-300 hover:bg-gray-300 cursor-not-allowed rounded-lg font-semibold" 
                    disabled
                  >
                    Out of Stock
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleBuyNowClick}
                      className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Buy Now
                    </Button>
                    <Button
                      onClick={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
                      variant="outline"
                      className="w-full h-12 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-all duration-300 hover:shadow-md"
                    >
                      Add to Cart
                    </Button>
                  </div>
                )}
              </div>

              {/* 4. Product Description */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {productDetails?.description}
                </p>
              </div>
            </div>
          </div>

          {/* 5. Reviews Section */}
          <div className="px-6 pb-6 space-y-6 border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            
            {isAuthenticated ? (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
                <div className="flex items-center gap-3">
                  <StarRatingComponent rating={rating} onRatingChange={handleRatingChange} />
                  <span className="text-sm text-gray-600 font-medium">
                    {rating} out of 5 stars
                  </span>
                </div>
                <Input
                  value={reviewMsg}
                  onChange={(e) => setReviewMsg(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === "" || rating === 0}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Submit Review
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-4 text-lg">
                  Please login to share your review
                </p>
                <Button
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold px-8 py-2"
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

          {/* 6. Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleRelatedProductClick(product)}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product?.images?.[0]?.url || product?.image}
                        alt={product?.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x400/f0f0f0/666666?text=Product";
                        }}
                      />
                    </div>
                    <div className="p-3 space-y-2">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
                        {product?.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        {product?.salePrice > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600 font-bold text-sm">
                              PKR {product?.salePrice}
                            </span>
                            <span className="text-gray-400 line-through text-xs">
                              PKR {product?.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-900 font-bold text-sm">
                            PKR {product?.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        defaultTab="login"
      />
    </>
  );
}

export default ProductDetailsDialog;
