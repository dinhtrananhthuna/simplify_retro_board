#!/bin/bash

# Auto Deploy Script for VPS
# Usage: ./auto-deploy.sh

set -e  # Exit on any error

echo "🚀 Starting auto-deployment..."

# Configuration
REPO_URL="https://github.com/your-username/simplify_retro_board.git"
DEPLOY_DIR="/opt"
TEMP_DIR="/tmp/simplify_retro_board_deploy"

# Stop PM2 if running
echo "📛 Stopping current application..."
pm2 stop retro-board 2>/dev/null || echo "No PM2 process to stop"

# Backup current deployment
echo "💾 Creating backup..."
if [ -f "$DEPLOY_DIR/package.json" ]; then
    sudo cp -r $DEPLOY_DIR $DEPLOY_DIR.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
fi

# Clean temp directory
echo "🧹 Cleaning temp directory..."
sudo rm -rf $TEMP_DIR

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
sudo find . -maxdepth 1 ! -name logs ! -name . ! -name .. -exec rm -rf {} + 2>/dev/null || true

# Move files from temp to deployment directory
echo "📦 Moving files to deployment directory..."
sudo mv $TEMP_DIR/* $DEPLOY_DIR/
sudo mv $TEMP_DIR/.* $DEPLOY_DIR/ 2>/dev/null || true

# Restore environment file
if [ -f "/tmp/.env.production.backup" ]; then
    echo "🔄 Restoring environment file..."
    cp /tmp/.env.production.backup $DEPLOY_DIR/.env.production
else
    echo "⚠️  No existing .env.production found. You need to create it!"
    echo "📖 Check docs/ENV_TEMPLATE.md for instructions"
fi

# Fix ownership
echo "🔧 Fixing ownership..."
sudo chown -R $USER:$USER $DEPLOY_DIR/*

# Install dependencies
echo "📦 Installing dependencies..."
cd $DEPLOY_DIR
npm install

# Database operations
echo "🗄️ Running database operations..."
if [ -f ".env.production" ]; then
    npx prisma generate
    npx prisma migrate deploy
else
    echo "⚠️  Skipping database operations - no .env.production file"
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
    cwd: '/opt',
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
sudo rm -rf $TEMP_DIR
rm -f /tmp/.env.production.backup

# Show status
echo "📊 Application status:"
pm2 status

echo "✅ Deployment completed!"
if [ -f ".env.production" ]; then
    echo "🌐 Check: https://kaitovu.io.vn/retroboard"
else
    echo "⚠️  Remember to create .env.production and start PM2"
fi 