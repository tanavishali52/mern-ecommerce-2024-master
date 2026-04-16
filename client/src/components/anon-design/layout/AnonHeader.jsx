import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { logoutUser } from '@/store/auth-slice';
import { fetchCartItems } from '@/store/shop/cart-slice';
import ModernNooraGrowText from '@/components/ui/modern-noora-grow-text';
import './AnonHeader.css';

// Import images
import logoSvg from '@/assets/images/logo/logo.svg';
import electronicsBanner1 from '@/assets/images/electronics-banner-1.jpg';
import electronicsBanner2 from '@/assets/images/electronics-banner-2.jpg';
import mensBanner from '@/assets/images/mens-banner.jpg';
import womensBanner from '@/assets/images/womens-banner.jpg';

const AnonHeader = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const cartItemCount = cartItems?.items?.length || 0;
  const wishlistCount = 0; // TODO: Implement wishlist

  return (
    <header className="anon-header">
      {/* Header Top */}
      <div className="header-top">
        <div className="container">
          {/* Social Links */}
          <ul className="header-social-container">
            <li>
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={16} />
              </a>
            </li>
            <li>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={16} />
              </a>
            </li>
            <li>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={16} />
              </a>
            </li>
            <li>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            </li>
          </ul>

          {/* Alert News */}
          <div className="header-alert-news">
            <p>
              <b>Free Shipping</b> This Week Order Over - PKR1500
            </p>
          </div>

          {/* Top Actions */}
          <div className="header-top-actions">
            <select
              name="currency"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="header-select"
            >
              <option value="USD">USD $</option>
              <option value="EUR">PKR</option>
            </select>

            <select
              name="language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="header-select"
            >
              <option value="English">English</option>
              <option value="Spanish">URDU</option>
              <option value="French">Français</option>
            </select>
          </div>
        </div>
      </div>

      {/* Header Main */}
      <div className="header-main">
        <div className="container">
          {/* Logo */}
          <Link to="/shop/home" className="header-logo">
            <img
              src={logoSvg}
              alt="Anon's logo"
              width="120"
              height="36"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <ModernNooraGrowText
              variant="gradient"
              size="md"
              colorScheme="primary"
              interactive={true}
              style={{ display: 'none' }}
              className="logo-fallback"
            />
          </Link>

          {/* Search Container */}
          <div className={`header-search-container ${isSearchFocused ? 'focused' : ''}`}>
            <form onSubmit={handleSearch}>
              <input
                type="search"
                name="search"
                className="search-field"
                placeholder="Enter your product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <button type="submit" className="search-btn">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* User Actions */}
          <div className="header-user-actions">
            <button
              className="action-btn"
              onClick={() => isAuthenticated ? navigate('/shop/account') : navigate('/auth/login')}
              aria-label="User account"
            >
              <User size={20} />
            </button>

            <button
              className="action-btn"
              onClick={() => navigate('/shop/wishlist')}
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && <span className="count">{wishlistCount}</span>}
            </button>

            <button
              className="action-btn"
              onClick={() => navigate('/shop/cart')}
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && <span className="count">{cartItemCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Menu */}
      <nav className="desktop-navigation-menu desktop-only">
        <div className="container">
          <ul className="desktop-menu-category-list">
            <li className="menu-category">
              <Link to="/shop/home" className="menu-title">Home</Link>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">
                Categories
                <ChevronDown size={16} className="dropdown-icon" />
              </a>

              <div className="dropdown-panel">
                <ul className="dropdown-panel-list">
                  <li className="menu-title">
                    <a href="#">Electronics</a>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Desktop</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Laptop</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Camera</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Tablet</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Headphone</Link>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">
                      <img
                        src={electronicsBanner1}
                        alt="headphone collection"
                        width="250"
                        height="119"
                      />
                    </a>
                  </li>
                </ul>

                <ul className="dropdown-panel-list">
                  <li className="menu-title">
                    <a href="#">Men's</a>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=men">Formal</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=men">Casual</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=men">Sports</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=men">Jacket</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=men">Sunglasses</Link>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">
                      <img
                        src={mensBanner}
                        alt="men's fashion"
                        width="250"
                        height="119"
                      />
                    </a>
                  </li>
                </ul>

                <ul className="dropdown-panel-list">
                  <li className="menu-title">
                    <a href="#">Women's</a>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=women">Formal</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=women">Casual</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=women">Perfume</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=women">Cosmetics</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=women">Bags</Link>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">
                      <img
                        src={womensBanner}
                        alt="women's fashion"
                        width="250"
                        height="119"
                      />
                    </a>
                  </li>
                </ul>

                <ul className="dropdown-panel-list">
                  <li className="menu-title">
                    <a href="#">Electronics</a>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Smart Watch</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Smart TV</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Keyboard</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Mouse</Link>
                  </li>
                  <li className="panel-list-item">
                    <Link to="/shop/listing?category=electronics">Microphone</Link>
                  </li>
                  <li className="panel-list-item">
                    <a href="#">
                      <img
                        src={electronicsBanner2}
                        alt="mouse collection"
                        width="250"
                        height="119"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </li>

            <li className="menu-category">
              <Link to="/shop/listing?category=men" className="menu-title">Men's</Link>
            </li>

            <li className="menu-category">
              <Link to="/shop/listing?category=women" className="menu-title">Women's</Link>
            </li>

            <li className="menu-category">
              <Link to="/shop/listing?category=jewelry" className="menu-title">Jewelry</Link>
            </li>

            <li className="menu-category">
              <Link to="/shop/listing?category=perfume" className="menu-title">Perfume</Link>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">Blog</a>
            </li>

            <li className="menu-category">
              <a href="#" className="menu-title">Hot Offers</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-navigation mobile-only">
        <button
          className="action-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>

        <button
          className="action-btn"
          onClick={() => navigate('/shop/cart')}
          aria-label="Cart"
        >
          <ShoppingBag size={22} />
          {cartItemCount > 0 && <span className="count">{cartItemCount}</span>}
        </button>

        <button
          className="action-btn"
          onClick={() => navigate('/shop/home')}
          aria-label="Home"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>

        <button
          className="action-btn"
          onClick={() => navigate('/shop/wishlist')}
          aria-label="Wishlist"
        >
          <Heart size={22} />
          {wishlistCount > 0 && <span className="count">{wishlistCount}</span>}
        </button>

        <button
          className="action-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Categories"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <nav className="mobile-navigation-menu" onClick={(e) => e.stopPropagation()}>
            <div className="menu-top">
              <h2 className="menu-title">Menu</h2>
              <button
                className="menu-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <ul className="mobile-menu-category-list">
              <li className="menu-category">
                <Link
                  to="/shop/home"
                  className="menu-title"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>

              <li className="menu-category">
                <Link
                  to="/shop/listing?category=men"
                  className="menu-title"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Men's
                </Link>
              </li>

              <li className="menu-category">
                <Link
                  to="/shop/listing?category=women"
                  className="menu-title"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Women's
                </Link>
              </li>

              <li className="menu-category">
                <Link
                  to="/shop/listing?category=jewelry"
                  className="menu-title"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Jewelry
                </Link>
              </li>

              <li className="menu-category">
                <Link
                  to="/shop/listing?category=perfume"
                  className="menu-title"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Perfume
                </Link>
              </li>

              <li className="menu-category">
                <a href="#" className="menu-title">Blog</a>
              </li>

              <li className="menu-category">
                <a href="#" className="menu-title">Hot Offers</a>
              </li>
            </ul>

            {/* Mobile Menu Bottom */}
            <div className="menu-bottom">
              <div className="menu-social-container">
                <a href="#" className="social-link" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AnonHeader;