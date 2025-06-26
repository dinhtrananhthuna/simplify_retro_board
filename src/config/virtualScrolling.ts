// Virtual Scrolling Configuration
export const VIRTUAL_SCROLLING_CONFIG = {
  // Activation thresholds - số lượng items để bắt đầu virtual scrolling
  thresholds: {
    boards: 20,        // Dashboard boards
    //stickers: 10,      // Stickers per column  
    stickers: 5,
    comments: 20,      // Comments per sticker
  },

  // Page sizes - số items load mỗi lần scroll
  pageSizes: {
    boards: 15,        // Boards per page
    //stickers: 25,      // Stickers per page
    stickers: 10,
    comments: 20,      // Comments per page
  },

  // Initial load counts - số items load ban đầu
  initialLoads: {
    boards: 30,        // Initial boards count
    //stickers: 50,      // Initial stickers count
    stickers: 5,
    comments: 40,      // Initial comments count
  },

  // Item heights for consistent rendering
  itemHeights: {
    board: 200,        // Board card height
    sticker: 140,      // Sticker card height (increased for better spacing)
    comment: 80,       // Comment item height
  },

  // Grid configurations
  grid: {
    boards: {
      itemWidth: 320,
      gap: 24,
      columnsCount: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      },
    },
  },

  // Performance settings
  performance: {
    overscanCount: 5,     // Extra items to render for smooth scrolling
    scrollThreshold: 15,  // Distance from bottom to trigger load
    loadingDelay: 300,    // Simulated loading delay (ms)
  },
} as const;

// Utility functions để get configurations
export const getVirtualThreshold = (type: 'boards' | 'stickers' | 'comments') => {
  return getEnvironmentConfig().thresholds[type];
};

export const getPageSize = (type: 'boards' | 'stickers' | 'comments') => {
  return getEnvironmentConfig().pageSizes[type];
};

export const getInitialLoad = (type: 'boards' | 'stickers' | 'comments') => {
  return getEnvironmentConfig().initialLoads[type];
};

export const getItemHeight = (type: 'board' | 'sticker' | 'comment') => {
  return VIRTUAL_SCROLLING_CONFIG.itemHeights[type];
};

// Environment-based configurations
export const getEnvironmentConfig = () => {
  // Luôn luôn sử dụng thresholds thấp cho testing
  return {
    ...VIRTUAL_SCROLLING_CONFIG,
    thresholds: {
      boards: 5,     // Chỉ cần 5 boards để test
      stickers: 3,   // Chỉ cần 3 stickers để test  
      comments: 5,   // Chỉ cần 5 comments để test
    },
  };
}; 