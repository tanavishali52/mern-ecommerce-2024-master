import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Heart, 
  ShoppingCart, 
  Trash2,
  ArrowRight
} from 'lucide-react';
import { getSessionId } from '@/utils/session';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  removeFromWishlist, 
  fetchWishlistItems 
} from '@/store/shop/wishlist-slice';
import { addToCart } from '@/store/shop/cart-slice';

const WishlistSidebar = ({ 
  isOpen, 
  onClose, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);

  const wishlistItemsList = wishlistItems?.items || [];
  const totalItems = wishlistItemsList.length;

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleRemoveItem = async (productId) => {
    setIsLoading(true);
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    try {
      const result = await dispatch(removeFromWishlist({
        userId: effectiveUserId,
        productId
      }));
      
      if (result?.payload?.success) {
        dispatch(fetchWishlistItems(effectiveUserId));
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

  const handleViewWishlist = () => {
    onClose();
    navigate('/shop/wishlist');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/shop/listing');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">Wishlist</h2>
            {totalItems > 0 && (
              <Badge className="bg-red-500">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Wishlist Content */}
        <div className="flex flex-col h-full">
          {wishlistItemsList.length === 0 ? (
            /* Empty Wishlist */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Save items you love to shop them later
              </p>
              <Button
                onClick={handleContinueShopping}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Wishlist Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {wishlistItemsList.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-md cursor-pointer"
                        onClick={() => {
                          navigate(`/shop/product/${item.productId}`);
                          onClose();
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-orange-600"
                        onClick={() => {
                          navigate(`/shop/product/${item.productId}`);
                          onClose();
                        }}
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.brand}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-orange-600">
                          PKR {item.salePrice > 0 ? item.salePrice : item.price}
                        </span>
                        {item.salePrice > 0 && (
                          <span className="text-xs text-gray-500 line-through">
                            PKR {item.price}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          disabled={isLoading || !item.inStock}
                          className="text-xs px-2 py-1 h-6"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Stock Status */}
                      {!item.inStock && (
                        <p className="text-xs text-red-600 mt-1">
                          Out of stock
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="border-t bg-gray-50 p-4 space-y-2">
                <Button
                  onClick={handleViewWishlist}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isLoading}
                >
                  View Full Wishlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleContinueShopping}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistSidebar;