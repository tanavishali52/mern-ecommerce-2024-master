import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductFeatured.css';

const ProductFeatured = ({ products = [], title = "Featured Products" }) => {
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/shop/product/${productId}`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="product-featured">
      <h2 className="title">{title}</h2>
      
      <div className="showcase-wrapper">
        {products.map((product) => (
          <div 
            key={product.id || product._id}
            className="showcase-container"
            onClick={() => handleProductClick(product.id || product._id)}
          >
            <div className="showcase">
              <div className="showcase-banner">
                <img 
                  src={product.image || (product.images && product.images[0]?.url)} 
                  alt={product.title}
                  className="showcase-img"
                  onError={(e) => {
                    e.target.src = '/src/assets/images/products/clothes-1.jpg';
                  }}
                />
              </div>

              <div className="showcase-content">
                <div className="showcase-rating">
                  {renderStars(product.rating || 4)}
                </div>

                <a href="#">
                  <h3 className="showcase-title">{product.title}</h3>
                </a>

                <p className="showcase-desc">
                  {product.description || "Premium quality product with excellent craftsmanship and modern design."}
                </p>

                <div className="price-box">
                  {product.salePrice ? (
                    <>
                      <del className="old-price">${product.price.toFixed(2)}</del>
                      <p className="price">${product.salePrice.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="price">${product.price.toFixed(2)}</p>
                  )}
                </div>

                <button className="add-cart-btn">add to cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};

export default ProductFeatured;