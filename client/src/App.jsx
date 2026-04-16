import { Route, Routes, Navigate } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdminSettings from "./pages/admin-view/settings";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ProductDetailsPage from "./pages/shopping-view/product-details";
import UnifiedCheckout from "./pages/shopping-view/unified-checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import WishlistPage from "./pages/shopping-view/wishlist";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import BlogPage from "./pages/shopping-view/blog";
import BgImage from './assets/light-orange-blue-1.png'
import './styles/order-highlighting.css';

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const bgStyle = {
    backgroundImage: `url(${BgImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[800] bg-black h-[600px]" />;

  return (
    <div className="relative min-h-screen">
      {/* Background container */}
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={bgStyle}
      />

      {/* Enhanced gradient overlay */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[1.5px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Routes>
          {/* Root path redirect */}
          <Route path="/" element={<Navigate to="/shop/home" replace />} />

          {/* Auth routes */}
          <Route
            path="/auth"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <AuthLayout />
              </CheckAuth>
            }
          >
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <AdminLayout />
              </CheckAuth>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Shopping routes */}
          <Route path="/shop" element={<ShoppingLayout />}>
            <Route path="home" element={<ShoppingHome />} />
            <Route path="listing" element={<ShoppingListing />} />
            <Route path="product/:productId" element={<ProductDetailsPage />} />
            <Route
              path="checkout"
              element={<UnifiedCheckout />}
            />
            <Route
              path="wishlist"
              element={<WishlistPage />}
            />
            <Route
              path="account"
              element={
                <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                  <ShoppingAccount />
                </CheckAuth>
              }
            />
            <Route
              path="paypal-return"
              element={
                <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                  <PaypalReturnPage />
                </CheckAuth>
              }
            />
            <Route
              path="payment-success"
              element={
                <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                  <PaymentSuccessPage />
                </CheckAuth>
              }
            />
            <Route path="search" element={<SearchProducts />} />
            <Route path="blog" element={<BlogPage />} />
          </Route>

          {/* Other routes */}
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;