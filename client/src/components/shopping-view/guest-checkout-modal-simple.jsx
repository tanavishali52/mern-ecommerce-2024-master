import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { closeGuestCheckout } from "@/store/shop/guest-checkout-slice";

function GuestCheckoutModal() {
  const dispatch = useDispatch();
  const { isModalOpen, selectedProduct } = useSelector((state) => state.shopGuestCheckout);

  const handleClose = () => {
    dispatch(closeGuestCheckout());
  };

  if (!isModalOpen) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Guest Checkout</h2>
          {selectedProduct && (
            <div className="mb-4">
              <p>Product: {selectedProduct.title}</p>
              <p>Price: PKR {selectedProduct.price}</p>
            </div>
          )}
          <p>Guest checkout form will be here...</p>
          <Button onClick={handleClose} className="mt-4">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GuestCheckoutModal;