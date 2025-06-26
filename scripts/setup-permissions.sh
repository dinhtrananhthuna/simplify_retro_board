#!/bin/bash

# Setup Permissions Script for VPS
# Run this ONCE to setup proper permissions for deployment
# Usage: ./setup-permissions.sh

echo "🔧 Setting up deployment permissions..."

# Configuration
DEPLOY_DIR="/home/oyhumgag/retroboard"

# Ensure deploy directory exists and is owned by current user
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📁 Creating deploy directory: $DEPLOY_DIR"
    mkdir -p $DEPLOY_DIR
fi

# Change ownership of deploy directory to current user (if needed)
if [ ! -w "$DEPLOY_DIR" ]; then
    echo "👤 Setting ownership of $DEPLOY_DIR to current user..."
    sudo chown -R $USER:$USER $DEPLOY_DIR
fi

# Set proper permissions
echo "🔒 Setting proper permissions..."
chmod -R 755 $DEPLOY_DIR

# Verify permissions
echo "✅ Verifying permissions..."
ls -la $DEPLOY_DIR

if [ -w "$DEPLOY_DIR" ]; then
    echo "✅ Permission setup completed successfully!"
    echo "📝 You can now run auto-deploy.sh without sudo"
else
    echo "❌ Permission setup failed"
    echo "🔧 Try running this script with sudo: sudo ./setup-permissions.sh"
    exit 1
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    sudo npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi

echo ""
echo "🎉 Setup completed! You can now:"
echo "   1. Run: ~/auto-deploy.sh (without sudo)"
echo "   2. Manage: pm2 status, pm2 logs, pm2 restart"
echo "   3. Deploy: Just run ~/auto-deploy.sh anytime" 