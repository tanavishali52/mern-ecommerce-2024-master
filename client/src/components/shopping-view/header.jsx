import { HousePlug, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems, clearCart } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { AuthDialog } from "../auth/auth-dialog";
import { getSessionId } from "@/utils/session";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer hover:text-brand-primary transition-colors"
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    if (effectiveUserId) {
      dispatch(fetchCartItems(effectiveUserId));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  function handleLogout() {
    dispatch(logoutUser());
    dispatch(clearCart());
  }

  if (!isAuthenticated) {
    return (
      <div className="flex lg:items-center lg:flex-row flex-col gap-4">
        <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
          <Button
            onClick={() => setOpenCartSheet(true)}
            size="icon"
            className="relative hover:bg-brand-light hover:text-brand-dark border-brand-primary/20"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-brand-primary text-white rounded-full text-xs font-bold">
              {cartItems?.items?.length || 0}
            </span>
          </Button>
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            cartItems={cartItems?.items || []}
          />
        </Sheet>
        <AuthDialog />
      </div>
    );
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          size="icon"
          className="relative hover:bg-brand-light hover:text-brand-dark border-brand-primary/20"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-brand-primary text-white rounded-full text-xs font-bold">
            {cartItems?.items?.length || 0}
          </span>
          <span className="sr-only">User cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems?.items || []}
        />
      </Sheet>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-brand-secondary cursor-pointer hover:bg-brand-secondary/90 transition-colors">
            <AvatarFallback className="text-white font-extrabold">
              {user?.userName ? user.userName[0].toUpperCase() : ''}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel className="text-brand-dark">
            Logged in as {user?.userName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate("/shop/account")}
            className="hover:text-brand-primary"
          >
            <UserCog className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive hover:text-destructive/90"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2 hover:text-brand-primary transition-colors">
          <HousePlug className="h-6 w-6" />
          <span className="font-bold text-lg">Ecommerce</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="lg:hidden hover:bg-orange-400 hover:text-brand-dark">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs bg-white/80 p-5 lg:p-6 transition duration-300">
            <MenuItems />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <MenuItems />
        </div>
        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
