import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

/**
 * FooterBottom Component
 * 
 * Bottom section of the footer containing copyright information,
 * legal links, and payment methods with responsive layout.
 */
const FooterBottom = ({
  copyright,
  legalLinks = [],
  paymentMethods = null,
  className = '',
  ...props
}) => {
  const currentYear = copyright?.year || new Date().getFullYear();
  const companyName = copyright?.company || 'NOORA GROW';
  const copyrightText = copyright?.text || 'All rights reserved.';
  const additionalText = copyright?.additionalText;

  return (
    <div 
      className={`footer-bottom ${className}`}
      {...props}
    >
      <div className="container">
        <div className="footer-bottom__content">
          
          {/* Copyright Section */}
          <div className="footer-bottom__copyright">
            <p className="footer-bottom__copyright-text">
              © {currentYear} {companyName}. {copyrightText}
            </p>
            {additionalText && (
              <p className="footer-bottom__additional-text">
                {additionalText}
              </p>
            )}
          </div>

          {/* Legal Links */}
          {legalLinks && legalLinks.length > 0 && (
            <nav 
              className="footer-bottom__legal"
              aria-label="Legal and policy links"
            >
              <ul className="footer-bottom__legal-list" role="list">
                {legalLinks.map((link, index) => (
                  <li key={link.href} className="footer-bottom__legal-item">
                    <Link
                      to={link.href}
                      className="footer-bottom__legal-link"
                      aria-label={link.description || link.label}
                    >
                      {link.label}
                    </Link>
                    {index < legalLinks.length - 1 && (
                      <span 
                        className="footer-bottom__legal-separator"
                        aria-hidden="true"
                      >
                        |
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Payment Methods */}
          {paymentMethods && paymentMethods.length > 0 && (
            <div className="footer-bottom__payments">
              <span className="footer-bottom__payments-label">
                We Accept:
              </span>
              <ul 
                className="footer-bottom__payments-list"
                role="list"
                aria-label="Accepted payment methods"
              >
                {paymentMethods.map((method) => (
                  <li 
                    key={method.name}
                    className="footer-bottom__payment-item"
                  >
                    <span 
                      className={`footer-bottom__payment-icon footer-bottom__payment-icon--${method.icon}`}
                      aria-label={`${method.name} accepted`}
                      title={method.name}
                    >
                      {/* Payment method icons would be implemented via CSS or icon components */}
                      {method.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="footer-bottom__mobile">
          
          {/* Copyright Mobile */}
          <div className="footer-bottom__copyright-mobile">
            <p className="footer-bottom__copyright-text">
              © {currentYear} {companyName}
            </p>
            <p className="footer-bottom__copyright-text">
              {copyrightText}
            </p>
          </div>

          {/* Legal Links Mobile */}
          {legalLinks && legalLinks.length > 0 && (
            <nav 
              className="footer-bottom__legal-mobile"
              aria-label="Legal and policy links"
            >
              <ul className="footer-bottom__legal-list-mobile" role="list">
                {legalLinks.map((link) => (
                  <li key={`mobile-${link.href}`} className="footer-bottom__legal-item-mobile">
                    <Link
                      to={link.href}
                      className="footer-bottom__legal-link-mobile"
                      aria-label={link.description || link.label}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Payment Methods Mobile */}
          {paymentMethods && paymentMethods.length > 0 && (
            <div className="footer-bottom__payments-mobile">
              <span className="footer-bottom__payments-label-mobile">
                Accepted Payments
              </span>
              <ul 
                className="footer-bottom__payments-list-mobile"
                role="list"
                aria-label="Accepted payment methods"
              >
                {paymentMethods.map((method) => (
                  <li 
                    key={`mobile-${method.name}`}
                    className="footer-bottom__payment-item-mobile"
                  >
                    <span 
                      className={`footer-bottom__payment-icon-mobile footer-bottom__payment-icon--${method.icon}`}
                      aria-label={`${method.name} accepted`}
                    >
                      {method.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Text Mobile */}
          {additionalText && (
            <div className="footer-bottom__additional-mobile">
              <p className="footer-bottom__additional-text-mobile">
                {additionalText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// PropTypes for runtime validation
FooterBottom.propTypes = {
  /** Copyright information object */
  copyright: PropTypes.shape({
    year: PropTypes.number,
    company: PropTypes.string,
    text: PropTypes.string,
    additionalText: PropTypes.string
  }),
  
  /** Array of legal/policy links */
  legalLinks: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    description: PropTypes.string
  })),
  
  /** Array of accepted payment methods */
  paymentMethods: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  })),
  
  /** Additional CSS classes */
  className: PropTypes.string
};

export default FooterBottom;