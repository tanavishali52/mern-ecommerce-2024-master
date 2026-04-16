import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import UserProfile from "@/components/shopping-view/user-profile";
import GuestOrderLookup from "@/components/shopping-view/guest-order-lookup";
import EnhancedOrderDetails from "@/components/shopping-view/enhanced-order-details";
import OrderSuccessBanner from "@/components/shopping-view/order-success-banner";
import OrderErrorBoundary from "@/components/common/order-error-boundary";
import { checkAuth } from "@/store/auth-slice";
import { User, Package, Search, LogIn, ShoppingCart } from "lucide-react";

function ShoppingAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [guestOrders, setGuestOrders] = useState([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [highlightOrderId, setHighlightOrderId] = useState(null);
  
  // Order confirmation state
  const [orderConfirmationData, setOrderConfirmationData] = useState(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [guestCustomerName, setGuestCustomerName] = useState("");

  useEffect(() => {
    // Check authentication status on mount
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    let timeoutId;
    
    try {
      // Comprehensive URL parameter handling
      const orderConfirmed = searchParams.get('orderConfirmed');
      const orderId = searchParams.get('orderId');
      const highlightParam = searchParams.get('highlight');
      const customerName = searchParams.get('customerName');
      const tabParam = searchParams.get('tab');

      // Handle order confirmation
      if (orderConfirmed === 'true' && orderId) {
        const confirmationData = {
          orderId: orderId,
          orderNumber: `#${orderId.slice(-6).toUpperCase()}`,
          totalAmount: parseFloat(searchParams.get('totalAmount')) || 0,
          customerName: customerName || 'Guest Customer',
          isGuest: !isAuthenticated,
          paymentMethod: searchParams.get('paymentMethod') || 'cod',
          orderDate: new Date().toISOString()
        };
        
        setOrderConfirmationData(confirmationData);
        setShowSuccessBanner(true);
        setHighlightOrderId(orderId);
      }

      // Handle order highlighting
      if (highlightParam) {
        setHighlightOrderId(highlightParam);
      }

      // Handle guest customer name pre-population
      if (customerName && !isAuthenticated) {
        setGuestCustomerName(customerName);
      }

      // Handle tab selection
      if (tabParam && ['profile', 'orders', 'address', 'guest-lookup', 'login-info'].includes(tabParam)) {
        setActiveTab(tabParam);
      }

      // Clean up URL parameters after processing
      if (orderConfirmed || highlightParam || customerName || tabParam) {
        const cleanParams = new URLSearchParams();
        // Keep only essential parameters temporarily
        if (highlightParam) {
          cleanParams.set('highlight', highlightParam);
        }
        
        // Clean URL after a short delay to allow components to process
        timeoutId = setTimeout(() => {
          setSearchParams({});
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing URL parameters:', error);
      // Fallback: clear parameters and show default view
      setSearchParams({});
      setActiveTab(isAuthenticated ? "orders" : "guest-lookup");
    }

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams, setSearchParams, isAuthenticated]);

  useEffect(() => {
    // Set appropriate default tab based on auth status
    if (isAuthenticated) {
      setActiveTab("orders");
    } else {
      setActiveTab("guest-lookup");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let highlightTimer;
    
    // Clear highlight after 5 seconds
    if (highlightOrderId) {
      highlightTimer = setTimeout(() => {
        setHighlightOrderId(null);
      }, 5000);
    }

    return () => {
      if (highlightTimer) {
        clearTimeout(highlightTimer);
      }
    };
  }, [highlightOrderId]);

  const handleGuestOrdersFound = (orders) => {
    setGuestOrders(orders);
    if (orders.length === 1) {
      // If only one order found, show details immediately
      setSelectedOrder(orders[0]);
      setShowOrderDetails(true);
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleBackToList = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <OrderErrorBoundary>
        <div className="flex flex-col">
          <div className="relative h-[300px] w-full overflow-hidden">
            <img
              src={accImg}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="container mx-auto grid grid-cols-1 gap-8 py-8">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </OrderErrorBoundary>
    );
  }

  return (
    <OrderErrorBoundary>
      <div className="flex flex-col">
        {/* Order Success Banner */}
        <OrderSuccessBanner
          orderData={orderConfirmationData}
          isVisible={showSuccessBanner}
          onDismiss={() => setShowSuccessBanner(false)}
          autoHideDelay={10000}
        />

        <div className="relative h-[300px] w-full overflow-hidden">
          <img
            src={accImg}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">
                {isAuthenticated ? `Welcome back, ${user?.userName}!` : 'My Account'}
              </h1>
              <p className="text-lg">
                {isAuthenticated 
                  ? 'Manage your profile and orders' 
                  : 'Find your orders or sign in to access your account'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto grid grid-cols-1 gap-4 sm:gap-8 py-4 sm:py-8 px-4">
          {/* Continue Shopping Button */}
          <div className="flex justify-center">
            <Button 
              onClick={() => {
                // Clear URL parameters and navigate to shop
                setSearchParams({});
                navigate('/shop/home');
              }}
              variant="outline"
              className="flex items-center gap-2 text-sm sm:text-base"
              aria-label="Continue shopping and return to home page"
            >
              <ShoppingCart className="h-4 w-4" />
              Continue Shopping
            </Button>
          </div>

          <div className="flex flex-col rounded-lg border bg-background p-3 sm:p-6 shadow-sm">
            {isAuthenticated ? (
              // Authenticated User Interface
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger 
                    value="profile" 
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
                    aria-label="View and manage your profile information"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
                    aria-label="View your order history and details"
                  >
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="address" 
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
                    aria-label="Manage your shipping addresses"
                  >
                    <Package className="h-4 w-4" />
                    <span>Address</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4 sm:mt-6">
                  <UserProfile />
                </TabsContent>

                <TabsContent value="orders" className="mt-4 sm:mt-6">
                  <ShoppingOrders highlightOrderId={highlightOrderId} />
                </TabsContent>

                <TabsContent value="address" className="mt-4 sm:mt-6">
                  <Address />
                </TabsContent>
              </Tabs>
            ) : (
              // Guest User Interface
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 h-auto">
                  <TabsTrigger 
                    value="guest-lookup" 
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
                    aria-label="Find your orders using your name"
                  >
                    <Search className="h-4 w-4" />
                    <span>Find Orders</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="login-info" 
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
                    aria-label="Sign in to your account"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="guest-lookup" className="mt-4 sm:mt-6">
                  {showOrderDetails && selectedOrder ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold">Order Details</h2>
                        <Button 
                          variant="outline" 
                          onClick={handleBackToList}
                          className="w-full sm:w-auto"
                          aria-label="Return to order list"
                        >
                          Back to Orders
                        </Button>
                      </div>
                      <EnhancedOrderDetails order={selectedOrder} isGuest={true} />
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <GuestOrderLookup 
                        onOrdersFound={handleGuestOrdersFound} 
                        prePopulatedName={guestCustomerName}
                      />
                      
                      {guestOrders.length > 1 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Your Orders</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {guestOrders.map((order) => {
                                const isHighlighted = highlightOrderId && order._id === highlightOrderId;
                                return (
                                  <div
                                    key={order._id}
                                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                                      isHighlighted ? 'bg-green-50 border-green-200 animate-pulse' : ''
                                    }`}
                                    onClick={() => handleOrderSelect(order)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleOrderSelect(order);
                                      }
                                    }}
                                    aria-label={`View details for order ${order._id.slice(-6).toUpperCase()}`}
                                  >
                                    <div className="flex-1">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`font-medium text-sm sm:text-base ${isHighlighted ? 'text-green-800' : ''}`}>
                                          Order #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">Guest</Badge>
                                        {isHighlighted && (
                                          <Badge variant="outline" className="border-green-500 text-green-700 text-xs">
                                            New Order
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs sm:text-sm text-gray-600">
                                        {new Date(order.orderDate).toLocaleDateString()} • ${order.totalAmount}
                                      </p>
                                    </div>
                                    <div className="mt-2 sm:mt-0 sm:ml-4">
                                      <Badge className={`text-xs ${
                                        order.orderStatus === 'confirmed' ? 'bg-green-500' :
                                        order.orderStatus === 'pending' ? 'bg-yellow-500' :
                                        'bg-gray-500'
                                      } text-white`}>
                                        {order.orderStatus}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="login-info" className="mt-4 sm:mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <LogIn className="h-5 w-5" />
                        Sign In to Your Account
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm sm:text-base text-gray-600">
                        Sign in to access your full account features including:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>View and manage your profile</li>
                        <li>Track all your orders in one place</li>
                        <li>Save multiple shipping addresses</li>
                        <li>Faster checkout process</li>
                        <li>Order history and reordering</li>
                      </ul>
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button 
                          onClick={() => window.location.href = '/auth'}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto"
                          aria-label="Sign in to your existing account"
                        >
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => window.location.href = '/auth'}
                          className="w-full sm:w-auto"
                          aria-label="Create a new account"
                        >
                          Create Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </OrderErrorBoundary>
  );
}

export default ShoppingAccount;
