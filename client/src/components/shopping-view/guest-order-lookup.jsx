import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, User, AlertCircle, Package, Phone, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function GuestOrderLookup({ onOrdersFound, prePopulatedName = "" }) {
  const [guestName, setGuestName] = useState(prePopulatedName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [foundOrders, setFoundOrders] = useState([]);
  const [guestCustomerInfo, setGuestCustomerInfo] = useState(null);
  const { toast } = useToast();

  // Auto-populate and search when prePopulatedName is provided
  useEffect(() => {
    let searchTimeout;
    
    if (prePopulatedName && prePopulatedName.trim()) {
      setGuestName(prePopulatedName);
      // Auto-search when name is pre-populated with debounce
      searchTimeout = setTimeout(() => {
        handleSearch(null, prePopulatedName);
      }, 500);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [prePopulatedName]);

  const handleSearch = async (e, nameToSearch = null) => {
    if (e) e.preventDefault();
    
    const searchName = nameToSearch || guestName;
    
    if (!searchName.trim()) {
      setError("Please enter your full name");
      return;
    }

    setIsLoading(true);
    setError("");
    setSearchPerformed(false);

    try {
      const response = await fetch(`/api/shop/orders/guest/${encodeURIComponent(searchName.trim())}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        setFoundOrders(result.data);
        onOrdersFound(result.data);
        
        // Extract guest customer info from the first order
        const firstOrder = result.data[0];
        if (firstOrder.guestCustomer) {
          setGuestCustomerInfo({
            fullName: firstOrder.guestCustomer.fullName,
            phoneNumber: firstOrder.guestCustomer.phoneNumber,
            shippingAddress: firstOrder.guestCustomer.shippingAddress,
            city: firstOrder.guestCustomer.city
          });
        }
        
        toast({
          title: "Orders Found!",
          description: `Found ${result.data.length} order${result.data.length > 1 ? 's' : ''} for ${searchName}`,
        });
      } else {
        setError(`No orders found for "${searchName}". Please check the spelling and try again.`);
        setFoundOrders([]);
        setGuestCustomerInfo(null);
        onOrdersFound([]);
      }
      
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching for guest orders:', error);
      setError("An error occurred while searching for orders. Please try again.");
      setFoundOrders([]);
      setGuestCustomerInfo(null);
      onOrdersFound([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value) => {
    setGuestName(value);
    if (error) {
      setError("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Your Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Enter the full name you used when placing your order to find your order history.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your full name exactly as used in the order"
              className={error ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !guestName.trim()}
            className="w-full flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find My Orders
              </>
            )}
          </Button>
        </form>

        {/* Guest Customer Information Display */}
        {guestCustomerInfo && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <User className="h-5 w-5" />
                Guest Customer Information
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Guest
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Name:</span>
                  <span className="text-green-800">{guestCustomerInfo.fullName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Phone:</span>
                  <span className="text-green-800">{guestCustomerInfo.phoneNumber}</span>
                </div>
                
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-medium">Address:</span>
                    <div className="text-green-800">
                      {guestCustomerInfo.shippingAddress}, {guestCustomerInfo.city}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-green-700 bg-green-100 rounded p-2">
                <strong>Total Orders Found:</strong> {foundOrders.length}
              </div>
            </CardContent>
          </Card>
        )}

        {searchPerformed && !error && (
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              Search completed. {foundOrders.length > 0 ? "Check your orders below." : "No orders found with that name."}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">Tips for finding your orders:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use the exact name you provided when placing the order</li>
            <li>• Check for any typos or extra spaces</li>
            <li>• Names are case-insensitive, so "John Doe" and "john doe" will both work</li>
            <li>• If you still can't find your order, contact our support team</li>
          </ul>
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            Want to create an account for easier order tracking?
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/auth'}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Create Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default GuestOrderLookup;