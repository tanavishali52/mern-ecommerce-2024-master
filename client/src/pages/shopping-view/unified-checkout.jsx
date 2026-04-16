import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, Phone, MapPin, ShoppingBag, CreditCard } from "lucide-react";
import { createUnifiedOrder } from "@/store/shop/order-slice";
import { clearCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getSessionId } from "@/utils/session";

function UnifiedCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isLoading: guestOrderLoading } = useSelector((state) => state.shopGuestCheckout);
  const { isLoading: userOrderLoading } = useSelector((state) => state.shopOrder);
  
  // Get product from navigation state
  const selectedProduct = location.state?.selectedProduct;
  const fromBuyNow = location.state?.fromBuyNow;

  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phoneNumber: "",
    shippingAddress: "",
    city: ""
  });

  const { cartItems } = useSelector((state) => state.shopCart);
  const cartItemsList = cartItems?.items || [];

  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo(prev => ({
        ...prev,
        fullName: user.userName || "",
        // Note: You might want to get user's address from their profile
      }));
    }
  }, [isAuthenticated, user]);

  const isCartCheckout = !selectedProduct && cartItemsList.length > 0;

  // Fetch cart items on mount if they are not already loaded
  useEffect(() => {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    if (effectiveUserId) {
      dispatch(fetchCartItems(effectiveUserId));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  // Redirect if no product selected AND cart is empty
  useEffect(() => {
    if (!selectedProduct && cartItemsList.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please select a product or add items to cart to checkout",
        variant: "destructive"
      });
      navigate('/shop/home');
    }
  }, [selectedProduct, cartItemsList, navigate, toast]);

  const checkoutItems = selectedProduct 
    ? [{
        productId: selectedProduct._id,
        title: selectedProduct.title,
        price: selectedProduct.salePrice || selectedProduct.price,
        quantity: 1,
        images: selectedProduct.images || [],
        image: selectedProduct.image || ""
      }]
    : cartItemsList.map(item => ({
        productId: item.productId,
        title: item.title,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
        images: item.images || (item.image ? [{url: item.image}] : []),
        image: item.image || ""
      }));

  const totalAmount = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const validateForm = () => {
    const errors = {};

    if (!customerInfo.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!customerInfo.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(customerInfo.phoneNumber.trim())) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    if (!customerInfo.shippingAddress.trim()) {
      errors.shippingAddress = "Shipping address is required";
    }

    if (!customerInfo.city.trim()) {
      errors.city = "City is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (checkoutItems.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create unified order data that works for both guest and logged-in users
      const orderData = {
        userId: isAuthenticated ? user?.id : null,
        cartItems: checkoutItems,
        addressInfo: {
          address: customerInfo.shippingAddress,
          city: customerInfo.city,
          phone: customerInfo.phoneNumber,
          notes: ""
        },
        guestCustomer: !isAuthenticated ? {
          fullName: customerInfo.fullName.trim(),
          phoneNumber: customerInfo.phoneNumber.trim(),
          shippingAddress: customerInfo.shippingAddress.trim(),
          city: customerInfo.city.trim()
        } : null,
        orderStatus: "pending",
        paymentMethod: paymentMethod,
        paymentStatus: "pending",
        totalAmount: totalAmount,
        orderDate: new Date(),
        orderUpdateDate: new Date()
      };

      const result = await dispatch(createUnifiedOrder(orderData)).unwrap();
      
        if (result.success) {
          // Clear cart after successful order
          const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
          dispatch(clearCart());
          
          toast({
            title: "Order Placed Successfully!",
            description: isAuthenticated 
              ? `Order ID: ${result.orderId}` 
              : "We'll contact you on WhatsApp to confirm your order.",
          });
        
        navigate('/shop/payment-success', { 
          state: { 
            orderId: result.orderId,
            isGuest: !isAuthenticated,
            customerInfo: !isAuthenticated ? customerInfo : null,
            items: checkoutItems
          } 
        });
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedProduct && cartItemsList.length === 0) {
    return null;
  }

  const isLoading = guestOrderLoading || userOrderLoading || isProcessing;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Customer Information Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isAuthenticated ? "Confirm Your Details" : "Customer Information"}
              </CardTitle>
              {isAuthenticated && (
                <p className="text-sm text-gray-600">
                  Logged in as: {user?.userName}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className={formErrors.fullName ? "border-red-500" : ""}
                />
                {formErrors.fullName && (
                  <p className="text-sm text-red-600">{formErrors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={customerInfo.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="+92 318 1234567"
                  className={formErrors.phoneNumber ? "border-red-500" : ""}
                />
                {formErrors.phoneNumber && (
                  <p className="text-sm text-red-600">{formErrors.phoneNumber}</p>
                )}
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <Label htmlFor="shippingAddress" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </Label>
                <Textarea
                  id="shippingAddress"
                  value={customerInfo.shippingAddress}
                  onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
                  placeholder="Enter your complete address"
                  rows={3}
                  className={formErrors.shippingAddress ? "border-red-500" : ""}
                />
                {formErrors.shippingAddress && (
                  <p className="text-sm text-red-600">{formErrors.shippingAddress}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter your city"
                  className={formErrors.city ? "border-red-500" : ""}
                />
                {formErrors.city && (
                  <p className="text-sm text-red-600">{formErrors.city}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <Label htmlFor="cod" className="flex-1">
                    Cash on Delivery (COD)
                  </Label>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Pay when your order is delivered to your doorstep
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Details */}
              <div className="space-y-4">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.images?.[0]?.url || item.image || "https://via.placeholder.com/80"}
                      alt={item.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      <div className="text-sm sm:text-base font-bold text-orange-600 mt-1">
                        PKR {item.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal:</span>
                  <span>PKR {totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping:</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg sm:text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    PKR {totalAmount}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Order...
                  </div>
                ) : (
                  "Place Order"
                )}
              </Button>

              {!isAuthenticated && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">
                    Want to save your details for future orders?
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/auth/register')}
                    className="w-full"
                  >
                    Create Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UnifiedCheckout;