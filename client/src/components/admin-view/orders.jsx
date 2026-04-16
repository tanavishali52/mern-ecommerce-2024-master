import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { useResponsive } from "@/hooks/useResponsive";
import { Eye, Calendar, User, DollarSign, Package } from "lucide-react";
import { getOrderStatusBadgeClass, formatOrderStatus } from "@/utils/orderStatusUtils";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const { isMobile, isTablet } = useResponsive();
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  // Mobile card component for orders
  const MobileOrderCard = ({ orderItem }) => (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Order ID and Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Order ID</span>
          </div>
          <span className="text-sm font-mono">{orderItem?._id?.slice(-8)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Date</span>
          </div>
          <span className="text-sm">{orderItem?.orderDate.split("T")[0]}</span>
        </div>

        {/* Customer Type and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Customer</span>
          </div>
          <Badge
            variant={orderItem?.isGuest ? "secondary" : "default"}
            className={`py-1 px-3 text-xs ${
              orderItem?.isGuest 
                ? "bg-blue-100 text-blue-800" 
                : "bg-green-100 text-green-800"
            }`}
          >
            {orderItem?.isGuest ? "Guest" : "Registered"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Amount</span>
          </div>
          <span className="text-sm font-semibold">PKR {orderItem?.totalAmount}</span>
        </div>

        {/* Order Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
          <Badge className={`py-1 px-3 text-xs ${getOrderStatusBadgeClass(orderItem?.orderStatus)}`}>
            {formatOrderStatus(orderItem?.orderStatus)}
          </Badge>
        </div>

        {/* View Details Button */}
        <Button
          onClick={() => handleFetchOrderDetails(orderItem?._id)}
          className="w-full mt-4 min-h-[44px] touch-manipulation"
          variant="outline"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">All Orders</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage and track all customer orders
          </p>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile View - Cards */}
          {(isMobile || isTablet) && (
            <div className="p-4 space-y-4">
              {orderList && orderList.length > 0 ? (
                orderList.map((orderItem) => (
                  <MobileOrderCard key={orderItem?._id} orderItem={orderItem} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              )}
            </div>
          )}

          {/* Desktop View - Table */}
          {!isMobile && !isTablet && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Order ID</TableHead>
                    <TableHead className="min-w-[120px]">Order Date</TableHead>
                    <TableHead className="min-w-[120px]">Customer Type</TableHead>
                    <TableHead className="min-w-[120px]">Order Status</TableHead>
                    <TableHead className="min-w-[100px]">Order Price</TableHead>
                    <TableHead className="min-w-[120px]">
                      <span className="sr-only">Details</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderList && orderList.length > 0
                    ? orderList.map((orderItem) => (
                        <TableRow key={orderItem?._id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">
                            {orderItem?._id}
                          </TableCell>
                          <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                          <TableCell>
                            <Badge
                              variant={orderItem?.isGuest ? "secondary" : "default"}
                              className={`py-1 px-3 ${
                                orderItem?.isGuest 
                                  ? "bg-blue-100 text-blue-800" 
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {orderItem?.isGuest ? "Guest" : "Registered"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`py-1 px-3 ${getOrderStatusBadgeClass(orderItem?.orderStatus)}`}>
                              {formatOrderStatus(orderItem?.orderStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            PKR {orderItem?.totalAmount}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleFetchOrderDetails(orderItem?._id)}
                              size="sm"
                              variant="outline"
                              className="min-h-[36px]"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No orders found</p>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onOpenChange={() => {
          setOpenDetailsDialog(false);
          dispatch(resetOrderDetails());
        }}
      >
        <AdminOrderDetailsView orderDetails={orderDetails} />
      </Dialog>
    </div>
  );
}

export default AdminOrdersView;
