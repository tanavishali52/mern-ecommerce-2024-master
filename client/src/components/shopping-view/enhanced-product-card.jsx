import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { addToCart, fetchCartItems } from '@/store/shop/cart-slice';
import { addToWishlist, fetchWishlistItems } from '@/store/shop/wishlist-slice';
import { getSessionId } from '@/utils/session';

const EnhancedProductCard = ({ product, onAuthRequired }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { cartItems } = useSelector((state) => state.shopCart);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleImageNavigation = (direction) => {
    if (!product?.images?.length) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    // Guests can add to cart
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();

    let getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === product?._id
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > product?.totalStock) {
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
        productId: product?._id,
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

  const handleBuyNow = (e) => {
    e.stopPropagation();
    
    // Allow guest Buy Now
    navigate('/shop/checkout', { 
      state: { 
        selectedProduct: product,
        fromBuyNow: true 
      } 
    });
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/shop/product/${product?._id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: `Check out this product: ${product?.title}`,
        url: productUrl,
      }).catch((error) => {
        console.log('Error sharing:', error);
        copyToClipboard(productUrl);
      });
    } else {
      copyToClipboard(productUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Product link copied!",
        description: "The product link has been copied to your clipboard.",
        duration: 3000,
      });
    }).catch(() => {
      toast({
        title: "Copy this link to share:",
        description: url,
        duration: 5000,
      });
    });
  };

  const handleCardClick = () => {
    navigate(`/shop/product/${product._id}`);
  };

  const averageReview = product?.averageReview || 4.5;

  return (
    <Card className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
      <div onClick={handleCardClick} className="cursor-pointer">
        {/* Product Images */}
        <div className="relative">
          <div className="aspect-square bg-gray-50">
            <img
              src={product?.images?.[currentImageIndex]?.url || '/placeholder-image.jpg'}
              alt={product?.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/95 hover:bg-orange-50 rounded-full shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 w-8 h-8 border border-gray-200 hover:border-orange-300 z-10"
              onClick={handleShareClick}
            >
              <ShareIcon className="h-4 w-4 text-gray-600 hover:text-orange-600 transition-colors" />
            </Button>

            {/* Image Navigation */}
            {product?.images?.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 w-8 h-8 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageNavigation('prev');
                  }}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 w-8 h-8 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageNavigation('next');
                  }}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image Indicators */}
            {product?.images?.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentImageIndex === index ? 'bg-white scale-110 shadow-md' : 'bg-white/60 hover:bg-white/80'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Stock/Sale Badges */}
            {product?.totalStock === 0 ? (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white font-medium px-2 py-1 text-xs">
                Out Of Stock
              </Badge>
            ) : product?.totalStock < 10 ? (
              <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-2 py-1 text-xs">
                Only {product?.totalStock} left
              </Badge>
            ) : product?.salePrice > 0 ? (
              <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600 text-white font-medium px-2 py-1 text-xs">
                Sale
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 hover:text-orange-600 transition-colors">
              {product?.title}
            </h2>
          </div>

          {/* Review Stars */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageReview)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              ({averageReview.toFixed(1)})
            </span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {product?.salePrice > 0 ? (
                <>
                  <span className="text-xl font-bold text-orange-600">
                    PKR {product?.salePrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    PKR {product?.price}
                  </span>
                  <Badge className="bg-red-100 text-red-800 font-semibold text-xs">
                    {Math.round(((product?.price - product?.salePrice) / product?.price) * 100)}% OFF
                  </Badge>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  PKR {product?.price}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                product?.totalStock > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-600 font-medium">
                {product?.totalStock > 0 
                  ? `${product.totalStock} in stock` 
                  : 'Out of stock'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-2 border-gray-300 hover:border-orange-500 flex-shrink-0"
            aria-label="Add to Wishlist"
            onClick={(e) => {
              e.stopPropagation();
              const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
              dispatch(addToWishlist({ userId: effectiveUserId, productId: product?._id }))
                .then((res) => {
                  if (res.payload?.success) {
                    toast({ title: "Added to wishlist" });
                    dispatch(fetchWishlistItems(effectiveUserId));
                  }
                });
            }}
          >
            <HeartIcon className={`w-4 h-4 ${wishlistItems?.items?.some(i => i.productId === product?._id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={product?.totalStock === 0}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold h-10"
          >
            Buy Now
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product?.totalStock === 0}
          variant="outline"
          className="w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold h-10"
        >
          <ShoppingCartIcon className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default EnhancedProductCard;