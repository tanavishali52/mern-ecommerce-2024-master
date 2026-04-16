import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Trash2,
  ArrowRight
} from 'lucide-react';
import { getSessionId } from '@/utils/session';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  updateCartQuantity, 
  deleteCartItem, 
  fetchCartItems 
} from '@/store/shop/cart-slice';

const CartSidebar = ({ 
  isOpen, 
  onClose, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  // Calculate totals
  const cartItemsList = cartItems?.items || [];
  const totalItems = cartItemsList.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItemsList.reduce((total, item) => {
    const price = item.salePrice > 0 ? item.salePrice : item.price;
    return total + (price * item.quantity);
  }, 0);
  
  // Estimated tax and shipping (you can make these dynamic)
  const estimatedTax = subtotal * 0.17; // 17% tax (standard in Pakistan)
  const estimatedShipping = subtotal > 5000 ? 0 : 500; // Free shipping over PKR 5000
  const total = subtotal + estimatedTax + estimatedShipping;

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

  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsLoading(true);
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    try {
      const result = await dispatch(updateCartQuantity({
        userId: effectiveUserId,
        productId,
        type: newQuantity > cartItemsList.find(item => item.productId === productId)?.quantity ? 'increase' : 'decrease'
      }));
      
      if (result?.payload?.success) {
        dispatch(fetchCartItems(effectiveUserId));
        toast({
          title: "Cart updated",
          description: "Item quantity has been updated"
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update item quantity",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    setIsLoading(true);
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    try {
      const result = await dispatch(deleteCartItem({
        userId: effectiveUserId,
        productId
      }));
      
      if (result?.payload?.success) {
        dispatch(fetchCartItems(effectiveUserId));
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart"
        });
        
        // Auto-close sidebar if cart becomes empty
        if (result.payload.data?.items?.length === 0) {
          setTimeout(() => {
            onClose();
          }, 1500); // Give user time to see the empty state
        }
      }
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/shop/checkout');
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
            <ShoppingBag className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            {totalItems > 0 && (
              <Badge className="bg-orange-600">
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

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {cartItemsList.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Add some products to get started
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
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItemsList.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
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

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1)}
                            disabled={isLoading || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium px-2 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1)}
                            disabled={isLoading || item.quantity >= item.totalStock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

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

                      {/* Stock Warning */}
                      {item.quantity >= item.totalStock && (
                        <p className="text-xs text-amber-600 mt-1">
                          Maximum quantity reached
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t bg-gray-50 p-4 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>PKR {Math.round(subtotal)}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated Tax</span>
                  <span>PKR {Math.round(estimatedTax)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {estimatedShipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `PKR ${Math.round(estimatedShipping)}`
                    )}
                  </span>
                </div>

                {/* Free Shipping Progress */}
                {estimatedShipping > 0 && (
                  <div className="text-xs text-gray-600">
                    Add PKR {Math.round(5000 - subtotal)} more for free shipping
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>PKR {Math.round(total)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={isLoading}
                  >
                    Proceed to Checkout
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
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;