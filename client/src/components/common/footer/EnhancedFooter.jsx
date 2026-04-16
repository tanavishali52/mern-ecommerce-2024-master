import React from 'react';
import PropTypes from 'prop-types';
import { footerConfig, footerVariants, getVisibleSections } from './data/footerData';
import FooterSection from './components/FooterSection';
import SocialLinks from './components/SocialLinks';
import NewsletterSignup from './components/NewsletterSignup';
import FooterBottom from './components/FooterBottom';
import ModernNooraGrowText from '@/components/ui/modern-noora-grow-text';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import './styles/EnhancedFooter.css';

/**
 * Enhanced Footer Component
 * 
 * A comprehensive, modern footer that provides navigation, brand information,
 * social media links, newsletter signup, and legal information with responsive design.
 */
const EnhancedFooter = ({
  variant = 'default',
  showNewsletter = null,
  showSocial = null,
  showContactInfo = null,
  customSections = null,
  className = '',
  ...props
}) => {
  // Get configuration based on variant
  const variantConfig = footerVariants[variant] || footerVariants.default;
  
  // Override variant settings with explicit props
  const config = {
    ...variantConfig,
    showNewsletter: showNewsletter !== null ? showNewsletter : variantConfig.showNewsletter,
    showSocial: showSocial !== null ? showSocial : variantConfig.showSocial,
    showContactInfo: showContactInfo !== null ? showContactInfo : variantConfig.showContactInfo
  };

  // Get sections to display
  const sectionsToDisplay = customSections || getVisibleSections(variant);

  const { brand, newsletter, social } = footerConfig;

  return (
    <footer 
      className={`enhanced-footer enhanced-footer--${variant} ${className}`}
      role="contentinfo"
      aria-label="Site footer"
      {...props}
    >
      {/* Main Footer Content */}
      <div className="enhanced-footer__main">
        <div className="container">
          <div className="enhanced-footer__grid">
            
            {/* Brand Section */}
            <div className="enhanced-footer__brand">
              <div className="enhanced-footer__brand-logo">
                <ModernNooraGrowText 
                  variant="gradient"
                  size="lg"
                  colorScheme="primary"
                  interactive={false}
                />
              </div>
              
              <p className="enhanced-footer__brand-tagline">
                {brand.tagline}
              </p>
              
              <p className="enhanced-footer__brand-description">
                {brand.description}
              </p>

              {/* Contact Information */}
              {config.showContactInfo && (
                <div className="enhanced-footer__contact">
                  <h4 className="enhanced-footer__contact-title">Get in Touch</h4>
                  <div className="enhanced-footer__contact-list">
                    <div className="enhanced-footer__contact-item">
                      <Mail size={16} className="enhanced-footer__contact-icon" />
                      <a 
                        href={`mailto:${brand.contact.email}`}
                        className="enhanced-footer__contact-link"
                        aria-label={`Email us at ${brand.contact.email}`}
                      >
                        {brand.contact.email}
                      </a>
                    </div>
                    
                    <div className="enhanced-footer__contact-item">
                      <Phone size={16} className="enhanced-footer__contact-icon" />
                      <a 
                        href={`tel:${brand.contact.phone}`}
                        className="enhanced-footer__contact-link"
                        aria-label={`Call us at ${brand.contact.phone}`}
                      >
                        {brand.contact.phone}
                      </a>
                    </div>
                    
                    <div className="enhanced-footer__contact-item">
                      <MapPin size={16} className="enhanced-footer__contact-icon" />
                      <span className="enhanced-footer__contact-text">
                        {brand.contact.address}
                      </span>
                    </div>
                    
                    <div className="enhanced-footer__contact-item">
                      <Clock size={16} className="enhanced-footer__contact-icon" />
                      <span className="enhanced-footer__contact-text">
                        {brand.contact.hours}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Sections */}
            {sectionsToDisplay.map((section) => (
              <FooterSection
                key={section.id}
                title={section.title}
                links={section.links}
                collapsible={section.collapsible}
                className="enhanced-footer__section"
              />
            ))}

            {/* Newsletter & Social Section */}
            <div className="enhanced-footer__newsletter-social">
              {config.showNewsletter && (
                <NewsletterSignup
                  title={newsletter.title}
                  subtitle={newsletter.subtitle}
                  placeholder={newsletter.placeholder}
                  buttonText={newsletter.buttonText}
                  disclaimer={newsletter.disclaimer}
                  benefits={config.showBenefits ? newsletter.benefits : null}
                  className="enhanced-footer__newsletter"
                />
              )}

              {config.showSocial && (
                <SocialLinks
                  links={social}
                  title="Follow Us"
                  className="enhanced-footer__social"
                />
              )}

              {/* App Download Links */}
              {config.showApps && (
                <div className="enhanced-footer__apps">
                  <h4 className="enhanced-footer__apps-title">Download Our App</h4>
                  <div className="enhanced-footer__apps-links">
                    {footerConfig.apps.map((app) => (
                      <a
                        key={app.platform}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="enhanced-footer__app-link"
                        aria-label={app.label}
                      >
                        <span className="enhanced-footer__app-text">
                          {app.label}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <FooterBottom
        copyright={footerConfig.copyright}
        legalLinks={footerConfig.legal}
        paymentMethods={config.showPaymentMethods ? footerConfig.paymentMethods : null}
        className="enhanced-footer__bottom"
      />
    </footer>
  );
};

// PropTypes for runtime validation
EnhancedFooter.propTypes = {
  /** Footer variant configuration */
  variant: PropTypes.oneOf(['default', 'minimal', 'extended']),
  
  /** Show newsletter signup section */
  showNewsletter: PropTypes.bool,
  
  /** Show social media links */
  showSocial: PropTypes.bool,
  
  /** Show contact information */
  showContactInfo: PropTypes.bool,
  
  /** Custom sections to override default */
  customSections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      description: PropTypes.string
    })).isRequired,
    collapsible: PropTypes.bool
  })),
  
  /** Additional CSS classes */
  className: PropTypes.string
};

export default EnhancedFooter;