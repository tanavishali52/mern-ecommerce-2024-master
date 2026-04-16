import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Star,
  ArrowLeft,
  Package
} from 'lucide-react';
import { getSessionId } from '@/utils/session';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchWishlistItems, 
  removeFromWishlist,
  clearWishlist 
} from '@/store/shop/wishlist-slice';
import { addToCart } from '@/store/shop/cart-slice';

const WishlistPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistItems, isLoading: wishlistLoading } = useSelector((state) => state.shopWishlist);

  const wishlistItemsList = wishlistItems?.items || [];

  // Fetch wishlist items on mount
  useEffect(() => {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    if (effectiveUserId) {
      dispatch(fetchWishlistItems(effectiveUserId));
    }
  }, [isAuthenticated, user?.id, dispatch]);

  const handleRemoveFromWishlist = async (productId) => {
    setIsLoading(true);
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    try {
      const result = await dispatch(removeFromWishlist({
        userId: effectiveUserId,
        productId
      }));
      
      if (result?.payload?.success) {
        toast({
          title: "Item removed",
          description: "Item has been removed from your wishlist"
        });
      }
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "Failed to remove item from wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    setIsLoading(true);
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    try {
      const result = await dispatch(addToCart({
        userId: effectiveUserId,
        productId: item.productId,
        quantity: 1
      }));
      
      if (result?.payload?.success) {
        toast({
          title: "Added to cart",
          description: `${item.title} has been added to your cart`
        });
      }
    } catch (error) {
      toast({
        title: "Add to cart failed",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearWishlist = async () => {
    if (wishlistItemsList.length === 0) return;
    
    setIsLoading(true);
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    try {
      const result = await dispatch(clearWishlist(effectiveUserId));
      
      if (result?.payload?.success) {
        toast({
          title: "Wishlist cleared",
          description: "All items have been removed from your wishlist"
        });
      }
    } catch (error) {
      toast({
        title: "Clear failed",
        description: "Failed to clear wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/shop/product/${productId}`);
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlistItemsList.length} {wishlistItemsList.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {wishlistItemsList.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearWishlist}
            disabled={isLoading || wishlistLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Loading State */}
      {wishlistLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading your wishlist...</span>
        </div>
      )}

      {/* Empty Wishlist */}
      {!wishlistLoading && wishlistItemsList.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-600 mb-6">
            Save items you love to your wishlist and shop them later
          </p>
          <Button
            onClick={() => navigate('/shop/listing')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Package className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </div>
      )}

      {/* Wishlist Items Grid */}
      {!wishlistLoading && wishlistItemsList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItemsList.map((item) => (
            <WishlistItemCard
              key={item.productId}
              item={item}
              onRemove={() => handleRemoveFromWishlist(item.productId)}
              onAddToCart={() => handleAddToCart(item)}
              onProductClick={() => handleProductClick(item.productId)}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Wishlist Item Card Component
const WishlistItemCard = ({ 
  item, 
  onRemove, 
  onAddToCart, 
  onProductClick, 
  isLoading 
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={imageError ? 'https://via.placeholder.com/400x400/f0f0f0/666666?text=Product' : (item.image || 'https://via.placeholder.com/400x400/f0f0f0/666666?text=Product')}
          alt={item.title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={onProductClick}
          onError={() => setImageError(true)}
        />
        
        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={isLoading}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700 rounded-full"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Sale Badge */}
        {item.salePrice > 0 && item.salePrice < item.price && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            Sale
          </Badge>
        )}

        {/* Stock Status */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-white text-gray-900">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="mb-2">
          <h3 
            className="font-medium text-gray-900 line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors"
            onClick={onProductClick}
          >
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
        </div>

        {/* Rating */}
        {item.averageRating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(item.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({item.averageRating})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-semibold text-orange-600">
            PKR {item.salePrice > 0 ? item.salePrice : item.price}
          </span>
          {item.salePrice > 0 && (
            <span className="text-sm text-gray-500 line-through">
              PKR {item.price}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={onAddToCart}
          disabled={isLoading || !item.inStock}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {item.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>

        {/* Date Added */}
        {item.dateAdded && (
          <p className="text-xs text-gray-400 mt-2">
            Added {new Date(item.dateAdded).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;