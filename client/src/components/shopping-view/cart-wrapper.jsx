import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { fetchCartItems } from "@/store/shop/cart-slice";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <SheetContent className="sm:max-w-md flex flex-col h-full bg-brand-light">
      <SheetHeader className="border-b border-brand-primary/10 pb-4">
        <SheetTitle className="text-brand-dark text-xl font-bold">Your Cart</SheetTitle>
      </SheetHeader>
      
      <div className="flex-1 overflow-y-auto py-6">
        <div className="space-y-4">
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Your cart is empty</p>
          )}
        </div>
      </div>

      <div className="border-t border-brand-primary/10 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-brand-dark">Total</span>
          <span className="text-lg font-bold text-price-orange">
            ${totalCartAmount.toFixed(2)}
          </span>
        </div>
        
        <Button
          onClick={() => {
            navigate("/shop/checkout");
            setOpenCartSheet(false);
          }}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white transition-colors"
          disabled={!cartItems?.length}
        >
          Proceed to Checkout
        </Button>
      </div>
    </SheetContent>
  );
}

export default UserCartWrapper;
