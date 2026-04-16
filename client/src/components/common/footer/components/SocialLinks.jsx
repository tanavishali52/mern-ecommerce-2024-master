import React from 'react';
import PropTypes from 'prop-types';

/**
 * SocialLinks Component
 * 
 * Displays social media links with platform-specific styling,
 * hover effects, and accessibility features.
 */
const SocialLinks = ({
  links = [],
  title = 'Follow Us',
  layout = 'horizontal',
  showLabels = false,
  size = 'medium',
  className = '',
  ...props
}) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div 
      className={`social-links social-links--${layout} social-links--${size} ${className}`}
      {...props}
    >
      {title && (
        <h4 className="social-links__title">
          {title}
        </h4>
      )}
      
      <ul 
        className="social-links__list"
        role="list"
        aria-label="Social media links"
      >
        {links.map((link) => {
          const IconComponent = link.icon;
          
          return (
            <li key={link.platform} className="social-links__item">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-links__link social-links__link--${link.platform.toLowerCase()}`}
                aria-label={link.label || `Follow us on ${link.platform}`}
                style={{
                  '--social-color': link.color
                }}
              >
                <span className="social-links__icon" aria-hidden="true">
                  {IconComponent && <IconComponent size={size === 'small' ? 18 : size === 'large' ? 28 : 22} />}
                </span>
                
                {showLabels && (
                  <span className="social-links__label">
                    {link.platform}
                  </span>
                )}
                
                {/* Screen reader text */}
                <span className="sr-only">
                  {link.label || `Follow us on ${link.platform}`}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// PropTypes for runtime validation
SocialLinks.propTypes = {
  /** Array of social media links */
  links: PropTypes.arrayOf(PropTypes.shape({
    platform: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string,
    label: PropTypes.string
  })).isRequired,
  
  /** Section title */
  title: PropTypes.string,
  
  /** Layout orientation */
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'grid']),
  
  /** Show platform labels */
  showLabels: PropTypes.bool,
  
  /** Icon size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Additional CSS classes */
  className: PropTypes.string
};

export default SocialLinks;