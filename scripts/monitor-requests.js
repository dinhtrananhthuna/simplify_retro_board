#!/usr/bin/env node

/**
 * Script để monitor API requests và phát hiện infinite loops
 * Chạy: node scripts/monitor-requests.js
 */

const http = require('http');
const url = require('url');

// Track request frequencies
const requestTracker = new Map();
const LOOP_THRESHOLD = 5; // Số requests trong window
const TIME_WINDOW = 2000; // 2 giây

function trackRequest(endpoint) {
  const now = Date.now();
  if (!requestTracker.has(endpoint)) {
    requestTracker.set(endpoint, []);
  }
  
  const requests = requestTracker.get(endpoint);
  // Thêm request mới
  requests.push(now);
  
  // Xóa requests cũ ngoài time window
  const cutoff = now - TIME_WINDOW;
  const recentRequests = requests.filter(time => time > cutoff);
  requestTracker.set(endpoint, recentRequests);
  
  // Kiểm tra loop
  if (recentRequests.length > LOOP_THRESHOLD) {
    console.warn(`🚨 POTENTIAL LOOP DETECTED: ${endpoint}`);
    console.warn(`   ${recentRequests.length} requests in ${TIME_WINDOW}ms`);
    console.warn(`   Times: ${recentRequests.map(t => new Date(t).toISOString().split('T')[1]).join(', ')}`);
    return true;
  }
  
  return false;
}

function monitorRequests() {
  console.log('🔍 Starting API request monitor...');
  console.log(`Watching for > ${LOOP_THRESHOLD} requests per ${TIME_WINDOW}ms window\n`);
  
  // Intercept fetch requests để track
  if (typeof global !== 'undefined') {
    const originalFetch = global.fetch;
    global.fetch = function(...args) {
      const [input] = args;
      let endpoint = input;
      
      if (typeof input === 'object' && input.url) {
        endpoint = input.url;
      }
      
      // Extract path from URL
      try {
        const parsed = url.parse(endpoint);
        const path = parsed.pathname || endpoint;
        
        if (path.includes('/api/')) {
          const isLoop = trackRequest(path);
          if (!isLoop) {
            console.log(`📡 ${new Date().toISOString().split('T')[1].split('.')[0]} ${path}`);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      return originalFetch.apply(this, args);
    };
  }
}

function startHttpMonitor() {
  const PORT = 3001;
  
  const server = http.createServer((req, res) => {
    const endpoint = req.url;
    
    if (endpoint && endpoint.includes('/api/')) {
      const isLoop = trackRequest(endpoint);
      if (!isLoop) {
        console.log(`📡 ${new Date().toISOString().split('T')[1].split('.')[0]} ${endpoint}`);
      }
    }
    
    // Forward request thông qua proxy (simplified)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ monitoring: true }));
  });
  
  server.listen(PORT, () => {
    console.log(`🔍 HTTP Monitor running on port ${PORT}`);
    console.log('To monitor, access your app and watch console\n');
  });
}

function showStats() {
  console.log('\n📊 REQUEST STATISTICS:');
  console.log('='.repeat(50));
  
  Array.from(requestTracker.entries())
    .sort(([,a], [,b]) => b.length - a.length)
    .forEach(([endpoint, requests]) => {
      const recentCount = requests.filter(t => Date.now() - t < TIME_WINDOW).length;
      console.log(`${endpoint}: ${requests.length} total, ${recentCount} recent`);
    });
}

// Setup monitoring
monitorRequests();

// Show stats every 10 seconds
setInterval(showStats, 10000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping monitor...');
  showStats();
  process.exit(0);
});

console.log('Monitor active! Press Ctrl+C to stop');
console.log('Open your app at http://localhost:3000 and navigate to a board\n'); 