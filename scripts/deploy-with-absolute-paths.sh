#!/bin/bash

# Deploy with Absolute Paths Script
# Uses absolute paths for all Prisma commands
# Usage: ./deploy-with-absolute-paths.sh

echo "🚀 Deploying with absolute paths..."

# Define absolute paths
PROJECT_DIR="/home/oyhumgag/retroboard"
SCHEMA_PATH="/home/oyhumgag/retroboard/prisma/schema.prisma"
ENV_FILE="/home/oyhumgag/retroboard/.env.production"

# Navigate to project directory
cd $PROJECT_DIR

echo "📂 Working in: $(pwd)"
echo "📄 Schema path: $SCHEMA_PATH"
echo "🔧 Environment: $ENV_FILE"

# Check if files exist
echo ""
echo "🔍 Checking required files..."

if [ -f "$SCHEMA_PATH" ]; then
    echo "✅ Schema found: $SCHEMA_PATH"
    echo "📏 Size: $(wc -l < $SCHEMA_PATH) lines"
else
    echo "❌ Schema not found: $SCHEMA_PATH"
    exit 1
fi

if [ -f "$ENV_FILE" ]; then
    echo "✅ Environment file found: $ENV_FILE"
else
    echo "⚠️  Environment file not found: $ENV_FILE"
    echo "📝 Creating template..."
    cat > $ENV_FILE << 'EOF'
# Add your Neon PostgreSQL connection string here
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://kaitovu.io.vn/retroboard"

# Ably Configuration
ABLY_API_KEY="your-ably-api-key"

# Environment
NODE_ENV="production"
EOF
    echo "✅ Template created. Please edit with real values."
fi

# Set environment
export NODE_ENV=production

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    echo "🔧 Loading environment variables..."
    export $(grep -v '^#' $ENV_FILE | xargs)
fi

echo ""
echo "🔄 Step 1: Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "🔄 Step 2: Validating Prisma schema..."
npx prisma validate --schema=$SCHEMA_PATH

if [ $? -ne 0 ]; then
    echo "❌ Schema validation failed!"
    exit 1
fi

echo ""
echo "🔄 Step 3: Generating Prisma client..."
npx prisma generate --schema=$SCHEMA_PATH

if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed!"
    exit 1
fi

echo ""
echo "🔄 Step 4: Deploying database migrations..."
npx prisma migrate deploy --schema=$SCHEMA_PATH

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed!"
    echo "💡 Check your DATABASE_URL in $ENV_FILE"
    exit 1
fi

echo ""
echo "🔄 Step 5: Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🔄 Step 6: Starting with PM2..."
pm2 delete retroboard 2>/dev/null || true
pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    echo "✅ Application started successfully!"
    echo "🌐 URL: https://kaitovu.io.vn/retroboard"
    
    # Show PM2 status
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
    # Show logs
    echo ""
    echo "📋 Recent logs:"
    pm2 logs retroboard --lines 10 --nostream
else
    echo "❌ Failed to start with PM2!"
    exit 1
fi

echo ""
echo "🎯 Deployment completed!"
echo "📁 Project: $PROJECT_DIR"
echo "📄 Schema: $SCHEMA_PATH"
echo "🔧 Environment: $ENV_FILE"
echo "🌐 URL: https://kaitovu.io.vn/retroboard"

echo ""
echo "🔧 Useful commands:"
echo "pm2 logs retroboard    # View logs"
echo "pm2 restart retroboard # Restart app"
echo "pm2 stop retroboard    # Stop app" 