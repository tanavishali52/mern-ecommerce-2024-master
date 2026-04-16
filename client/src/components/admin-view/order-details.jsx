import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import { ChevronLeftIcon, ChevronRightIcon, Package, Calendar, DollarSign, CreditCard, Truck, MapPin, Phone, User, Mail, PrinterIcon, MessageCircleIcon, CopyIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useResponsive } from "@/hooks/useResponsive";
import { Card, CardContent } from "../ui/card";
import { getOrderStatusBadgeClass, formatOrderStatus } from "@/utils/orderStatusUtils";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormDataState] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const { isMobile, isTablet } = useResponsive();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [imageIndices, setImageIndices] = useState({});

  // Custom setFormData function for CommonForm compatibility
  const setFormData = (name, value) => {
    console.log('Setting form data:', name, '=', value);
    setFormDataState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Debug form data changes
  console.log('Current formData:', formData);

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    console.log('Form data:', formData);
    console.log('Selected status:', status);
    console.log('Updating order status:', {
      orderId: orderDetails?._id,
      currentStatus: orderDetails?.orderStatus,
      newStatus: status
    });

    // Validate that status is selected
    if (!status) {
      toast({
        title: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      console.log('Status update response:', data);
      console.log('Updated order data:', data?.payload?.data);
      
      if (data?.payload?.success) {
        // No need to manually fetch order details again since the slice now updates automatically
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message || "Order status updated successfully",
        });
      } else {
        console.error('Status update failed:', data);
        toast({
          title: "Failed to update order status",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      console.error('Status update error:', error);
      toast({
        title: "Error updating order status",
        variant: "destructive",
      });
    });
  }

  const handlePrevImage = (productId) => {
    setImageIndices(prev => ({
      ...prev,
      [productId]: prev[productId] === 0 ? 
        (orderDetails?.cartItems?.find(item => item.productId === productId)?.images?.length || 1) - 1 : 
        prev[productId] - 1
    }));
  };

  const handleNextImage = (productId) => {
    setImageIndices(prev => ({
      ...prev,
      [productId]: prev[productId] === (orderDetails?.cartItems?.find(item => item.productId === productId)?.images?.length || 1) - 1 ? 
        0 : 
        (prev[productId] || 0) + 1
    }));
  };

  // Admin-only sharing functions
  const handlePrintOrder = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShareWhatsApp = () => {
    const orderText = generateOrderText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(orderText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyOrderInfo = async () => {
    const orderText = generateOrderText();
    try {
      await navigator.clipboard.writeText(orderText);
      toast({
        title: "Order information copied!",
        description: "Order details have been copied to clipboard.",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = orderText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Order information copied!",
        description: "Order details have been copied to clipboard.",
      });
    }
  };

  const generateOrderText = () => {
    const customer = orderDetails?.isGuest ? orderDetails?.guestCustomer : orderDetails?.addressInfo;
    const customerName = orderDetails?.isGuest ? customer?.fullName : user?.userName;
    const customerPhone = orderDetails?.isGuest ? customer?.phoneNumber : customer?.phone;
    const customerCity = orderDetails?.isGuest ? customer?.city : customer?.city;
    const shippingAddress = orderDetails?.isGuest ? customer?.shippingAddress : customer?.address;

    return `ORDER DETAILS
=============
Order ID: ${orderDetails?._id}
Date: ${orderDetails?.orderDate?.split("T")[0]}
Status: ${formatOrderStatus(orderDetails?.orderStatus)}

CUSTOMER INFO
=============
Full Name: ${customerName || "N/A"}
WhatsApp: ${customerPhone || "N/A"}
City: ${customerCity || "N/A"}
Payment Method: ${orderDetails?.paymentMethod || "N/A"}

SHIPPING ADDRESS
===============
${shippingAddress || "N/A"}

ORDER ITEMS
===========
${orderDetails?.cartItems?.map(item => 
  `${item.title} x ${item.quantity} - PKR ${Math.round(item.price * item.quantity)}`
).join('\n') || "No items"}

TOTAL: PKR ${Math.round(orderDetails?.totalAmount) || "0"}`;
  };

  const generatePrintContent = () => {
    const customer = orderDetails?.isGuest ? orderDetails?.guestCustomer : orderDetails?.addressInfo;
    const customerName = orderDetails?.isGuest ? customer?.fullName : user?.userName;
    const customerPhone = orderDetails?.isGuest ? customer?.phoneNumber : customer?.phone;
    const customerCity = orderDetails?.isGuest ? customer?.city : customer?.city;
    const shippingAddress = orderDetails?.isGuest ? customer?.shippingAddress : customer?.address;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Details - ${orderDetails?._id}</title>
      <style>
        @media print {
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; color: black; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; font-size: 14pt; margin-bottom: 10px; border-bottom: 1px solid #ccc; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .info-label { font-weight: bold; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
          .items-table th { background-color: #f0f0f0; font-weight: bold; }
          .total { font-size: 14pt; font-weight: bold; text-align: right; margin-top: 20px; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ORDER DETAILS</h1>
        <p>Order ID: ${orderDetails?._id}</p>
        <p>Date: ${orderDetails?.orderDate?.split("T")[0]}</p>
      </div>

      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row">
          <span class="info-label">Full Name:</span>
          <span>${customerName || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">WhatsApp:</span>
          <span>${customerPhone || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">City:</span>
          <span>${customerCity || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Method:</span>
          <span>${orderDetails?.paymentMethod || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Order Status:</span>
          <span>${formatOrderStatus(orderDetails?.orderStatus)}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Shipping Address</div>
        <p>${shippingAddress || "N/A"}</p>
      </div>

      <div class="section">
        <div class="section-title">Order Items</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails?.cartItems?.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>PKR {Math.round(item.price)}</td>
                <td>PKR {Math.round(item.price * item.quantity)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No items</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="total">
        TOTAL: PKR ${Math.round(orderDetails?.totalAmount) || "0"}
      </div>
    </body>
    </html>`;
  };

  function getDisplayImage(item) {
    if (item.images?.length > 0) {
      return item.images[imageIndices[item.productId] || 0]?.url;
    }
    return item.image;
  }

  // Responsive dialog content class
  const dialogClass = isMobile 
    ? "sm:max-w-[95vw] max-h-[90vh] overflow-y-auto" 
    : "sm:max-w-[700px] lg:max-w-[800px]";

  return (
    <DialogContent className={dialogClass} aria-describedby="order-details-description">
      <DialogDescription id="order-details-description" className="sr-only">
        Manage order details and update order status. View customer information and ordered items.
      </DialogDescription>
      
      <div className="space-y-6 p-1">
        {/* Order Summary Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </h2>
            
            {/* Admin-only sharing buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintOrder}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <PrinterIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 text-xs sm:text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <MessageCircleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyOrderInfo}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <CopyIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>
          
          {/* Order Info Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Order ID</span>
                  </div>
                  <Label className="font-mono text-xs sm:text-sm">{orderDetails?._id}</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Date</span>
                  </div>
                  <Label className="text-sm">{orderDetails?.orderDate.split("T")[0]}</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                  </div>
                  <Label className="text-sm font-semibold">PKR {orderDetails?.totalAmount}</Label>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Payment</span>
                  </div>
                  <Label className="text-sm">{orderDetails?.paymentMethod}</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                  </div>
                  <Badge className={`py-1 px-3 text-xs ${getOrderStatusBadgeClass(orderDetails?.orderStatus)}`}>
                    {formatOrderStatus(orderDetails?.orderStatus)}
                  </Badge>
                </div>
                
                {/* Show who last updated the status */}
                {orderDetails?.lastUpdatedBy && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Updated By</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900">
                        {orderDetails.lastUpdatedBy.adminName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(orderDetails.lastUpdatedBy.updatedAt).toLocaleDateString()} {new Date(orderDetails.lastUpdatedBy.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Payment Status</span>
                  <Label className="text-sm">{orderDetails?.paymentStatus}</Label>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base sm:text-lg">Order Items</h3>
          <div className="space-y-4">
            {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
              ? orderDetails?.cartItems.map((item, index) => (
                  <Card key={item.productId || index} className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-24 h-48 sm:h-24 flex-shrink-0">
                        <img
                          src={getDisplayImage(item)}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {(item.images?.length > 1 || (item.image && item.images?.length)) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full h-8 w-8 sm:h-6 sm:w-6"
                              onClick={() => handlePrevImage(item.productId)}
                            >
                              <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full h-8 w-8 sm:h-6 sm:w-6"
                              onClick={() => handleNextImage(item.productId)}
                            >
                              <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-sm sm:text-base">{item.title}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="text-sm text-muted-foreground">
                            PKR {item.price} × {item.quantity}
                          </div>
                          <div className="font-semibold text-sm sm:text-base">
                            PKR {Math.round(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items found</p>
                </div>
              )}
          </div>
        </div>

        <Separator />

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {orderDetails?.isGuest ? "Customer Info (Guest Order)" : "Shipping Info"}
          </h3>
          
          <Card className="p-4">
            {orderDetails?.isGuest ? (
              // Guest customer information
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                    </div>
                    <p className="text-sm">{orderDetails?.guestCustomer?.fullName || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">WhatsApp</span>
                    </div>
                    <p className="text-sm">{orderDetails?.guestCustomer?.phoneNumber || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">City</span>
                    </div>
                    <p className="text-sm">{orderDetails?.guestCustomer?.city || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                    </div>
                    <p className="text-sm">{orderDetails?.paymentMethod || "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Shipping Address</span>
                  </div>
                  <p className="text-sm">{orderDetails?.guestCustomer?.shippingAddress || "N/A"}</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <strong>Guest Order:</strong> Customer placed order without creating an account
                  </p>
                </div>
              </div>
            ) : (
              // Registered user information
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{orderDetails?.addressInfo?.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{orderDetails?.addressInfo?.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{orderDetails?.addressInfo?.pincode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{orderDetails?.addressInfo?.phone}</span>
                </div>
                {orderDetails?.addressInfo?.notes && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{orderDetails?.addressInfo?.notes}</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <Separator />

        {/* Update Order Status */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base sm:text-lg">Update Order Status</h3>
          <Card className="p-4">
            <CommonForm
              formControls={[
                {
                  label: "Order Status",
                  name: "status",
                  componentType: "select",
                  options: [
                    { id: "pending", label: "Pending" },
                    { id: "confirmed", label: "Confirmed" },
                    { id: "inProcess", label: "In Process" },
                    { id: "inShipping", label: "In Shipping" },
                    { id: "delivered", label: "Delivered" },
                    { id: "rejected", label: "Rejected" },
                  ],
                },
              ]}
              formData={formData}
              setFormData={setFormData}
              buttonText={"Update Order Status"}
              onSubmit={handleUpdateStatus}
            />
          </Card>
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
