import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

function ShoppingOrderDetails({ open, setOpen, orderDetails }) {
  const { user } = useSelector((state) => state.auth);
  const [imageIndices, setImageIndices] = useState({});

  const handlePrevImage = (productId) => {
    setImageIndices((prev) => ({
      ...prev,
      [productId]:
        prev[productId] === 0
          ? (orderDetails?.cartItems?.find((item) => item.productId === productId)
              ?.images?.length || 1) - 1
          : prev[productId] - 1,
    }));
  };

  const handleNextImage = (productId) => {
    setImageIndices((prev) => ({
      ...prev,
      [productId]:
        prev[productId] ===
        (orderDetails?.cartItems?.find((item) => item.productId === productId)
          ?.images?.length || 1) - 1
          ? 0
          : (prev[productId] || 0) + 1,
    }));
  };

  function getDisplayImage(item) {
    if (item.images?.length > 0) {
      return item.images[imageIndices[item.productId] || 0]?.url;
    }
    return item.image;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
        setImageIndices({});
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>Order Details</DialogTitle>
        <DialogDescription>
          View your order details including items, shipping information, and order status.
        </DialogDescription>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order ID:</span>
                <span className="font-medium">{orderDetails?._id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order Date:</span>
                <span className="font-medium">
                  {orderDetails?.orderDate?.split("T")[0]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge
                  className={`${
                    orderDetails?.orderStatus === "confirmed"
                      ? "bg-green-500"
                      : orderDetails?.orderStatus === "rejected"
                      ? "bg-red-600"
                      : "bg-black"
                  }`}
                >
                  {orderDetails?.orderStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <span className="font-medium">PKR {Math.round(orderDetails?.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-4">
              {orderDetails?.cartItems?.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-3 rounded-lg border"
                >
                  <div className="relative w-24 h-24">
                    <img
                      src={getDisplayImage(item)}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                    {(item.images?.length > 1 ||
                      (item.image && item.images?.length)) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full h-6 w-6"
                          onClick={() => handlePrevImage(item.productId)}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full h-6 w-6"
                          onClick={() => handleNextImage(item.productId)}
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <div className="text-sm text-muted-foreground">
                      PKR {item.price} x {item.quantity}
                    </div>
                    <div className="font-medium mt-1">
                      PKR {Math.round(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Shipping Address</h3>
            <div className="space-y-2 text-sm">
              <p>{orderDetails?.addressInfo?.address}</p>
              <p>{orderDetails?.addressInfo?.city}</p>
              <p>PIN: {orderDetails?.addressInfo?.pincode}</p>
              <p>Phone: {orderDetails?.addressInfo?.phone}</p>
              {orderDetails?.addressInfo?.notes && (
                <p className="text-muted-foreground">
                  Notes: {orderDetails?.addressInfo?.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShoppingOrderDetails;
