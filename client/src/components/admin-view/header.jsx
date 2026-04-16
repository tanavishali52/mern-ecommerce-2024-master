import { AlignJustify, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { clearCart } from "@/store/shop/cart-slice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

function AdminHeader({ setOpen, isMobile, isTablet }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  function handleLogout() {
    dispatch(logoutUser());
    dispatch(clearCart());
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 bg-background border-b sticky top-0 z-30">
      {/* Mobile/Tablet Menu Button */}
      {(isMobile || isTablet) && (
        <Button 
          onClick={() => setOpen(true)} 
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px] touch-manipulation lg:hidden"
        >
          <AlignJustify size={20} />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      )}

      {/* Desktop Title - Hidden on mobile */}
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-foreground">Admin Dashboard</h2>
      </div>

      {/* Mobile Title - Centered */}
      {(isMobile || isTablet) && (
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold text-foreground">Admin</h2>
        </div>
      )}

      {/* User Menu */}
      <div className="flex items-center gap-2">
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 min-h-[44px] px-2 sm:px-3 touch-manipulation"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {user?.userName?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                {user?.userName || 'Admin'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.userName || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Logout Button - Desktop only */}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="hidden lg:inline-flex gap-2 items-center min-h-[36px] px-3 py-2"
        >
          <LogOut size={16} />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
