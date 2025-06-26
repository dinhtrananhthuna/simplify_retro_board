# Hướng Dẫn Deploy Retrospective Board - Simplified Version

> **Dành cho VPS đã setup sẵn security + Domain có SSL + Neon Database**

## ✅ Prerequisites Đã Có
- VPS với security setup
- Domain với SSL certificate
- Neon PostgreSQL database
- Node.js 18+ installed

## 🚀 Quick Deployment Steps

### Bước 1: Clone và Setup Project

```bash
# Clone project
cd /opt
sudo git clone https://github.com/your-username/simplify_retro_board.git
sudo chown -R $USER:$USER simplify_retro_board
cd simplify_retro_board

# Install dependencies
npm install
```

### Bước 2: Environment Configuration

```bash
nano .env.production
```

**Nội dung `.env.production`:**
```env
# Neon Database (lấy connection string từ Neon dashboard)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-very-secure-random-secret-string-minimum-32-characters"

# Application
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NODE_ENV="production"

# Ably (nếu sử dụng real-time features)
NEXT_PUBLIC_ABLY_KEY="your_ably_key"
ABLY_SERVER_KEY="your_ably_server_key"
```

**📝 Lấy Neon Connection String:**
1. Vào [Neon Console](https://console.neon.tech)
2. Chọn project → Settings → Connection Details
3. Copy connection string có format: `postgresql://user:pass@host/dbname?sslmode=require`

### Bước 3: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Verify connection
npx prisma db push
```

### Bước 4: Build Application

```bash
# Build for production
npm run build

# Test local
npm start
# Kiểm tra http://localhost:3000 có hoạt động không
```

### Bước 5: PM2 Configuration

**Tạo PM2 config:**
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'retro-board',
    script: 'npm',
    args: 'start',
    cwd: '/opt/simplify_retro_board',
    instances: 1, // Start với 1 instance, scale sau
    exec_mode: 'fork', // Fork mode cho single instance
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

**Start với PM2:**
```bash
# Tạo logs directory
mkdir logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup auto-start on boot
pm2 startup
# Follow the command PM2 suggests

# Check status
pm2 status
pm2 logs retro-board
```

### Bước 6: Nginx Configuration Update

**Update existing Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/your-existing-config
```

**Thêm location block cho app:**
```nginx
server {
    # ... existing SSL và domain config ...
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files optimization
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 7: Test Deployment

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs retro-board

# Check if domain accessible
curl -I https://your-domain.com

# Check specific endpoints
curl https://your-domain.com/api/auth/signin
```

## 🔄 Auto Deployment Script

**Tạo deploy script cho updates sau này:**
```bash
nano deploy.sh
```

```bash
#!/bin/bash
echo "🚀 Starting deployment..."

# Navigate to project
cd /opt/simplify_retro_board

# Backup current version
cp .env.production .env.backup

# Pull latest changes
git pull origin master

# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Build application
npm run build

# Restart PM2
pm2 reload retro-board

# Check status
pm2 status

echo "✅ Deployment completed!"
echo "🌐 Check: https://your-domain.com"
```

```bash
chmod +x deploy.sh
```

## 📊 Monitoring Commands

```bash
# PM2 monitoring
pm2 status                    # Check app status
pm2 logs retro-board          # View logs
pm2 monit                     # Real-time monitoring
pm2 restart retro-board       # Restart if needed

# System monitoring
top                           # Check CPU/Memory
df -h                         # Check disk space
free -h                       # Check memory usage

# Nginx monitoring
sudo tail -f /var/log/nginx/access.log    # Access logs
sudo tail -f /var/log/nginx/error.log     # Error logs
```

## ⚡ Performance Optimization

**Neon Database Optimization:**
```bash
# Connection pooling trong Prisma
nano prisma/schema.prisma
```

Update datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: cho migrations
}
```

**PM2 Scaling (khi cần):**
```bash
# Scale to multiple instances
pm2 scale retro-board 2

# Monitor performance
pm2 monit
```

## 🔧 Troubleshooting

### 1. Database Connection Issues
```bash
# Test connection từ VPS
psql "postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Check Prisma connection
npx prisma db pull
```

### 2. Build Failures
```bash
# Clear và rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### 3. PM2 Issues
```bash
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

### 4. Domain Not Working
```bash
# Check Nginx config
sudo nginx -t

# Check PM2 status
pm2 status

# Check port 3000 usage
netstat -tulpn | grep :3000
```

## 📱 Mobile/API Testing

```bash
# Test mobile responsiveness
curl -A "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" https://your-domain.com

# Test API endpoints
curl -X GET https://your-domain.com/api/boards
curl -X POST https://your-domain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## ✅ Final Checklist

- [ ] Environment variables configured với Neon DB
- [ ] `npm run build` thành công
- [ ] PM2 running stable
- [ ] Nginx reverse proxy working
- [ ] Domain accessible qua HTTPS
- [ ] Database migrations applied
- [ ] Real-time features working (nếu có)
- [ ] Performance acceptable (< 3s load time)

---

## 🎉 Deployment Complete!

**Your Retrospective Board is live at:** `https://your-domain.com`

**Quick commands:**
- Deploy updates: `./deploy.sh`
- Check logs: `pm2 logs retro-board`
- Monitor: `pm2 monit`

**Neon Dashboard:** Monitor database usage tại [Neon Console](https://console.neon.tech) 