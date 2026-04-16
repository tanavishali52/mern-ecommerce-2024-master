import { useState, useEffect } from 'react';

// Breakpoint constants matching Tailwind CSS
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < BREAKPOINTS.md, // < 768px
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg, // 768px - 1023px
        isDesktop: width >= BREAKPOINTS.lg, // >= 1024px
      });
    };

    // Set initial size
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Hook for detecting specific breakpoints
export const useBreakpoint = (breakpoint) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    
    const updateMatches = () => setMatches(mediaQuery.matches);
    
    // Set initial value
    updateMatches();
    
    // Add listener
    mediaQuery.addEventListener('change', updateMatches);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [breakpoint]);

  return matches;
};

// Hook for mobile navigation state
export const useMobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { isMobile } = useResponsive();

  // Close mobile menu when screen becomes desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return {
    isOpen,
    activeSection,
    setActiveSection,
    openMenu,
    closeMenu,
    toggleMenu,
    isMobile,
  };
};

// Hook for responsive grid columns
export const useResponsiveGrid = (desktopCols = 4, tabletCols = 3, mobileCols = 1) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) return mobileCols;
  if (isTablet) return tabletCols;
  if (isDesktop) return desktopCols;
  
  return desktopCols;
};

export default useResponsive;