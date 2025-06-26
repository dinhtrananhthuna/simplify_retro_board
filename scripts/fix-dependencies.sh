#!/bin/bash

# Fix Dependencies Script
# Resolves React 19 conflicts with testing libraries
# Usage: ./fix-dependencies.sh

echo "🔧 Fixing dependency conflicts..."

# Stop any running PM2 processes
pm2 stop retro-board 2>/dev/null || echo "No PM2 process to stop"

# Navigate to project directory
cd /home/oyhumgag/retroboard

# Clean all npm cache and node_modules
echo "🧹 Cleaning npm cache and node_modules..."
rm -rf node_modules package-lock.json
npm cache clean --force

# Create .npmrc for legacy peer deps
echo "📝 Creating .npmrc with legacy peer deps..."
cat > .npmrc << EOF
legacy-peer-deps=true
EOF

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    
    # Generate Prisma client
    echo "🗄️ Generating Prisma client..."
    
    # Ensure Prisma CLI is available
    if ! npm list prisma > /dev/null 2>&1; then
        echo "📦 Installing Prisma CLI..."
        npm install prisma @prisma/client --save-dev
    fi
    
    # Generate with explicit schema path
    npx prisma generate --schema=./prisma/schema.prisma
    
    # Try building
    echo "🏗️ Testing build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        echo "🚀 You can now start the application"
    else
        echo "⚠️ Build failed, but dependencies are installed"
        echo "📖 Check build errors and fix if needed"
    fi
else
    echo "❌ Installation failed, trying with --force..."
    npm install --force
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed with --force!"
    else
        echo "❌ Installation still failed"
        echo "📖 Manual intervention required"
        exit 1
    fi
fi

echo ""
echo "📋 Next steps:"
echo "1. Check: npm run build"
echo "2. Start: pm2 start ecosystem.config.js"
echo "3. Monitor: pm2 logs retro-board" 