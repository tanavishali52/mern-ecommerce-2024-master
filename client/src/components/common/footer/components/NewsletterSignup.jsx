import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';

/**
 * NewsletterSignup Component
 * 
 * Email subscription form with validation, loading states,
 * and accessibility features for newsletter signup.
 */
const NewsletterSignup = ({
  title = 'Stay Updated',
  subtitle = 'Get the latest updates and exclusive offers',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  disclaimer = 'We respect your privacy. Unsubscribe at any time.',
  benefits = null,
  onSubmit = null,
  className = '',
  ...props
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return 'Email address is required';
    }
    if (!emailRegex.test(emailValue)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Clear error when user starts typing
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const validationError = validateEmail(email);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Call custom onSubmit handler if provided
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Default behavior - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setStatus('success');
      setEmail(''); // Clear form on success
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    }
  };

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div 
      className={`newsletter-signup ${className}`}
      {...props}
    >
      {title && (
        <h4 className="newsletter-signup__title">
          {title}
        </h4>
      )}
      
      {subtitle && (
        <p className="newsletter-signup__subtitle">
          {subtitle}
        </p>
      )}

      {/* Benefits List */}
      {benefits && benefits.length > 0 && (
        <ul className="newsletter-signup__benefits" role="list">
          {benefits.map((benefit, index) => (
            <li key={index} className="newsletter-signup__benefit">
              <Check size={16} className="newsletter-signup__benefit-icon" aria-hidden="true" />
              <span className="newsletter-signup__benefit-text">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Signup Form */}
      <form 
        className="newsletter-signup__form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="newsletter-signup__input-group">
          <div className="newsletter-signup__input-wrapper">
            <Mail 
              size={20} 
              className="newsletter-signup__input-icon"
              aria-hidden="true"
            />
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={placeholder}
              className={`newsletter-signup__input ${
                isError ? 'newsletter-signup__input--error' : ''
              } ${isSuccess ? 'newsletter-signup__input--success' : ''}`}
              disabled={isLoading || isSuccess}
              aria-label="Email address for newsletter subscription"
              aria-describedby={
                isError ? 'newsletter-error' : 
                disclaimer ? 'newsletter-disclaimer' : undefined
              }
              aria-invalid={isError}
              required
            />
          </div>
          
          <button
            type="submit"
            className={`newsletter-signup__button ${
              isSuccess ? 'newsletter-signup__button--success' : ''
            }`}
            disabled={isLoading || isSuccess}
            aria-label={
              isLoading ? 'Subscribing...' :
              isSuccess ? 'Successfully subscribed' :
              buttonText
            }
          >
            {isLoading && (
              <Loader2 
                size={18} 
                className="newsletter-signup__button-icon newsletter-signup__button-icon--loading"
                aria-hidden="true"
              />
            )}
            {isSuccess && (
              <Check 
                size={18} 
                className="newsletter-signup__button-icon newsletter-signup__button-icon--success"
                aria-hidden="true"
              />
            )}
            <span className="newsletter-signup__button-text">
              {isLoading ? 'Subscribing...' :
               isSuccess ? 'Subscribed!' :
               buttonText}
            </span>
          </button>
        </div>

        {/* Error Message */}
        {isError && errorMessage && (
          <div 
            id="newsletter-error"
            className="newsletter-signup__error"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle 
              size={16} 
              className="newsletter-signup__error-icon"
              aria-hidden="true"
            />
            <span className="newsletter-signup__error-text">
              {errorMessage}
            </span>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div 
            className="newsletter-signup__success"
            role="alert"
            aria-live="polite"
          >
            <Check 
              size={16} 
              className="newsletter-signup__success-icon"
              aria-hidden="true"
            />
            <span className="newsletter-signup__success-text">
              Thank you for subscribing! Check your email for confirmation.
            </span>
          </div>
        )}
      </form>

      {/* Disclaimer */}
      {disclaimer && (
        <p 
          id="newsletter-disclaimer"
          className="newsletter-signup__disclaimer"
        >
          {disclaimer}
        </p>
      )}
    </div>
  );
};

// PropTypes for runtime validation
NewsletterSignup.propTypes = {
  /** Section title */
  title: PropTypes.string,
  
  /** Section subtitle */
  subtitle: PropTypes.string,
  
  /** Input placeholder text */
  placeholder: PropTypes.string,
  
  /** Submit button text */
  buttonText: PropTypes.string,
  
  /** Privacy disclaimer text */
  disclaimer: PropTypes.string,
  
  /** List of benefits to display */
  benefits: PropTypes.arrayOf(PropTypes.string),
  
  /** Custom submit handler function */
  onSubmit: PropTypes.func,
  
  /** Additional CSS classes */
  className: PropTypes.string
};

export default NewsletterSignup;