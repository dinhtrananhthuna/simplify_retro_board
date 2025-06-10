module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/auth/signin',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/boards/demo-board-id'
      ],
      startServerCommand: 'npm run start',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-input-delay': ['warn', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        
        // Performance metrics
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        
        // Bundle size and loading
        'unused-javascript': ['warn', { maxLength: 5 }],
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',
        'modern-image-formats': 'warn',
        'efficient-animated-content': 'warn',
        
        // Network and caching
        'uses-long-cache-ttl': 'warn',
        'total-byte-weight': ['warn', { maxNumericValue: 1600000 }], // 1.6MB
        'dom-size': ['warn', { maxNumericValue: 1500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: './lighthouse-reports',
    },
  },
}; 