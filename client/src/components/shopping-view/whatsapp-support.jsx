import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { MessageCircle, ExternalLink, Phone, Mail } from "lucide-react";
import { useToast } from "../ui/use-toast";

function WhatsAppSupport({ 
  order, 
  customerInfo, 
  isGuest = false,
  className = "" 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSupportMessage = () => {
    if (!order) return "";

    const customerName = isGuest 
      ? (order.guestCustomer?.fullName || customerInfo?.name || 'Guest Customer')
      : (customerInfo?.userName || 'Customer');

    const orderProducts = order.cartItems?.map(item => 
      `- ${item.title} (Qty: ${item.quantity}) - $${item.price}`
    ).join('\n') || 'Product details not available';

    return `Hi! I need help with my order.

Order Details:
- Order ID: ${order._id}
- Customer: ${customerName}
- Status: ${order.orderStatus}
- Date: ${new Date(order.orderDate).toLocaleDateString()}
- Total: $${order.totalAmount}

Products:
${orderProducts}

${isGuest ? `
Guest Information:
- Phone: ${order.guestCustomer?.phoneNumber || 'Not provided'}
- Address: ${order.guestCustomer?.shippingAddress || 'Not provided'}, ${order.guestCustomer?.city || 'Not provided'}
` : ''}

Please assist me with this order. Thank you!`;
  };

  const handleWhatsAppContact = async () => {
    setIsGenerating(true);

    try {
      // Try to get support contact info from API
      const response = await fetch(`/api/shop/orders/${order._id}/support-contact`, {
        credentials: 'include'
      });

      let whatsappUrl = '';
      let merchantWhatsApp = '+1234567890'; // Default fallback

      if (response.ok) {
        const data = await response.json();
        whatsappUrl = data.data.whatsappUrl;
        merchantWhatsApp = data.data.merchantWhatsApp;
      } else {
        // Fallback: generate WhatsApp URL manually
        const message = generateSupportMessage();
        const phoneNumber = merchantWhatsApp.replace(/[^0-9]/g, '');
        whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      }

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Opening WhatsApp",
        description: "WhatsApp will open with your order details pre-filled.",
      });

    } catch (error) {
      console.error('Error generating support contact:', error);
      
      // Fallback: generate WhatsApp URL manually
      const message = generateSupportMessage();
      const phoneNumber = '+1234567890'; // Default merchant number
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Opening WhatsApp",
        description: "WhatsApp will open with your order details. If you experience issues, please contact support directly.",
        variant: "default",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAlternativeContact = () => {
    toast({
      title: "Alternative Contact Methods",
      description: "Phone: +1234567890 | Email: support@example.com",
    });
  };

  if (!order) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">Order information not available for support contact.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Contact Support
          {isGuest && (
            <Badge variant="secondary" className="text-xs">
              Guest Support
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>Need help with your order? Contact our support team directly via WhatsApp with your order details pre-filled.</p>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Order ID:</span>
            <span className="font-mono">#{order._id.slice(-6).toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Status:</span>
            <Badge variant={order.orderStatus === 'confirmed' ? 'default' : 'secondary'}>
              {order.orderStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total:</span>
            <span className="font-semibold">${order.totalAmount}</span>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleWhatsAppContact}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Preparing...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                Contact via WhatsApp
                <ExternalLink className="h-3 w-3" />
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleAlternativeContact}
            className="w-full flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Alternative Contact Methods
          </Button>
        </div>

        {/* Support Info */}
        <div className="text-xs text-gray-500 bg-blue-50 rounded p-2">
          <p className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Our support team typically responds within 2-4 hours during business hours.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default WhatsAppSupport;