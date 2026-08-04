import React from 'react';

// Responsive design utilities for AjumaPlus CRM

// Breakpoint definitions
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Media query helpers
export const mediaQueries = {
  xs: '@media (max-width: 599.95px)',
  sm: '@media (min-width: 600px) and (max-width: 959.95px)',
  md: '@media (min-width: 960px) and (max-width: 1279.95px)',
  lg: '@media (min-width: 1280px) and (max-width: 1919.95px)',
  xl: '@media (min-width: 1920px)',
};

// Responsive grid helpers
export const getGridColumns = (screenSize: keyof typeof breakpoints) => {
  const columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  };
  return columns[screenSize];
};

// Spacing helpers
export const getSpacing = (screenSize: keyof typeof breakpoints) => {
  const spacing = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  };
  return spacing[screenSize];
};

// Font size helpers
export const getFontSize = (screenSize: keyof typeof breakpoints) => {
  const fontSize = {
    xs: '0.875rem',
    sm: '1rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  };
  return fontSize[screenSize];
};

// Container max widths
export const containerMaxWidths = {
  xs: '100%',
  sm: '100%',
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Touch-friendly sizing
export const touchTargetSize = {
  minWidth: 44,
  minHeight: 44,
  buttonPadding: '12px 24px',
  inputPadding: '12px 16px',
};

// Mobile-specific utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
};

export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
};

export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.lg;
};

// Responsive hook
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState(() => {
    if (typeof window === 'undefined') return 'md';
    
    const width = window.innerWidth;
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    return 'xl';
  });

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < breakpoints.sm) setScreenSize('xs');
      else if (width < breakpoints.md) setScreenSize('sm');
      else if (width < breakpoints.lg) setScreenSize('md');
      else if (width < breakpoints.xl) setScreenSize('lg');
      else setScreenSize('xl');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'xs' || screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg' || screenSize === 'xl',
    breakpoints,
  };
};

// Responsive style helpers
export const responsiveStyles = {
  // Container
  container: {
    width: '100%',
    margin: '0 auto',
    padding: '0 16px',
    '@media (min-width: 600px)': {
      padding: '0 24px',
    },
    '@media (min-width: 960px)': {
      maxWidth: 900,
      padding: '0 32px',
    },
    '@media (min-width: 1280px)': {
      maxWidth: 1200,
    },
    '@media (min-width: 1920px)': {
      maxWidth: 1536,
    },
  },

  // Grid
  grid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 960px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    '@media (min-width: 1280px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },

  // Flex
  flexResponsive: {
    display: 'flex',
    flexDirection: 'column',
    '@media (min-width: 960px)': {
      flexDirection: 'row',
    },
  },

  // Typography
  heading: {
    fontSize: '1.5rem',
    '@media (min-width: 600px)': {
      fontSize: '1.75rem',
    },
    '@media (min-width: 960px)': {
      fontSize: '2rem',
    },
  },

  // Button
  button: {
    width: '100%',
    '@media (min-width: 600px)': {
      width: 'auto',
    },
  },

  // Card
  card: {
    padding: '16px',
    '@media (min-width: 600px)': {
      padding: '24px',
    },
  },
};

// Touch-friendly component props
export const touchFriendlyProps = {
  button: {
    style: {
      minHeight: touchTargetSize.minHeight,
      minWidth: touchTargetSize.minWidth,
      padding: touchTargetSize.buttonPadding,
    },
  },
  input: {
    style: {
      minHeight: touchTargetSize.minHeight,
      padding: touchTargetSize.inputPadding,
    },
  },
  list: {
    style: {
      minHeight: touchTargetSize.minHeight,
    },
  },
};

// Mobile optimization utilities
export const optimizeForMobile = (component: React.ComponentType) => {
  return (props: any) => {
    const { isMobile } = useResponsive();
    
    return React.createElement(component, {
      ...props,
      isMobile,
      responsive: true,
    });
  };
};

// Progressive loading for mobile
export const shouldUseProgressiveLoading = () => {
  if (typeof window === 'undefined') return false;
  const connection = (navigator as any).connection;
  return isMobile() && connection && connection.effectiveType !== '4g';
};

// Offline detection
export const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = React.useState(() => {
    if (typeof navigator === 'undefined') return false;
    return !navigator.onLine;
  });

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};

// Service Worker registration for PWA
export const registerServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
};

// Mobile-specific gesture support
export const useSwipeGesture = () => {
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    return {
      isLeftSwipe,
      isRightSwipe,
    };
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};