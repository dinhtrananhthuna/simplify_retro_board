# VPS Cleanup & Structure Fix Commands

## 🧹 Cleanup Existing Structure

```bash
# Stop any running PM2 processes
pm2 kill

# Navigate to /opt
cd /opt

# Remove unnecessary files/folders
sudo rm -rf public/           # Không cần public folder ở đây
sudo rm -rf tmp/             # Temporary folder
sudo rm -f app.js            # File không thuộc dự án
sudo rm -f stderr.log        # Old log file

# Check what's left
ls -la
```

## ✅ Verify Project Structure

```bash
# Enter project directory
cd /opt/simplify_retro_board

# Check project files exist
ls -la
# Should see: src/, package.json, next.config.js, etc.

# Check if this is correct Next.js project
cat package.json | grep "next"
# Should show Next.js dependency
```

## 🔧 Setup Project Correctly

```bash
# Still in /opt/simplify_retro_board
pwd  # Should show: /opt/simplify_retro_board

# Install dependencies
npm install

# Create environment file
nano .env.production
```

**Environment file content:**
```env
# Neon Database
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-very-secure-random-secret-string-minimum-32-characters"

# Application
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NODE_ENV="production"
```

## 🚀 Continue Deployment

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Create PM2 config
nano ecosystem.config.js
```

**PM2 config content:**
```javascript
module.exports = {
  apps: [{
    name: 'retro-board',
    script: 'npm',
    args: 'start',
    cwd: '/opt/simplify_retro_board',
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
    max_memory_restart: '1G'
  }]
}
```

```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup auto-start
pm2 startup
```

## 🌐 Final Structure Check

After cleanup, your `/opt` should look like:
```
/opt/
└── simplify_retro_board/
    ├── .env.production
    ├── .next/                 # Build output
    ├── ecosystem.config.js
    ├── logs/
    ├── node_modules/
    ├── package.json
    ├── public/               # Next.js public assets
    ├── src/
    └── ... other project files
```

## 🔍 Verification Commands

```bash
# Check PM2 status
pm2 status

# Check application is responding
curl http://localhost:3000

# Check logs for any errors
pm2 logs retro-board

# Test application locally
curl -I http://localhost:3000
``` 