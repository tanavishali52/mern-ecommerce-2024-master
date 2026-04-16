import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  ChevronDown,
  Search,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { getSessionId } from '@/utils/session';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartCounter, WishlistCounter } from '@/components/ui/animated-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import WishlistSidebar from './wishlist-sidebar';
import CartSidebar from './cart-sidebar';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { logoutUser } from '@/store/auth-slice';
import { fetchCartItems } from '@/store/shop/cart-slice';
import { fetchWishlistItems } from '@/store/shop/wishlist-slice';

const EnhancedHeader = ({
  showCategories = true,
  className = ""
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState('login');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showWishlistSidebar, setShowWishlistSidebar] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);

  // Update cart count when cart items change
  useEffect(() => {
    if (cartItems?.items) {
      const totalItems = cartItems.items.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(totalItems);
    } else {
      setCartItemCount(0);
    }
  }, [cartItems]);

  // Fetch cart items
  useEffect(() => {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    if (effectiveUserId) {
      dispatch(fetchCartItems(effectiveUserId));
    }
  }, [isAuthenticated, user?.id, dispatch]);

  // Update wishlist count when wishlist items change
  useEffect(() => {
    if (wishlistItems?.items) {
      setWishlistCount(wishlistItems.items.length);
    } else {
      setWishlistCount(0);
    }
  }, [wishlistItems]);

  // Fetch wishlist items
  useEffect(() => {
    const effectiveUserId = isAuthenticated ? user?.id : getSessionId();
    if (effectiveUserId) {
      dispatch(fetchWishlistItems(effectiveUserId));
    }
  }, [isAuthenticated, user?.id, dispatch]);

  const handleAuthAction = (action) => {
    setAuthLoading(true);
    setAuthDialogTab(action);
    setShowAuthDialog(true);
    // Reset loading state after dialog opens
    setTimeout(() => setAuthLoading(false), 100);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser());
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCartClick = () => {
    setShowCartSidebar(true);
  };

  const handleWishlistClick = () => {
    setShowWishlistSidebar(true);
  };

  const categoryMenuItems = [
    { id: 'men', label: "Men's", path: '/shop/listing?dept=men' },
    { id: 'women', label: "Women's", path: '/shop/listing?dept=women' },
    { id: 'electronics', label: 'Electronics', path: '/shop/listing?dept=electronics' },
    { id: 'lifestyle', label: 'Lifestyle', path: '/shop/listing?dept=lifestyle' }
  ];

  const UserDropdownMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
              {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium">
            {user?.userName || 'Account'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.userName}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/shop/account')}>
          <User className="mr-2 h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/shop/orders')}>
          <Package className="mr-2 h-4 w-4" />
          Order History
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/shop/account/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAuthAction('login')}
        className="text-gray-700 hover:text-orange-600"
        disabled={authLoading}
      >
        Login
      </Button>
      <Button
        size="sm"
        onClick={() => handleAuthAction('register')}
        className="bg-orange-600 hover:bg-orange-700 text-white"
        disabled={authLoading}
      >
        Register
      </Button>
    </div>
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const ActionIcons = ({ isMobile = false }) => (
    <div className={`flex items-center ${isMobile ? 'gap-4' : 'gap-3'}`}>
      {/* User Account */}
      <button
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => isAuthenticated ? navigate('/shop/account') : handleAuthAction('login')}
        title="User account"
      >
        <User size={20} className="text-gray-700" />
      </button>

      {/* Wishlist */}
      <button
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={handleWishlistClick}
        title="Wishlist"
      >
        <Heart size={20} className="text-gray-700" />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </button>

      {/* Cart */}
      <button
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={handleCartClick}
        title="Shopping cart"
      >
        <ShoppingBag size={20} className="text-gray-700" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <>
      <header className={`bg-white sticky top-0 z-40 shadow-sm ${className}`}>
        {/* Header Top - Social Links & Free Shipping Banner */}
        <div className="hidden md:block bg-white border-b border-gray-100 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Social Links */}
              <div className="flex items-center gap-2">
                <a href="#" className="p-2 text-gray-400 hover:text-pink-500 hover:bg-gray-100 rounded transition-colors">
                  <Facebook size={16} />
                </a>
                <a href="#" className="p-2 text-gray-400 hover:text-pink-500 hover:bg-gray-100 rounded transition-colors">
                  <Twitter size={16} />
                </a>
                <a href="#" className="p-2 text-gray-400 hover:text-pink-500 hover:bg-gray-100 rounded transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="#" className="p-2 text-gray-400 hover:text-pink-500 hover:bg-gray-100 rounded transition-colors">
                  <Linkedin size={16} />
                </a>
              </div>

              {/* Free Shipping Banner */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Free Shipping</span> This Week Order Over - PKR 5000
                </p>
              </div>


            </div>
          </div>
        </div>

        {/* Main Header - Desktop Only */}
        <div className="hidden md:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <Link to="/shop/home" className="flex items-center">
                <span className="text-2xl md:text-3xl font-bold text-gray-900"> 𝓝𝓞𝓞𝓡𝓘𝓐 𝓖𝓡𝓞𝓦</span>
              </Link>

              {/* Search Bar - Desktop */}
              <div className="flex flex-1 max-w-lg mx-8">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    type="search"
                    placeholder="Enter your product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>

              {/* Action Icons */}
              <ActionIcons />
            </div>
          </div>
        </div>

        {/* Mobile Header - Matches your image design */}
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            {/* Mobile Logo - Centered */}
            <div className="text-center mb-4">
              <Link to="/shop/home" className="inline-block">
                <span className="text-2xl font-bold text-gray-900">  𝓝𝓞𝓞𝓡𝓘𝓐 𝓖𝓡𝓞𝓦</span>
              </Link>
            </div>

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                placeholder="Enter your product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-600 placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <ul className="flex items-center space-x-6">
                <li>
                  <Link
                    to="/shop/home"
                    className="block py-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    HOME
                  </Link>
                </li>
              
                <li>
                  <Link
                    to="/shop/listing?category=men"
                    className="block py-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    MEN'S
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop/listing?category=women"
                    className="block py-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    WOMEN'S
                  </Link>
                </li>
               
               
               
                <li>
                  <Link
                    to="/shop/listing?category=sports"
                    className="block py-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    SKIN
                  </Link>
                </li>
              
                <li>
                  <Link
                    to="/shop/blog"
                    className="block py-4 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    BLOG
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-4 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    HOT OFFERS
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="flex items-center justify-around py-3">
            {/* User */}
            <button
              className="flex flex-col items-center justify-center p-2 text-gray-700 hover:text-pink-600 transition-colors min-w-[60px]"
              onClick={() => isAuthenticated ? navigate('/shop/account') : handleAuthAction('login')}
              aria-label="User Account"
            >
              <User size={24} strokeWidth={1.5} />
            </button>

            {/* Cart */}
            <button
              className="flex flex-col items-center justify-center p-2 text-gray-700 hover:text-pink-600 transition-colors relative min-w-[60px]"
              onClick={handleCartClick}
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={24} strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Home */}
            <Link
              to="/shop/home"
              className="flex flex-col items-center justify-center p-2 text-gray-700 hover:text-pink-600 transition-colors min-w-[60px]"
              aria-label="Home"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </Link>

            {/* Wishlist */}
            <button
              className="flex flex-col items-center justify-center p-2 text-gray-700 hover:text-pink-600 transition-colors relative min-w-[60px]"
              onClick={handleWishlistClick}
              aria-label="Wishlist"
            >
              <Heart size={24} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Categories */}
            <button
              className="flex flex-col items-center justify-center p-2 text-gray-700 hover:text-pink-600 transition-colors min-w-[60px]"
              onClick={() => setShowMobileMenu(true)}
              aria-label="Categories"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-pink-600">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-4">
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/shop/home"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop/listing?category=men"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Men's
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop/listing?category=women"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Women's
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop/listing?category=electronics"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Electronics
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop/listing?category=jewelry"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Jewelry
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop/listing?category=perfume"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Perfume
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop/listing?category=sports"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Sports
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop/listing?category=beauty"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Beauty
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop/blog"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="block py-2 text-orange-600 hover:text-orange-700 transition-colors">
                      Hot Offers
                    </a>
                  </li>
                </ul>

                <div className="mt-8 pt-4 border-t border-gray-200">
                  <div className="flex justify-center gap-4">
                    <a href="#" className="p-3 text-gray-400 hover:text-pink-500 hover:bg-gray-100 rounded-lg transition-colors">
                      <Facebook size={20} />
                    </a>
                    <a href="#" className="p-3 text-gray-400 hover:text-pink-500 hover:bg-gray-100 rounded-lg transition-colors">
                      <Twitter size={20} />
                    </a>
                    <a href="#" className="p-3 text-gray-400 hover:text-pink-500 hover:bg-gray-100 rounded-lg transition-colors">
                      <Instagram size={20} />
                    </a>
                    <a href="#" className="p-3 text-gray-400 hover:text-pink-500 hover:bg-gray-100 rounded-lg transition-colors">
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab={authDialogTab}
      />

      {/* Wishlist Sidebar */}
      <WishlistSidebar
        isOpen={showWishlistSidebar}
        onClose={() => setShowWishlistSidebar(false)}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCartSidebar}
        onClose={() => setShowCartSidebar(false)}
      />
    </>
  );
};

export default EnhancedHeader;