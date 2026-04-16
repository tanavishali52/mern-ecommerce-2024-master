import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  CheckCircle, 
  Package, 
  Calendar, 
  DollarSign, 
  User,
  Clock,
  ArrowRight
} from "lucide-react";

function OrderConfirmationModal({ isOpen, orderData, onClose }) {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isOpen && countdown === 0) {
      handleRedirect();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, countdown]);

  const handleRedirect = () => {
    setIsRedirecting(true);
    onClose();
    // Navigate to account page with comprehensive order confirmation parameters
    const orderId = orderData?.orderId || orderData?._id;
    const params = new URLSearchParams({
      orderConfirmed: 'true',
      orderId: orderId,
      highlight: orderId
    });
    
    // Add customer name for guest orders
    if (orderData?.isGuest && orderData?.customerName) {
      params.append('customerName', orderData.customerName);
      params.append('tab', 'guest-lookup');
    } else {
      params.append('tab', 'orders');
    }
    
    navigate(`/shop/account?${params.toString()}`);
  };

  const handleViewOrderNow = () => {
    handleRedirect();
  };

  const handleStayHere = () => {
    setCountdown(-1); // Stop countdown
  };

  const formatDate = (date) => {
    const orderDate = new Date(date);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7); // Estimated 7 days delivery
    
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstimatedDelivery = () => {
    if (orderData?.paymentMethod === 'cod') {
      return '5-7 business days';
    }
    return '3-5 business days';
  };

  if (!orderData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Order Confirmed!
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Order Summary Card */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Order ID:</span>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-600">
                  #{orderData.orderId?.slice(-6).toUpperCase() || 'N/A'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Total Amount:</span>
                </div>
                <span className="font-bold text-lg">
                  ${orderData.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Customer:</span>
                </div>
                <span>{orderData.customerName || 'Guest Customer'}</span>
              </div>

              {orderData.paymentMethod && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Payment:</span>
                  </div>
                  <Badge variant="secondary">
                    {orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : orderData.paymentMethod.toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Delivery Information</span>
              </div>
              
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-medium">{getEstimatedDelivery()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected by:</span>
                  <span className="font-medium">{formatDate(new Date())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-redirect notification */}
          {countdown > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Redirecting to your account page in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={handleViewOrderNow}
              disabled={isRedirecting}
              className="w-full flex items-center justify-center gap-2"
            >
              {isRedirecting ? (
                "Redirecting..."
              ) : (
                <>
                  View Order Details
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            
            {countdown > 0 && (
              <Button 
                variant="outline" 
                onClick={handleStayHere}
                className="w-full"
              >
                Stay on this page
              </Button>
            )}
          </div>

          {/* Additional Information */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t">
            <p>
              You can track your order status and view details in your account page.
            </p>
            {orderData.isGuest && (
              <p className="mt-1">
                As a guest customer, use your name "{orderData.customerName}" to look up your orders.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OrderConfirmationModal;