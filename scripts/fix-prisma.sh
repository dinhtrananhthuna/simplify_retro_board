#!/bin/bash

# Fix Prisma Issues Script
# Handles "prisma: command not found" and schema path issues
# Usage: ./fix-prisma.sh

echo "🔧 Fixing Prisma setup..."

# Navigate to project directory
cd /home/oyhumgag/retroboard

# Check current state
echo "📂 Current directory: $(pwd)"
echo "📂 Contents:"
ls -la

# Check if schema exists and its content
echo ""
echo "🔍 Checking Prisma setup..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Schema file exists: prisma/schema.prisma"
    echo "📏 File size: $(wc -l < prisma/schema.prisma) lines"
    echo "📝 Schema preview (first 10 lines):"
    head -10 prisma/schema.prisma
else
    echo "❌ Schema file missing!"
    echo "🛠️  Creating schema file..."
    
    # Create directory if not exists
    mkdir -p prisma
    
    # Copy schema from repository source
    if [ -f "../simplify_retro_board/prisma/schema.prisma" ]; then
        cp ../simplify_retro_board/prisma/schema.prisma prisma/
        echo "✅ Schema copied from source"
    else
        echo "⚠️  Source schema not found, creating basic schema..."
        cat > prisma/schema.prisma << 'EOF'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Basic models will be added via migrations
EOF
    fi
fi

echo ""
echo "🔍 Checking Prisma CLI availability..."

# Check if prisma is available locally
if npm list prisma &>/dev/null; then
    echo "✅ Prisma installed locally"
    PRISMA_CMD="npx prisma"
else
    echo "⚠️  Prisma not found locally, installing..."
    npm install prisma@latest --save-dev
    PRISMA_CMD="npx prisma"
fi

# Check if @prisma/client is available
if npm list @prisma/client &>/dev/null; then
    echo "✅ @prisma/client installed"
else
    echo "⚠️  @prisma/client not found, installing..."
    npm install @prisma/client@latest
fi

echo ""
echo "🔄 Testing Prisma commands with explicit schema path..."

# Test 1: Prisma version
echo "📋 Prisma version:"
$PRISMA_CMD --version

# Test 2: Schema validation with explicit path
echo ""
echo "📋 Validating schema..."
$PRISMA_CMD validate --schema=./prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo "✅ Schema validation passed"
else
    echo "❌ Schema validation failed"
    echo "🔍 Debugging schema issues..."
    
    # Check file permissions
    ls -la prisma/schema.prisma
    
    # Try to read schema content
    echo "📄 Schema content:"
    cat prisma/schema.prisma
fi

# Test 3: Generate client with explicit path
echo ""
echo "🔄 Generating Prisma client..."
$PRISMA_CMD generate --schema=./prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated successfully!"
    
    # Check generated client
    if [ -d "node_modules/.prisma/client" ]; then
        echo "✅ Client files exist in node_modules/.prisma/client"
    fi
    
else
    echo "❌ Prisma client generation failed"
    echo "🔍 Checking environment..."
    
    # Check Node.js version
    echo "📋 Node version: $(node --version)"
    echo "📋 NPM version: $(npm --version)"
    
    # Check if DATABASE_URL is set
    if [ -f ".env.production" ]; then
        echo "✅ .env.production exists"
        if grep -q "DATABASE_URL" .env.production; then
            echo "✅ DATABASE_URL found in .env.production"
        else
            echo "⚠️  DATABASE_URL not found in .env.production"
        fi
    else
        echo "⚠️  .env.production not found"
        echo "📝 Creating template .env.production..."
        cat > .env.production << 'EOF'
# Add your Neon PostgreSQL connection string here
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://kaitovu.io.vn/retroboard"

# Ably Configuration
ABLY_API_KEY="your-ably-api-key"
EOF
    fi
fi

echo ""
echo "🎯 Summary:"
echo "📁 Schema location: $(pwd)/prisma/schema.prisma"
echo "🔧 Prisma command: $PRISMA_CMD"
echo "📦 Use explicit paths: --schema=./prisma/schema.prisma"

echo ""
echo "🚀 Next steps:"
echo "1. Verify .env.production has correct DATABASE_URL"
echo "2. Run: $PRISMA_CMD migrate deploy --schema=./prisma/schema.prisma"
echo "3. Run: npm run build"
echo "4. Run: pm2 start ecosystem.config.js"

echo ""
echo "🔧 Quick commands for deployment:"
echo "export NODE_ENV=production"
echo "$PRISMA_CMD migrate deploy --schema=./prisma/schema.prisma"
echo "npm run build" 