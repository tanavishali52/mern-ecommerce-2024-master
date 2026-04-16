/**
 * Footer Data Configuration
 * 
 * Centralized configuration for all footer content including
 * brand information, navigation links, social media, and legal pages.
 */

import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Music,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export const footerConfig = {
  // Brand information
  brand: {
    name: 'NOORA GROW',
    tagline: 'Modern fashion for the next generation',
    description: 'Discover trendy, sustainable fashion that speaks to your unique style and values.',
    contact: {
      email: 'hello@nooragrow.com',
      phone: '+92 (300) 123-4567',
      address: 'Fashion District, Karachi, Pakistan',
      hours: 'Mon-Fri: 9AM-6PM PST'
    }
  },

  // Main navigation sections
  sections: [
    {
      id: 'quick-links',
      title: 'Quick Links',
      collapsible: true,
      links: [
        {
          label: 'Home',
          href: '/shop/home',
          description: 'Return to homepage'
        },
        {
          label: 'About Us',
          href: '/about',
          description: 'Learn about our story'
        },
        {
          label: 'Contact',
          href: '/contact',
          description: 'Get in touch with us'
        },
        {
          label: 'Blog',
          href: '/blog',
          description: 'Latest fashion trends and tips'
        },
        {
          label: 'FAQ',
          href: '/faq',
          description: 'Frequently asked questions'
        },
        {
          label: 'Size Guide',
          href: '/size-guide',
          description: 'Find your perfect fit'
        }
      ]
    },
    {
      id: 'categories',
      title: 'Shop Categories',
      collapsible: true,
      links: [
        {
          label: "Men's Fashion",
          href: '/shop/listing?category=men',
          description: 'Trendy clothing for men'
        },
        {
          label: "Women's Fashion",
          href: '/shop/listing?category=women',
          description: 'Stylish apparel for women'
        },
        {
          label: 'Electronics',
          href: '/shop/listing?category=electronics',
          description: 'Latest tech gadgets'
        },
        {
          label: 'Jewelry & Accessories',
          href: '/shop/listing?category=jewelry',
          description: 'Beautiful jewelry pieces'
        },
        {
          label: 'Perfume & Beauty',
          href: '/shop/listing?category=perfume',
          description: 'Fragrances and beauty products'
        },
        {
          label: 'Hot Offers',
          href: '/shop/offers',
          description: 'Special deals and discounts'
        }
      ]
    },
    {
      id: 'customer-service',
      title: 'Customer Service',
      collapsible: true,
      links: [
        {
          label: 'Track Your Order',
          href: '/track-order',
          description: 'Check your order status'
        },
        {
          label: 'Returns & Exchanges',
          href: '/returns',
          description: 'Easy return process'
        },
        {
          label: 'Shipping Info',
          href: '/shipping',
          description: 'Delivery information'
        },
        {
          label: 'Customer Reviews',
          href: '/reviews',
          description: 'What our customers say'
        },
        {
          label: 'Help Center',
          href: '/help',
          description: '24/7 customer support'
        }
      ]
    }
  ],

  // Social media platforms
  social: [
    {
      platform: 'Facebook',
      url: 'https://facebook.com/nooragrow',
      icon: Facebook,
      color: '#1877F2',
      label: 'Follow us on Facebook'
    },
    {
      platform: 'Instagram',
      url: 'https://instagram.com/nooragrow',
      icon: Instagram,
      color: '#E4405F',
      label: 'Follow us on Instagram'
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/nooragrow',
      icon: Twitter,
      color: '#1DA1F2',
      label: 'Follow us on Twitter'
    },
    {
      platform: 'TikTok',
      url: 'https://tiktok.com/@nooragrow',
      icon: Music,
      color: '#000000',
      label: 'Follow us on TikTok'
    },
    {
      platform: 'YouTube',
      url: 'https://youtube.com/nooragrow',
      icon: Youtube,
      color: '#FF0000',
      label: 'Subscribe to our YouTube channel'
    }
  ],

  // Newsletter configuration
  newsletter: {
    title: 'Stay Updated',
    subtitle: 'Get the latest fashion trends and exclusive offers',
    placeholder: 'Enter your email address',
    buttonText: 'Subscribe',
    disclaimer: 'We respect your privacy. Unsubscribe at any time.',
    benefits: [
      'Exclusive early access to sales',
      'New arrival notifications',
      'Style tips and fashion guides',
      'Special member-only discounts'
    ]
  },

  // Legal and policy links
  legal: [
    {
      label: 'Privacy Policy',
      href: '/privacy',
      description: 'How we protect your data'
    },
    {
      label: 'Terms of Service',
      href: '/terms',
      description: 'Terms and conditions'
    },
    {
      label: 'Cookie Policy',
      href: '/cookies',
      description: 'Our cookie usage policy'
    },
    {
      label: 'Return Policy',
      href: '/return-policy',
      description: 'Return and refund policy'
    },
    {
      label: 'Accessibility',
      href: '/accessibility',
      description: 'Accessibility statement'
    }
  ],

  // App download links removed
  apps: [],

  // Payment methods accepted removed
  paymentMethods: [],

  // Copyright and company info
  copyright: {
    year: new Date().getFullYear(),
    company: 'NOORA GROW',
    text: 'All rights reserved.',
    additionalText: 'Made with ❤️ for the next generation of fashion lovers.'
  }
};

// Footer variant configurations
export const footerVariants = {
  default: {
    showNewsletter: true,
    showSocial: true,
    showApps: false,
    showPaymentMethods: false,
    sectionsToShow: ['quick-links', 'categories', 'customer-service']
  },
  minimal: {
    showNewsletter: false,
    showSocial: true,
    showApps: false,
    showPaymentMethods: false,
    sectionsToShow: ['quick-links', 'categories']
  },
  extended: {
    showNewsletter: true,
    showSocial: true,
    showApps: false,
    showPaymentMethods: false,
    sectionsToShow: ['quick-links', 'categories', 'customer-service'],
    showContactInfo: true,
    showBenefits: true
  }
};

// Helper functions for footer data
export const getFooterSectionById = (sectionId) => {
  return footerConfig.sections.find(section => section.id === sectionId);
};

export const getVisibleSections = (variant = 'default') => {
  const config = footerVariants[variant] || footerVariants.default;
  return footerConfig.sections.filter(section =>
    config.sectionsToShow.includes(section.id)
  );
};

export const getSocialLinks = () => {
  return footerConfig.social;
};

export const getLegalLinks = () => {
  return footerConfig.legal;
};

export default footerConfig;