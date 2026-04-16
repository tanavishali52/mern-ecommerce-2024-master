import React from 'react';

class WhatsAppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('WhatsApp component error:', error, errorInfo);
    
    // You could also log this to an error reporting service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `WhatsApp Error: ${error.message}`,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI - render nothing to gracefully hide the component
      return null;
    }

    return this.props.children;
  }
}

export default WhatsAppErrorBoundary;