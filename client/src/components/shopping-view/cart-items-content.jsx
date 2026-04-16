import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, fetchCartItems, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";

function UserCartItemsContent({ cartItem, isCheckout = false }) {
  const { user } = useSelector((state) => state.auth);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    const getCurrentProduct = productList.find(
      (item) => item._id === getCartItem.productId
    );

    if (
      typeOfAction === "increase" &&
      getCartItem.quantity + 1 > getCurrentProduct?.totalStock
    ) {
      toast({
        title: `Only ${getCurrentProduct?.totalStock} quantity can be added for this item`,
        variant: "destructive",
      });
      return;
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        type: typeOfAction,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Item removed from cart",
        });
      }
    });
  }

  const displayImage = cartItem?.images?.[0]?.url || cartItem?.image;

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="relative w-20 h-20 overflow-hidden rounded-lg">
        <img
          src={displayImage}
          alt={cartItem?.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x400/f0f0f0/666666?text=Product";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {cartItem?.title}
        </h3>
        <p className="text-sm text-gray-500">
          Price: PKR 
          {cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price}
        </p>
        {!isCheckout && (
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(cartItem, "decrease")}
              disabled={cartItem?.quantity === 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{cartItem?.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(cartItem, "increase")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {!isCheckout && (
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-red-500"
          onClick={() => handleCartItemDelete(cartItem)}
        >
          <Trash className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

export default UserCartItemsContent;
