#!/bin/bash

# Auto Deploy Script for VPS
# Usage: ./auto-deploy.sh
# Note: Ensure user has write permissions to /opt directory

set -e  # Exit on any error

echo "🚀 Starting auto-deployment..."

# Configuration
REPO_URL="https://github.com/dinhtrananhthuna/simplify_retro_board.git"
DEPLOY_DIR="/home/oyhumgag/retroboard"
TEMP_DIR="/tmp/simplify_retro_board_deploy"

# Check if deploy directory exists, create if not
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📁 Creating deploy directory: $DEPLOY_DIR"
    mkdir -p $DEPLOY_DIR
fi

# Check if user has write permission to deploy directory
if [ ! -w "$DEPLOY_DIR" ]; then
    echo "❌ Error: No write permission to $DEPLOY_DIR"
    echo "🔧 Fix with: sudo chown -R $USER:$USER $DEPLOY_DIR"
    exit 1
fi

# Stop PM2 if running
echo "📛 Stopping current application..."
pm2 stop retro-board 2>/dev/null || echo "No PM2 process to stop"

# Backup current deployment
echo "💾 Creating backup..."
if [ -f "$DEPLOY_DIR/package.json" ]; then
    cp -r $DEPLOY_DIR $DEPLOY_DIR.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
fi

# Clean temp directory
echo "🧹 Cleaning temp directory..."
rm -rf $TEMP_DIR

# Clone to temp directory
echo "📥 Cloning repository..."
git clone $REPO_URL $TEMP_DIR

# Backup environment file if exists
if [ -f "$DEPLOY_DIR/.env.production" ]; then
    echo "💾 Backing up environment file..."
    cp $DEPLOY_DIR/.env.production /tmp/.env.production.backup
fi

# Clear deployment directory (keep logs)
echo "🧹 Clearing deployment directory..."
cd $DEPLOY_DIR
find . -maxdepth 1 ! -name logs ! -name . ! -name .. -exec rm -rf {} + 2>/dev/null || true

# Move files from temp to deployment directory
echo "📦 Moving files to deployment directory..."
mv $TEMP_DIR/* $DEPLOY_DIR/
mv $TEMP_DIR/.* $DEPLOY_DIR/ 2>/dev/null || true

# Restore environment file
if [ -f "/tmp/.env.production.backup" ]; then
    echo "🔄 Restoring environment file..."
    cp /tmp/.env.production.backup $DEPLOY_DIR/.env.production
else
    echo "⚠️  No existing .env.production found. You need to create it!"
    echo "📖 Check docs/ENV_TEMPLATE.md for instructions"
fi

# Ensure proper ownership (files should already be owned by current user)
echo "🔧 Ensuring proper permissions..."
chmod -R u+w $DEPLOY_DIR/* 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
cd $DEPLOY_DIR

# Clean previous installation
rm -rf node_modules package-lock.json

# Install with legacy peer deps to handle conflicts
npm install --legacy-peer-deps

# If above fails, try with force
if [ $? -ne 0 ]; then
    echo "⚠️  Standard install failed, trying with --force..."
    npm install --force
fi

# Database operations
# Database operations
echo "🗄️ Running database operations..."
if [ -f ".env.production" ]; then
    # Ensure Prisma is available
    if ! npm list @prisma/client > /dev/null 2>&1; then
        echo "📦 Installing Prisma client..."
        npm install @prisma/client
    fi
    
    # Generate Prisma client
    echo "🔄 Generating Prisma client..."
    npx prisma generate --schema=./prisma/schema.prisma
    
    # Run migrations
    echo "🗄️ Running database migrations..."
    npx prisma migrate deploy --schema=./prisma/schema.prisma
    
    echo "✅ Database operations completed"
else
    echo "⚠️  No .env.production file found - skipping database operations"
    echo "📖 Create .env.production first with DATABASE_URL"
fi

# Build application
echo "🏗️ Building application..."
npm run build

# Create logs directory if not exists
mkdir -p logs

# Check if ecosystem.config.js exists, if not create it
if [ ! -f "ecosystem.config.js" ]; then
    echo "📝 Creating ecosystem.config.js..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'retro-board',
    script: 'npm',
    args: 'start',
    cwd: '/home/oyhumgag/retroboard',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: [
      'node_modules',
      'logs',
      '.next'
    ]
  }]
}
EOF
    echo "✅ ecosystem.config.js created"
fi

# Start PM2
echo "🚀 Starting application..."
if [ -f ".env.production" ]; then
    pm2 start ecosystem.config.js
    # Save PM2 configuration
    pm2 save
    echo "✅ Application started successfully"
else
    echo "❌ Cannot start application - missing .env.production"
    echo "📖 Please create .env.production using docs/ENV_TEMPLATE.md"
    echo "🔧 Then run: pm2 start ecosystem.config.js"
fi

# Clean up
echo "🧹 Cleaning up..."
rm -rf $TEMP_DIR
rm -f /tmp/.env.production.backup

# Show status
echo "📊 Application status:"
pm2 status

echo "✅ Deployment completed!"
if [ -f ".env.production" ]; then
    echo "🌐 Check: https://kaitovu.io.vn/retroboard"
    echo "📂 Deployed to: $DEPLOY_DIR"
else
    echo "⚠️  Remember to create .env.production and start PM2"
    echo "📂 Deploy directory: $DEPLOY_DIR"
fi 