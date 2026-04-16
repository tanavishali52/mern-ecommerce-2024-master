// Responsive utility functions and classes

// Touch target size utilities
export const TOUCH_TARGET = {
  MIN_SIZE: 44, // Minimum touch target size in pixels
  COMFORTABLE_SIZE: 48, // Comfortable touch target size
  LARGE_SIZE: 56, // Large touch target size
};

// Responsive spacing utilities
export const RESPONSIVE_SPACING = {
  mobile: {
    padding: 'p-4',
    margin: 'm-4',
    gap: 'gap-4',
  },
  tablet: {
    padding: 'md:p-6',
    margin: 'md:m-6',
    gap: 'md:gap-6',
  },
  desktop: {
    padding: 'lg:p-8',
    margin: 'lg:m-8',
    gap: 'lg:gap-8',
  },
};

// Responsive grid utilities
export const RESPONSIVE_GRID = {
  products: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  orders: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4',
  dashboard: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
};

// Responsive text utilities
export const RESPONSIVE_TEXT = {
  heading: 'text-xl sm:text-2xl lg:text-3xl',
  subheading: 'text-lg sm:text-xl lg:text-2xl',
  body: 'text-sm sm:text-base',
  caption: 'text-xs sm:text-sm',
};

// Mobile-first button classes
export const RESPONSIVE_BUTTON = {
  primary: `
    min-h-[${TOUCH_TARGET.MIN_SIZE}px] 
    px-4 py-3 
    sm:px-6 sm:py-2 
    text-sm sm:text-base
    touch-manipulation
  `,
  secondary: `
    min-h-[${TOUCH_TARGET.MIN_SIZE}px] 
    px-3 py-2 
    sm:px-4 sm:py-2 
    text-sm
    touch-manipulation
  `,
  icon: `
    min-w-[${TOUCH_TARGET.MIN_SIZE}px] 
    min-h-[${TOUCH_TARGET.MIN_SIZE}px] 
    p-2
    touch-manipulation
  `,
};

// Responsive form utilities
export const RESPONSIVE_FORM = {
  input: `
    min-h-[${TOUCH_TARGET.MIN_SIZE}px] 
    px-3 py-2 
    text-base
    sm:text-sm
  `,
  select: `
    min-h-[${TOUCH_TARGET.MIN_SIZE}px] 
    px-3 py-2 
    text-base
    sm:text-sm
  `,
  textarea: `
    min-h-[100px] 
    px-3 py-2 
    text-base
    sm:text-sm
  `,
};

// Responsive card utilities
export const RESPONSIVE_CARD = {
  base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  mobile: 'p-4 space-y-3',
  tablet: 'md:p-6 md:space-y-4',
  desktop: 'lg:p-8 lg:space-y-6',
  combined: 'rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3 md:p-6 md:space-y-4 lg:p-8 lg:space-y-6',
};

// Responsive table utilities
export const RESPONSIVE_TABLE = {
  // Hide columns on mobile
  hideOnMobile: 'hidden sm:table-cell',
  hideOnTablet: 'hidden lg:table-cell',
  // Show only on mobile
  showOnMobile: 'sm:hidden',
  // Responsive table container
  container: 'overflow-x-auto',
  // Mobile card alternative
  mobileCard: 'sm:hidden space-y-2 p-4 border rounded-lg',
};

// Responsive navigation utilities
export const RESPONSIVE_NAV = {
  sidebar: {
    desktop: 'hidden lg:flex w-64 flex-col border-r bg-background',
    mobile: 'lg:hidden',
  },
  header: {
    mobile: 'flex lg:hidden items-center justify-between p-4',
    desktop: 'hidden lg:flex items-center justify-between p-6',
  },
};

// Utility function to combine responsive classes
export const combineResponsiveClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Utility function to get responsive padding
export const getResponsivePadding = (size = 'medium') => {
  const sizes = {
    small: 'p-2 sm:p-3 md:p-4',
    medium: 'p-4 sm:p-6 md:p-8',
    large: 'p-6 sm:p-8 md:p-12',
  };
  return sizes[size] || sizes.medium;
};

// Utility function to get responsive margin
export const getResponsiveMargin = (size = 'medium') => {
  const sizes = {
    small: 'm-2 sm:m-3 md:m-4',
    medium: 'm-4 sm:m-6 md:m-8',
    large: 'm-6 sm:m-8 md:m-12',
  };
  return sizes[size] || sizes.medium;
};

// Utility function to get responsive gap
export const getResponsiveGap = (size = 'medium') => {
  const sizes = {
    small: 'gap-2 sm:gap-3 md:gap-4',
    medium: 'gap-4 sm:gap-6 md:gap-8',
    large: 'gap-6 sm:gap-8 md:gap-12',
  };
  return sizes[size] || sizes.medium;
};