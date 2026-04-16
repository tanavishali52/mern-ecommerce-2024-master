import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  CheckCircle, 
  X, 
  Package, 
  DollarSign, 
  User,
  Clock,
  Truck
} from "lucide-react";

function OrderSuccessBanner({ 
  orderData, 
  isVisible, 
  onDismiss,
  autoHideDelay = 10000 
}) {
  const [timeLeft, setTimeLeft] = useState(Math.floor(autoHideDelay / 1000));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let hideTimer;
    let countdownInterval;

    try {
      setIsAnimating(true);
      
      // Auto-hide timer
      hideTimer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      // Countdown timer
      countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error in OrderSuccessBanner useEffect:', error);
      // Fallback: dismiss banner after a short delay
      hideTimer = setTimeout(() => {
        onDismiss();
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isVisible, autoHideDelay, onDismiss]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Allow animation to complete
  };

  const formatOrderNumber = (orderId) => {
    return `#${orderId?.slice(-6).toUpperCase() || 'N/A'}`;
  };

  const getEstimatedDelivery = () => {
    if (orderData?.paymentMethod === 'cod') {
      return '5-7 business days';
    }
    return '3-5 business days';
  };

  if (!isVisible || !orderData) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 transition-all duration-300 ${
      isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
              {/* Success Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>

              {/* Success Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-green-800">
                    Order Successfully Placed!
                  </h3>
                  {orderData.isGuest && (
                    <Badge variant="secondary" className="text-xs w-fit">
                      Guest Order
                    </Badge>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-green-700 mb-2 sm:mb-3">
                  {orderData.isGuest 
                    ? "Thank you for your purchase! Your guest order has been confirmed and will be processed shortly."
                    : "Thank you for your purchase! Your order has been confirmed and will be processed shortly."
                  }
                </p>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Order:</span>
                    <span className="text-green-800 font-semibold truncate">
                      {formatOrderNumber(orderData.orderId)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Total:</span>
                    <span className="text-green-800 font-semibold">
                      PKR {Math.round(orderData.totalAmount) || '0'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-1 col-span-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Customer:</span>
                    <span className="text-green-800 font-semibold truncate">
                      {orderData.customerName || 'Guest'}
                    </span>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="mt-2 sm:mt-3 p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-blue-800">Estimated Delivery:</span>
                    <span className="text-blue-700">{getEstimatedDelivery()}</span>
                  </div>
                </div>

                {/* Auto-hide notification */}
                {timeLeft > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>Auto-hide in {timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dismiss Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-green-100 ml-2"
              aria-label="Dismiss order confirmation message"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderSuccessBanner;