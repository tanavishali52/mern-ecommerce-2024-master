import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { ChevronLeftIcon, ChevronRightIcon, ShareIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug: Log product data to see the structure
  console.log('Product data in tile:', product);

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    navigate('/shop/checkout', { 
      state: { 
        selectedProduct: product,
        productId: product._id 
      } 
    });
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    handleGetProductDetails(product?._id);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/shop/product/${product?._id}`;
    
    if (navigator.share) {
      // Use native share API if available
      navigator.share({
        title: product?.title,
        text: `Check out this product: ${product?.title}`,
        url: productUrl,
      }).catch((error) => {
        console.log('Error sharing:', error);
        copyToClipboard(productUrl);
      });
    } else {
      // Fallback to copying to clipboard
      copyToClipboard(productUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Share",
        description: `Share this product: ${url}`,
      });
    });
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? (product?.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === (product?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  return (
    <Card className="w-full group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div 
        onClick={() => handleGetProductDetails(product?._id)}
        className="cursor-pointer"
      >
        <div className="relative overflow-hidden">
          <img
            src={product?.images?.[currentImageIndex]?.url || product?.image || `https://via.placeholder.com/400x300/f0f0f0/666666?text=${encodeURIComponent(product?.title || 'Product Image')}`}
            alt={product?.title}
            className="w-full h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              console.log('Image failed to load:', e.target.src);
              console.log('Product data:', product);
              e.target.src = `https://via.placeholder.com/400x300/f0f0f0/666666?text=${encodeURIComponent(product?.title || 'No Image')}`;
            }}
          />
          
          {/* Share Button - Mobile Optimized */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/95 hover:bg-orange-50 rounded-full shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 w-8 h-8 sm:w-9 sm:h-9 border border-gray-200 hover:border-orange-300 z-10 touch-manipulation"
            onClick={handleShareClick}
          >
            <ShareIcon className="h-4 w-4 sm:h-4 sm:w-4 text-gray-600 hover:text-orange-600 transition-colors" />
          </Button>

          {/* Image Navigation - Mobile Optimized */}
          {(product?.images?.length > 1) && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 w-8 h-8 sm:w-8 sm:h-8 z-10 touch-manipulation"
                onClick={handlePrevImage}
              >
                <ChevronLeftIcon className="h-4 w-4 sm:h-4 sm:w-4 text-gray-700 hover:text-orange-600 transition-colors" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 w-8 h-8 sm:w-8 sm:h-8 z-10 touch-manipulation"
                onClick={handleNextImage}
              >
                <ChevronRightIcon className="h-4 w-4 sm:h-4 sm:w-4 text-gray-700 hover:text-orange-600 transition-colors" />
              </Button>
            </>
          )}
          
          {/* Image Indicators - Enhanced for Mobile */}
          {product?.images?.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:gap-1.5 z-10">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full transition-all duration-200 touch-manipulation ${
                    currentImageIndex === index ? 'bg-white scale-110 shadow-md' : 'bg-white/60 hover:bg-white/80'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Stock/Sale Badges */}
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500 hover:bg-red-600 text-white font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-orange-500 hover:bg-orange-600 text-white font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs">
              Only {product?.totalStock} left
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 hover:bg-green-600 text-white font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs">
              Sale
            </Badge>
          ) : null}
        </div>
        
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Product Title */}
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-2 leading-tight hover:text-orange-600 transition-colors">
            {product?.title}
          </h2>
          
          {/* Product Description - Limited to 2-3 lines */}
          {product?.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {product.description}
            </p>
          )}
          
          {/* Modern Brand and Category Display */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Badge */}
            <Badge 
              variant="secondary" 
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium px-2 py-1 rounded-full"
            >
              {categoryOptionsMap[product?.category]}
            </Badge>
            
            {/* Brand Badge */}
            {brandOptionsMap[product?.brand] && (
              <Badge 
                variant="outline" 
                className="border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 text-xs font-medium px-2 py-1 rounded-full"
              >
                {brandOptionsMap[product?.brand]}
              </Badge>
            )}
          </div>
          
          {/* Price Section */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              {product?.salePrice > 0 ? (
                <>
                  <span className="text-lg sm:text-xl font-bold text-orange-600">
                    PKR {product?.salePrice}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                    PKR {product?.price}
                  </span>
                </>
              ) : (
                <span className="text-lg sm:text-xl font-bold text-orange-600">
                  PKR {product?.price}
                </span>
              )}
            </div>
            
            {/* Discount Percentage */}
            {product?.salePrice > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold text-xs px-1.5 py-0.5">
                {Math.round(((product?.price - product?.salePrice) / product?.price) * 100)}% OFF
              </Badge>
            )}
          </div>
        </CardContent>
      </div>
      
      <CardFooter className="p-3 sm:p-4 pt-0">
        {product?.totalStock === 0 ? (
          <Button className="w-full bg-gray-400 text-white font-semibold py-2 sm:py-2.5 rounded-lg text-sm" disabled>
            Out Of Stock
          </Button>
        ) : (
          <div className="flex gap-2 sm:gap-3 w-full">
            <Button
              onClick={handleBuyNowClick}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all duration-200 hover:shadow-md text-xs sm:text-sm"
            >
              Buy Now
            </Button>
            <Button
              onClick={handleDetailsClick}
              variant="outline"
              className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 font-semibold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-sm hover:shadow-md"
            >
              Details
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
