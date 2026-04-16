import { cn } from '@/lib/utils';
import { getResponsivePadding, getResponsiveGap } from '@/utils/responsive';

// Responsive container component for admin sections
export const ResponsiveContainer = ({ 
  children, 
  className = '', 
  padding = 'medium',
  maxWidth = 'full' 
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      getResponsivePadding(padding),
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive grid component
export const ResponsiveGrid = ({ 
  children, 
  className = '', 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'medium' 
}) => {
  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;
  
  return (
    <div className={cn(
      'grid',
      gridCols,
      getResponsiveGap(gap),
      className
    )}>
      {children}
    </div>
  );
};

// Responsive card component
export const ResponsiveCard = ({ 
  children, 
  className = '', 
  padding = 'medium',
  hover = true 
}) => {
  return (
    <div className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      getResponsivePadding(padding),
      hover && 'hover:shadow-md transition-shadow duration-200',
      className
    )}>
      {children}
    </div>
  );
};

// Responsive button component
export const ResponsiveButton = ({ 
  children, 
  className = '', 
  size = 'medium',
  variant = 'primary',
  fullWidth = false,
  ...props 
}) => {
  const sizeClasses = {
    small: 'min-h-[40px] px-3 py-2 text-sm',
    medium: 'min-h-[44px] px-4 py-2 text-sm sm:text-base',
    large: 'min-h-[48px] px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'touch-manipulation', // Improves touch responsiveness
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Responsive form field component
export const ResponsiveFormField = ({ 
  label, 
  children, 
  error, 
  required = false,
  className = '' 
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

// Responsive input component
export const ResponsiveInput = ({ 
  className = '', 
  type = 'text',
  ...props 
}) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2',
        'text-base sm:text-sm', // Larger text on mobile to prevent zoom
        'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
};

// Responsive select component
export const ResponsiveSelect = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <select
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2',
        'text-base sm:text-sm', // Larger text on mobile
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

// Responsive textarea component
export const ResponsiveTextarea = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2',
        'text-base sm:text-sm', // Larger text on mobile
        'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
};