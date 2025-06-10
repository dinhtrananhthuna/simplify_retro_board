const fs = require('fs');
const path = require('path');

// Bundle size limits (in KB)
const LIMITS = {
  page: 20, // Max page bundle size
  firstLoad: 200, // Max first load JS
  chunk: 100, // Max individual chunk
};

function parseNextBuildOutput() {
  const buildOutputFile = path.join('.next', 'build-manifest.json');
  
  if (!fs.existsSync(buildOutputFile)) {
    console.error('❌ Build manifest not found. Run npm run build first.');
    process.exit(1);
  }

  try {
    // Parse .next/build-manifest.json for bundle info
    const manifest = JSON.parse(fs.readFileSync(buildOutputFile, 'utf8'));
    
    // Also check for static files
    const staticDir = path.join('.next', 'static');
    let totalBundleSize = 0;
    let violations = [];

    // Check static chunks
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(staticDir, { recursive: true });
      
      chunks.forEach(chunk => {
        if (chunk.endsWith('.js')) {
          const chunkPath = path.join(staticDir, chunk);
          const stats = fs.statSync(chunkPath);
          const sizeKB = Math.round(stats.size / 1024);
          totalBundleSize += sizeKB;
          
          if (sizeKB > LIMITS.chunk) {
            violations.push({
              type: 'chunk',
              name: chunk,
              size: sizeKB,
              limit: LIMITS.chunk
            });
          }
        }
      });
    }

    // Simulate page bundle checks (would need actual Next.js output parsing)
    const mockPageBundles = [
      { name: 'boards/[boardId]', size: 27.8 },
      { name: 'profile', size: 3.27 },
      { name: 'dashboard', size: 8.01 },
      { name: 'homepage', size: 4.83 }
    ];

    mockPageBundles.forEach(page => {
      if (page.size > LIMITS.page) {
        violations.push({
          type: 'page',
          name: page.name,
          size: page.size,
          limit: LIMITS.page
        });
      }
    });

    return { totalBundleSize, violations };
  } catch (error) {
    console.error('❌ Error parsing build output:', error.message);
    process.exit(1);
  }
}

function formatSize(sizeKB) {
  if (sizeKB > 1024) {
    return `${(sizeKB / 1024).toFixed(2)} MB`;
  }
  return `${sizeKB} KB`;
}

function main() {
  console.log('🔍 Checking bundle sizes...\n');

  const { totalBundleSize, violations } = parseNextBuildOutput();

  // Report violations
  if (violations.length > 0) {
    console.log('⚠️  Bundle size violations found:\n');
    
    violations.forEach(violation => {
      const emoji = violation.type === 'page' ? '📄' : '📦';
      console.log(
        `${emoji} ${violation.name}: ${formatSize(violation.size)} ` +
        `(limit: ${formatSize(violation.limit)})`
      );
    });
    
    console.log('\n💡 Recommendations:');
    console.log('   • Split large components with lazy loading');
    console.log('   • Remove unused dependencies');
    console.log('   • Use dynamic imports for heavy libraries');
    console.log('   • Consider lighter alternatives for large packages');
    
    console.log('\n📊 Performance Impact:');
    console.log('   • Large bundles increase page load time');
    console.log('   • Mobile users on slow networks are most affected');
    console.log('   • Consider implementing code splitting');
    
    process.exit(1);
  } else {
    console.log('✅ All bundle sizes are within limits!');
    console.log(`📊 Total bundle size: ${formatSize(totalBundleSize)}`);
  }

  // Performance tips
  console.log('\n🚀 Performance tips:');
  console.log('   • Enable compression in production');
  console.log('   • Use service workers for caching');
  console.log('   • Optimize images and fonts');
  console.log('   • Monitor Core Web Vitals regularly');
}

if (require.main === module) {
  main();
}

module.exports = { parseNextBuildOutput, formatSize }; 