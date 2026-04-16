import React from 'react';
import PropTypes from 'prop-types';
import './modern-noora-grow-text.css';

/**
 * Modern NOORA GROW Text Component
 * 
 * A contemporary, youth-oriented text component that provides multiple styling
 * variations including gradients, neon effects, and animations.
 */
const ModernNooraGrowText = ({
  variant = 'gradient',
  size = 'md',
  className = '',
  animated = false,
  interactive = true,
  colorScheme = 'primary',
  children = 'NOORA GROW',
  ...props
}) => {
  // Handle animated-gradient variant
  const isAnimatedGradient = variant === 'animated-gradient';
  const actualVariant = isAnimatedGradient ? 'gradient' : variant;
  const isAnimated = animated || isAnimatedGradient;

  // Build CSS classes based on props
  const baseClasses = 'modern-noora-text';
  const variantClass = `modern-noora-text--${actualVariant}`;
  const sizeClass = `modern-noora-text--${size}`;
  const colorSchemeClass = `modern-noora-text--${colorScheme}`;
  const animatedClass = isAnimated ? 'modern-noora-text--animated' : '';
  const interactiveClass = interactive ? 'modern-noora-text--interactive' : '';

  const combinedClasses = [
    baseClasses,
    variantClass,
    sizeClass,
    colorSchemeClass,
    animatedClass,
    interactiveClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <span 
      className={combinedClasses}
      role="text"
      aria-label="NOORA GROW brand text"
      {...props}
    >
      {children}
    </span>
  );
};

// PropTypes for runtime validation
ModernNooraGrowText.propTypes = {
  /** Visual style variant */
  variant: PropTypes.oneOf(['gradient', 'neon', 'animated', 'classic', 'animated-gradient']),
  
  /** Text size */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'hero']),
  
  /** Additional CSS classes */
  className: PropTypes.string,
  
  /** Enable continuous animations */
  animated: PropTypes.bool,
  
  /** Enable hover interactions */
  interactive: PropTypes.bool,
  
  /** Color scheme variant */
  colorScheme: PropTypes.oneOf(['primary', 'secondary', 'accent']),
  
  /** Text content */
  children: PropTypes.node
};

export default ModernNooraGrowText;