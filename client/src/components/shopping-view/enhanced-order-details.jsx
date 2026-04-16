import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin, 
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import WhatsAppSupport from "./whatsapp-support";
import "../../styles/order-highlighting.css";

function EnhancedOrderDetails({ order, isGuest = false, isHighlighted = false }) {
  const [orderTimeline, setOrderTimeline] = useState([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (order?._id) {
      fetchOrderTimeline();
    }
  }, [order]);

  const fetchOrderTimeline = async () => {
    try {
      setIsLoadingTimeline(true);
      const response = await fetch(`/api/shop/orders/${order._id}/timeline`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOrderTimeline(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching order timeline:', error);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const handleContactSupport = async () => {
    try {
      const response = await fetch(`/api/shop/orders/${order._id}/support-contact`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success && result.data?.whatsappUrl) {
        window.open(result.data.whatsappUrl, '_blank');
        toast({
          title: "Opening WhatsApp",
          description: "Redirecting you to WhatsApp with pre-filled order details.",
        });
      } else {
        // Fallback: generate WhatsApp URL manually
        const customerName = isGuest 
          ? (order.guestCustomer?.fullName || 'Guest Customer')
          : (order.customerDisplayName || order.addressInfo?.fullName || 'Customer');

        const message = `Hi! I need help with my order.

Order Details:
- Order ID: ${order._id}
- Customer: ${customerName}
- Status: ${order.orderStatus}
- Date: ${formatDate(order.orderDate)}
- Total: ${formatCurrency(order.totalAmount)}

${isGuest ? `
Guest Information:
- Phone: ${order.guestCustomer?.phoneNumber || 'Not provided'}
- Address: ${order.guestCustomer?.shippingAddress || 'Not provided'}, ${order.guestCustomer?.city || 'Not provided'}
` : ''}

Please assist me with this order. Thank you!`;

        const phoneNumber = '+923181234567'; // Default merchant WhatsApp
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        toast({
          title: "Opening WhatsApp",
          description: "WhatsApp will open with your order details pre-filled.",
        });
      }
    } catch (error) {
      console.error('Error contacting support:', error);
      
      // Fallback: generate WhatsApp URL manually
      const customerName = isGuest 
        ? (order.guestCustomer?.fullName || 'Guest Customer')
        : (order.customerDisplayName || order.addressInfo?.fullName || 'Customer');

      const message = `Hi! I need help with my order.

Order Details:
- Order ID: ${order._id}
- Customer: ${customerName}
- Status: ${order.orderStatus}
- Date: ${formatDate(order.orderDate)}
- Total: ${formatCurrency(order.totalAmount)}

Please assist me with this order. Thank you!`;

      const phoneNumber = '+923181234567'; // Default merchant WhatsApp
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      toast({
        title: "Opening WhatsApp",
        description: "WhatsApp will open with your order details. If you experience issues, please contact support directly.",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `PKR ${Math.round(amount || 0)}`;
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-600';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No order details available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card className={isHighlighted ? (isGuest ? "guest-order-highlighted" : "order-highlighted") : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order._id?.slice(-6).toUpperCase()}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isGuest && (
                <Badge variant="secondary">Guest Order</Badge>
              )}
              <Badge className={`${getStatusColor(order.orderStatus)} text-white`}>
                {order.orderStatus?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
              <p className="font-medium">{order.customerDisplayName || order.addressInfo?.fullName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
              <p className="font-medium flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {order.addressInfo?.phone || 'N/A'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{order.addressInfo?.address || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">
                  {order.addressInfo?.city}, {order.addressInfo?.pincode}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.cartItems?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <img
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  <p className="font-medium">{formatCurrency(item.price)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Order Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTimeline ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading timeline...</span>
            </div>
          ) : orderTimeline.length > 0 ? (
            <div className="space-y-4">
              {orderTimeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(event.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">{event.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                    {event.note && (
                      <p className="text-sm text-muted-foreground mt-1">{event.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No timeline information available.</p>
          )}
        </CardContent>
      </Card>

      {/* Support Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Have questions about your order? Contact our support team for assistance.
          </p>
          <Button 
            onClick={handleContactSupport}
            className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="h-4 w-4" />
            Contact Support via WhatsApp
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <p>Or call us directly at: <span className="font-medium">+92 318 1234567</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedOrderDetails;