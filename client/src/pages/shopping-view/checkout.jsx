import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(currentSelectedAddress, "cartItems");

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleInitiatePaypalPayment() {
    if (!cartItems?.items?.length) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        images: singleCartItem?.images || (singleCartItem?.image ? [{ url: singleCartItem.image }] : []),
        image: singleCartItem?.image, // Keep for backwards compatibility
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Image - Responsive */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full overflow-hidden">
        <img 
          src={img} 
          alt="Checkout"
          className="h-full w-full object-cover object-center" 
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center px-4">
            Checkout
          </h1>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Address Section */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
                Delivery Address
              </h2>
              <Address
                selectedId={currentSelectedAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 sticky top-4">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">
                Order Summary
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems && cartItems.items && cartItems.items.length > 0
                  ? cartItems.items.map((item) => (
                      <UserCartItemsContent 
                        key={`checkout-${item.productId}`} 
                        cartItem={item} 
                      />
                    ))
                  : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Your cart is empty</p>
                    </div>
                  )}
              </div>

              {/* Total Section */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>PKR {Math.round(totalCartAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>PKR {Math.round(totalCartAmount)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6">
                <Button 
                  onClick={handleInitiatePaypalPayment} 
                  className="w-full py-3 text-base font-semibold bg-primary hover:bg-primary/90 transition-colors"
                  disabled={isPaymentStart || !cartItems?.items?.length}
                >
                  {isPaymentStart
                    ? "Processing PayPal Payment..."
                    : `Checkout with PayPal - PKR ${Math.round(totalCartAmount)}`}
                </Button>
                
                {/* Security Notice */}
                <p className="text-xs text-gray-500 text-center mt-2">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;