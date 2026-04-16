import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Heart, 
  ShoppingCart, 
  User,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartCounter, WishlistCounter } from '@/components/ui/animated-badge';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useToast } from '@/components/ui/use-toast';

const MobileBottomNav = ({ className = "" }) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState('login');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);

  // Calculate cart item count
  const cartItemCount = cartItems?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  // Calculate wishlist count from Redux store
  const wishlistCount = wishlistItems?.items?.length || 0;

  const handleAuthAction = (action) => {
    setAuthDialogTab(action);
    setShowAuthDialog(true);
  };

  const handleNavigation = (path, requiresAuth = false) => {
    // allow guest access to cart and wishlist
    if (requiresAuth && !isAuthenticated && path !== '/shop/wishlist' && path !== '/shop/checkout' && path !== '/shop/cart') {
      handleAuthAction('login');
      return;
    }
    navigate(path);
  };

  const handleCartClick = () => {
    navigate('/shop/checkout');
  };

  const handleWishlistClick = () => {
    navigate('/shop/wishlist');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/shop/home';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/shop/home',
      active: isActive('/shop/home') || location.pathname === '/'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/shop/search',
      active: isActive('/shop/search') || isActive('/shop/listing')
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      onClick: handleWishlistClick,
      active: isActive('/shop/wishlist'),
      badge: wishlistCount,
      requiresAuth: false
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      onClick: handleCartClick,
      active: isActive('/shop/checkout') || isActive('/shop/cart'),
      badge: cartItemCount,
      requiresAuth: false
    },
    {
      id: 'account',
      label: isAuthenticated ? 'Account' : 'Login',
      icon: isAuthenticated ? User : User,
      path: isAuthenticated ? '/shop/account' : null,
      onClick: isAuthenticated ? null : () => handleAuthAction('login'),
      active: isActive('/shop/account') || isActive('/shop/orders')
    }
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden ${className}`}>
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.active;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`relative flex flex-col items-center justify-center h-full rounded-none border-0 ${
                  isItemActive 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.path) {
                    handleNavigation(item.path, item.requiresAuth);
                  }
                }}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isItemActive ? 'text-orange-600' : ''}`} />
                  
                  {/* Animated badges for cart and wishlist */}
                  {item.id === 'cart' && <CartCounter count={cartItemCount} />}
                  {item.id === 'wishlist' && <WishlistCounter count={wishlistCount} />}
                </div>
                
                <span className={`text-xs mt-1 ${isItemActive ? 'text-orange-600 font-medium' : ''}`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isItemActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-orange-600 rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 md:hidden" />

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab={authDialogTab}
      />
    </>
  );
};

export default MobileBottomNav;