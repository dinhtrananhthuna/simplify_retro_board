#!/usr/bin/env node

/**
 * Script để debug infinite loops trong React components
 * Chạy: node scripts/debug-infinite-loop.js
 */

const fs = require('fs');
const path = require('path');

// Danh sách các patterns thường gây infinite loop
const LOOP_PATTERNS = [
  {
    name: 'useEffect với dependency function không stable',
    pattern: /useEffect\([^)]+\[.*\]/g,
    severity: 'high'
  },
  {
    name: 'useCallback/useMemo với unstable dependency',
    pattern: /(useCallback|useMemo)\([^)]+\[.*\]/g,
    severity: 'medium'
  },
  {
    name: 'State update trong render',
    pattern: /setState?\([^)]*\)[^;}]*(?!\s*})/g,
    severity: 'high'
  },
  {
    name: 'Fetch trong useEffect không có dependency array',
    pattern: /useEffect\(\s*\(\)\s*=>\s*{[^}]*fetch[^}]*}\s*\)/g,
    severity: 'high'
  }
];

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  LOOP_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern.pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          file: filePath,
          pattern: pattern.name,
          severity: pattern.severity,
          code: match.substring(0, 100) + '...',
          line: content.substring(0, content.indexOf(match)).split('\n').length
        });
      });
    }
  });
  
  return issues;
}

function scanDirectory(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function generateReport() {
  console.log('🔍 Scanning cho infinite loop patterns...\n');
  
  const sourceFiles = scanDirectory(path.join(__dirname, '../src'));
  const allIssues = [];
  
  sourceFiles.forEach(file => {
    const issues = analyzeFile(file);
    allIssues.push(...issues);
  });
  
  // Group by severity
  const highSeverity = allIssues.filter(i => i.severity === 'high');
  const mediumSeverity = allIssues.filter(i => i.severity === 'medium');
  
  console.log('📊 Kết quả scan:');
  console.log(`High priority issues: ${highSeverity.length}`);
  console.log(`Medium priority issues: ${mediumSeverity.length}`);
  console.log('');
  
  if (highSeverity.length > 0) {
    console.log('🚨 HIGH PRIORITY ISSUES:');
    highSeverity.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}:${issue.line}`);
      console.log(`   Pattern: ${issue.pattern}`);
      console.log(`   Code: ${issue.code}`);
      console.log('');
    });
  }
  
  if (mediumSeverity.length > 0) {
    console.log('⚠️  MEDIUM PRIORITY ISSUES:');
    mediumSeverity.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}:${issue.line}`);
      console.log(`   Pattern: ${issue.pattern}`);
      console.log(`   Code: ${issue.code}`);
      console.log('');
    });
  }
  
  // Specific advice cho common issues
  console.log('💡 KHUYẾN NGHỊ:');
  console.log('1. Wrap functions trong useCallback để stable dependencies');
  console.log('2. Chỉ include primitive values trong dependency arrays');
  console.log('3. Sử dụng useRef cho values không cần trigger re-render');
  console.log('4. Tránh setState trong render function');
  console.log('5. Sử dụng functional updates cho state based trên previous state');
  
  return allIssues.length;
}

// Performance monitoring helper
function createPerformanceLogger() {
  let renderCount = 0;
  let lastRenderTime = Date.now();
  
  return {
    logRender: (componentName) => {
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime;
      renderCount++;
      
      if (timeSinceLastRender < 100 && renderCount > 10) {
        console.warn(`⚠️ Potential infinite loop detected in ${componentName}`);
        console.warn(`Render count: ${renderCount}, Time since last: ${timeSinceLastRender}ms`);
      }
      
      lastRenderTime = now;
    },
    reset: () => {
      renderCount = 0;
      lastRenderTime = Date.now();
    }
  };
}

// Export for use in components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createPerformanceLogger };
}

// Run analysis if script is executed directly
if (require.main === module) {
  const issueCount = generateReport();
  process.exit(issueCount > 0 ? 1 : 0);
} 