import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

/**
 * FooterSection Component
 * 
 * Reusable section component for organizing footer content with
 * collapsible functionality for mobile devices and accessibility support.
 */
const FooterSection = ({
  title,
  links = [],
  collapsible = false,
  defaultExpanded = false,
  className = '',
  titleLevel = 3,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible || defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleKeyDown = (event) => {
    if (collapsible && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      toggleExpanded();
    }
  };

  // Generate heading ID for accessibility
  const headingId = `footer-section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const contentId = `${headingId}-content`;

  // Determine if link is external
  const isExternalLink = (href) => {
    return href.startsWith('http') || href.startsWith('//');
  };

  // Render heading based on level
  const HeadingTag = `h${titleLevel}`;

  return (
    <div 
      className={`footer-section ${className}`}
      {...props}
    >
      <HeadingTag
        id={headingId}
        className={`footer-section__title ${collapsible ? 'footer-section__title--collapsible' : ''}`}
        onClick={collapsible ? toggleExpanded : undefined}
        onKeyDown={collapsible ? handleKeyDown : undefined}
        tabIndex={collapsible ? 0 : undefined}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
        aria-controls={collapsible ? contentId : undefined}
        aria-label={collapsible ? `${title} section, ${isExpanded ? 'expanded' : 'collapsed'}` : title}
      >
        <span className="footer-section__title-text">
          {title}
        </span>
        {collapsible && (
          <span className="footer-section__toggle-icon" aria-hidden="true">
            {isExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </span>
        )}
      </HeadingTag>

      <div
        id={contentId}
        className={`footer-section__content ${
          collapsible ? 'footer-section__content--collapsible' : ''
        } ${isExpanded ? 'footer-section__content--expanded' : 'footer-section__content--collapsed'}`}
        aria-labelledby={headingId}
        role={collapsible ? 'region' : undefined}
      >
        {links.length > 0 && (
          <ul className="footer-section__links" role="list">
            {links.map((link, index) => {
              const isExternal = isExternalLink(link.href);
              
              return (
                <li key={`${link.href}-${index}`} className="footer-section__link-item">
                  {isExternal ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-section__link footer-section__link--external"
                      aria-label={link.description ? `${link.label} - ${link.description}` : `${link.label} (opens in new tab)`}
                    >
                      <span className="footer-section__link-text">
                        {link.label}
                      </span>
                      <ExternalLink 
                        size={14} 
                        className="footer-section__external-icon"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="footer-section__link footer-section__link--internal"
                      aria-label={link.description ? `${link.label} - ${link.description}` : link.label}
                    >
                      <span className="footer-section__link-text">
                        {link.label}
                      </span>
                    </Link>
                  )}
                  
                  {link.description && (
                    <span className="footer-section__link-description sr-only">
                      {link.description}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Custom content slot */}
        {props.children && (
          <div className="footer-section__custom-content">
            {props.children}
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes for runtime validation
FooterSection.propTypes = {
  /** Section title */
  title: PropTypes.string.isRequired,
  
  /** Array of links to display */
  links: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    description: PropTypes.string
  })),
  
  /** Whether section can be collapsed on mobile */
  collapsible: PropTypes.bool,
  
  /** Default expanded state for collapsible sections */
  defaultExpanded: PropTypes.bool,
  
  /** Additional CSS classes */
  className: PropTypes.string,
  
  /** Heading level for accessibility (1-6) */
  titleLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  
  /** Custom content */
  children: PropTypes.node
};

export default FooterSection;