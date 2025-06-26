# Hướng Dẫn Deploy Retrospective Board Lên VPS

## 📋 Yêu Cầu Hệ Thống

### VPS Minimum Requirements
- **RAM**: 2GB (khuyến nghị 4GB)
- **CPU**: 2 cores
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04/22.04 LTS hoặc CentOS 8+

### Phần Mềm Cần Cài Đặt
- Node.js 18+ (khuyến nghị 20 LTS)
- npm hoặc yarn
- PM2 (process manager)
- Nginx (reverse proxy)
- SQL Server hoặc PostgreSQL
- SSL Certificate (Let's Encrypt)

## 🛠️ Bước 1: Chuẩn Bị VPS

### 1.1 Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git -y
```

### 1.2 Cài đặt Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify installation
npm --version
```

### 1.3 Cài đặt PM2
```bash
sudo npm install -g pm2
pm2 --version
```

### 1.4 Cài đặt Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🗄️ Bước 2: Cài Đặt Database

### Option A: PostgreSQL (Khuyến nghị)
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Tạo database và user
sudo -u postgres psql
CREATE DATABASE retro_board;
CREATE USER retro_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE retro_board TO retro_user;
\q
```

### Option B: SQL Server (như hiện tại)
```bash
# Cài đặt SQL Server 2019/2022 trên Ubuntu
# Follow Microsoft official guide
```

## 📦 Bước 3: Deploy Application

### 3.1 Clone và setup project
```bash
cd /opt
sudo git clone https://github.com/your-username/simplify_retro_board.git
sudo chown -R $USER:$USER simplify_retro_board
cd simplify_retro_board
```

### 3.2 Cài đặt dependencies
```bash
npm install
```

### 3.3 Tạo environment variables
```bash
sudo nano .env.production
```

Nội dung `.env.production`:
```env
# Database
DATABASE_URL="postgresql://retro_user:your_secure_password@localhost:5432/retro_board"
# Hoặc SQL Server: "sqlserver://localhost:1433;database=retro_board;username=sa;password=your_password;encrypt=true;trustServerCertificate=true"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-very-secure-random-secret-string-minimum-32-characters"

# Application
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NODE_ENV="production"

# Ably (nếu sử dụng)
NEXT_PUBLIC_ABLY_KEY="your_ably_key"
ABLY_SERVER_KEY="your_ably_server_key"
```

### 3.4 Setup database
```bash
npx prisma migrate deploy
npx prisma generate
```

### 3.5 Build application
```bash
npm run build
```

### 3.6 Test application
```bash
npm start
# Test trên http://localhost:3000
```

## 🔧 Bước 4: Cấu Hình PM2

### 4.1 Tạo PM2 ecosystem file
```bash
nano ecosystem.config.js
```

Nội dung:
```javascript
module.exports = {
  apps: [{
    name: 'retro-board',
    script: 'npm',
    args: 'start',
    cwd: '/opt/simplify_retro_board',
    instances: 2,
    exec_mode: 'cluster',
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

### 4.2 Tạo thư mục logs
```bash
mkdir logs
```

### 4.3 Start application với PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Bước 5: Cấu Hình Nginx

### 5.1 Tạo Nginx config
```bash
sudo nano /etc/nginx/sites-available/retro-board
```

Nội dung:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (sẽ setup sau)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

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
    }
}
```

### 5.2 Enable site
```bash
sudo ln -s /etc/nginx/sites-available/retro-board /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Bước 6: SSL Certificate

### 6.1 Cài đặt Certbot
```bash
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 6.2 Lấy SSL certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 6.3 Auto-renewal
```bash
sudo crontab -e
# Thêm dòng:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔥 Bước 7: Firewall Setup

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

## 📊 Bước 8: Monitoring & Logs

### 8.1 PM2 monitoring
```bash
pm2 monitor
pm2 logs retro-board
pm2 status
```

### 8.2 Nginx logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 8.3 Setup log rotation
```bash
sudo nano /etc/logrotate.d/retro-board
```

## 🚀 Bước 9: Domain & DNS

### 9.1 Cấu hình DNS
Tại nhà cung cấp domain, tạo A record:
```
A    your-domain.com    YOUR_VPS_IP
A    www.your-domain.com    YOUR_VPS_IP
```

### 9.2 Kiểm tra
```bash
nslookup your-domain.com
ping your-domain.com
```

## 🔄 Bước 10: Auto Deployment (Optional)

### 10.1 Tạo deploy script
```bash
nano deploy.sh
```

```bash
#!/bin/bash
echo "🚀 Starting deployment..."

cd /opt/simplify_retro_board
git pull origin master
npm install
npm run build
npx prisma migrate deploy
pm2 reload retro-board

echo "✅ Deployment completed!"
```

```bash
chmod +x deploy.sh
```

## 🧪 Bước 11: Testing

### 11.1 Kiểm tra các chức năng
- [ ] User registration/login
- [ ] Board creation & management  
- [ ] Sticker CRUD operations
- [ ] Real-time updates
- [ ] Invite system

### 11.2 Performance test
```bash
# Install lighthouse
npm install -g lighthouse

# Test performance
lighthouse https://your-domain.com --view
```

## 🔧 Troubleshooting

### Common Issues

1. **Build fails**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

2. **Database connection errors**
```bash
# Check database status
sudo systemctl status postgresql
# Check connection string trong .env
```

3. **PM2 app crashes**
```bash
pm2 logs retro-board
pm2 restart retro-board
```

4. **Nginx 502 Bad Gateway**
```bash
# Check if app is running
pm2 status
# Check nginx config
sudo nginx -t
```

## 📈 Performance Optimization

### 1. Enable HTTP/2
```nginx
# Đã có trong config nginx ở trên
listen 443 ssl http2;
```

### 2. Enable compression
```nginx
# Đã có gzip config ở trên
```

### 3. Static file caching
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔒 Security Checklist

- [ ] Strong database passwords
- [ ] Regular security updates
- [ ] Fail2ban cho SSH protection  
- [ ] Regular backups
- [ ] Monitoring setup
- [ ] SSL certificate auto-renewal

## 📝 Maintenance Tasks

### Daily
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs retro-board`

### Weekly  
- Security updates: `sudo apt update && sudo apt upgrade`
- Check disk space: `df -h`

### Monthly
- Database backup
- SSL certificate check: `sudo certbot certificates`
- Performance review

---

## 🎉 Hoàn Thành!

Retrospective Board của bạn giờ đã sẵn sàng production tại `https://your-domain.com`

**Support**: Nếu gặp vấn đề, check PM2 logs và Nginx error logs trước. 