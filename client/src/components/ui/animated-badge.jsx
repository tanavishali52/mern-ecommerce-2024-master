import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AnimatedBadge = ({ 
  count = 0, 
  maxDisplay = 99,
  className = "",
  variant = "default",
  showZero = false,
  animationType = "bounce", // "bounce", "scale", "pulse"
  position = "top-right", // "top-right", "top-left", "bottom-right", "bottom-left"
  size = "default", // "sm", "default", "lg"
  color = "orange" // "orange", "red", "blue", "green"
}) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  // Update display count with animation
  useEffect(() => {
    if (count !== prevCount) {
      setIsAnimating(true);
      
      // Delay the count update slightly for animation effect
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setPrevCount(count);
      }, 50);

      // Reset animation state
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => {
        clearTimeout(timer);
        clearTimeout(animationTimer);
      };
    }
  }, [count, prevCount]);

  // Don't render if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return null;
  }

  // Format display count
  const formattedCount = displayCount > maxDisplay ? `${maxDisplay}+` : displayCount.toString();

  // Position classes
  const positionClasses = {
    'top-right': 'absolute -top-2 -right-2',
    'top-left': 'absolute -top-2 -left-2',
    'bottom-right': 'absolute -bottom-2 -right-2',
    'bottom-left': 'absolute -bottom-2 -left-2'
  };

  // Size classes
  const sizeClasses = {
    'sm': 'h-4 w-4 text-xs',
    'default': 'h-5 w-5 text-xs',
    'lg': 'h-6 w-6 text-sm'
  };

  // Color classes
  const colorClasses = {
    'orange': 'bg-orange-600 text-white hover:bg-orange-700',
    'red': 'bg-red-500 text-white hover:bg-red-600',
    'blue': 'bg-blue-500 text-white hover:bg-blue-600',
    'green': 'bg-green-500 text-white hover:bg-green-600'
  };

  // Animation classes
  const animationClasses = {
    'bounce': isAnimating ? 'animate-bounce' : '',
    'scale': isAnimating ? 'animate-pulse scale-110' : 'scale-100',
    'pulse': isAnimating ? 'animate-ping' : ''
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        positionClasses[position],
        sizeClasses[size],
        colorClasses[color],
        animationClasses[animationType],
        'rounded-full p-0 flex items-center justify-center font-semibold transition-all duration-300 ease-in-out',
        isAnimating && 'transform',
        className
      )}
    >
      {formattedCount}
    </Badge>
  );
};

// Higher-order component for adding animated badges to any element
export const withAnimatedBadge = (WrappedComponent) => {
  return ({ badgeProps, children, className = "", ...props }) => {
    return (
      <div className={cn("relative inline-block", className)}>
        <WrappedComponent {...props}>
          {children}
        </WrappedComponent>
        {badgeProps && <AnimatedBadge {...badgeProps} />}
      </div>
    );
  };
};

// Specialized counter components
export const CartCounter = ({ count, ...props }) => (
  <AnimatedBadge
    count={count}
    color="orange"
    animationType="bounce"
    position="top-right"
    {...props}
  />
);

export const WishlistCounter = ({ count, ...props }) => (
  <AnimatedBadge
    count={count}
    color="red"
    animationType="scale"
    position="top-right"
    {...props}
  />
);

export const NotificationCounter = ({ count, ...props }) => (
  <AnimatedBadge
    count={count}
    color="blue"
    animationType="pulse"
    position="top-right"
    size="sm"
    {...props}
  />
);

export default AnimatedBadge;