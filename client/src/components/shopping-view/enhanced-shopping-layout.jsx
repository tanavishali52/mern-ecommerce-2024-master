import { useState } from 'react';
import { Outlet } from "react-router-dom";
import EnhancedHeader from "./enhanced-header";
import MobileBottomNav from "./mobile-bottom-nav";
import CartSidebar from "./cart-sidebar";
import GuestCheckoutModal from "./guest-checkout-modal-simple";

function EnhancedShoppingLayout() {
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <EnhancedHeader />
      
      {/* Main Content */}
      <main className="flex-1 w-full pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-6 px-4 bg-white border-t border-gray-200">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="font-bold text-xl text-gray-900">ECommerce</span>
              </div>
              <p className="text-sm text-gray-600">
                Your trusted online shopping destination for quality products at great prices.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/shop/listing" className="hover:text-orange-600">All Products</a></li>
                <li><a href="/shop/listing?dept=men" className="hover:text-orange-600">Men's</a></li>
                <li><a href="/shop/listing?dept=women" className="hover:text-orange-600">Women's</a></li>
                <li><a href="/shop/listing?dept=electronics" className="hover:text-orange-600">Electronics</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Customer Service</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/contact" className="hover:text-orange-600">Contact Us</a></li>
                <li><a href="/shipping" className="hover:text-orange-600">Shipping Info</a></li>
                <li><a href="/returns" className="hover:text-orange-600">Returns</a></li>
                <li><a href="/faq" className="hover:text-orange-600">FAQ</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Stay Updated</h3>
              <p className="text-sm text-gray-600 mb-3">
                Subscribe to get special offers and updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} ECommerce. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartSidebarOpen}
        onClose={() => setIsCartSidebarOpen(false)}
      />

      {/* Guest Checkout Modal */}
      <GuestCheckoutModal />
    </div>
  );
}

export default EnhancedShoppingLayout;