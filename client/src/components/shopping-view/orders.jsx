import { useEffect, useState, useRef } from "react";
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
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";
import "../../styles/order-highlighting.css";

function ShoppingOrders({ highlightOrderId }) {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const highlightedRowRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  // Auto-scroll to highlighted order
  useEffect(() => {
    if (highlightOrderId && highlightedRowRef.current) {
      setTimeout(() => {
        highlightedRowRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 500); // Delay to ensure component is rendered
    }
  }, [highlightOrderId, orderList]);

  console.log(orderDetails, "orderDetails");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList
                  .sort((a, b) => {
                    // Prioritize highlighted orders first, then by date
                    const aIsHighlighted = highlightOrderId && a._id === highlightOrderId;
                    const bIsHighlighted = highlightOrderId && b._id === highlightOrderId;
                    
                    if (aIsHighlighted && !bIsHighlighted) return -1;
                    if (!aIsHighlighted && bIsHighlighted) return 1;
                    
                    // Then sort by date (newest first)
                    return new Date(b.orderDate) - new Date(a.orderDate);
                  })
                  .map((orderItem) => {
                  const isHighlighted = highlightOrderId && orderItem?._id === highlightOrderId;
                  return (
                    <TableRow 
                      key={orderItem?._id}
                      ref={isHighlighted ? highlightedRowRef : null}
                      className={isHighlighted ? "order-highlighted" : ""}
                    >
                      <TableCell className={isHighlighted ? "font-semibold text-green-800" : ""}>
                        {orderItem?._id}
                        {isHighlighted && (
                          <Badge variant="outline" className="ml-2 border-green-500 text-green-700">
                            New Order
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                      <TableCell>
                        <Badge
                          className={`py-1 px-3 ${
                            orderItem?.orderStatus === "confirmed"
                              ? "bg-green-500"
                              : orderItem?.orderStatus === "rejected"
                              ? "bg-red-600"
                              : "bg-black"
                          }`}
                        >
                          {orderItem?.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>PKR {orderItem?.totalAmount}</TableCell>
                      <TableCell>
                        <Dialog
                          open={openDetailsDialog}
                          onOpenChange={() => {
                            setOpenDetailsDialog(false);
                            dispatch(resetOrderDetails());
                          }}
                        >
                          <Button
                            onClick={() =>
                              handleFetchOrderDetails(orderItem?._id)
                            }
                            variant={isHighlighted ? "default" : "outline"}
                            className={isHighlighted ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            View Details
                          </Button>
                          <ShoppingOrderDetailsView orderDetails={orderDetails} />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
