import { useState, useEffect, useCallback } from 'react';
import banner1 from '../../assets/banner-1.webp';
import banner2 from '../../assets/banner-2.webp';
import banner3 from '../../assets/banner-3.webp';

const Banner = ({ bgColor = 'bg-white', featureImages = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Use admin feature images if available, otherwise fallback to default banners
  const defaultBanners = [
    { id: 1, image: banner1, alt: 'Banner 1' },
    { id: 2, image: banner2, alt: 'Banner 2' },
    { id: 3, image: banner3, alt: 'Banner 3' }
  ];

  const banners = featureImages && featureImages.length > 0 
    ? featureImages.map((img, index) => ({
        id: img._id || index + 1,
        image: img.image,
        alt: `Feature Banner ${index + 1}`
      }))
    : defaultBanners;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  // Touch gesture handling
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Pause auto-play on hover/focus
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div 
      className={`relative w-full overflow-hidden ${bgColor}`}
      style={{
        height: 'clamp(200px, 40vw, 500px)', // Better responsive height
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main slider container */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;
          const isPrev = index === (currentSlide - 1 + banners.length) % banners.length;
          const isNext = index === (currentSlide + 1) % banners.length;

          let slideClass = 'opacity-0 scale-95';
          let zIndex = 1;

          if (isActive) {
            slideClass = 'opacity-100 scale-100';
            zIndex = 3;
          } else if (isPrev || isNext) {
            slideClass = 'opacity-30 scale-95';
            zIndex = 2;
          }

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${slideClass}`}
              style={{ zIndex }}
            >
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-full object-contain sm:object-cover object-center bg-gray-100"
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  console.log('Banner image failed to load:', banner.image);
                  e.target.src = 'https://via.placeholder.com/1200x400/f0f0f0/666666?text=Promotion';
                }}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
              
              {/* Gradient overlay for better text readability - only on active slide */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation arrows - hidden on mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 
                   bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-3
                   transition-all duration-200 hover:scale-110 shadow-lg
                   hidden sm:flex items-center justify-center"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 
                   bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-3
                   transition-all duration-200 hover:scale-110 shadow-lg
                   hidden sm:flex items-center justify-center"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === index 
                ? 'bg-white w-6 sm:w-8 h-2 sm:h-3' 
                : 'bg-white/60 hover:bg-white/80 w-2 sm:w-3 h-2 sm:h-3'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{
            width: isAutoPlaying ? `${((Date.now() % 5000) / 5000) * 100}%` : '0%'
          }}
        />
      </div>
    </div>
  );
};

export default Banner;