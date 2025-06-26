# Git Workflow for VPS Deployment

## 🎯 **3 Solutions for Git Clone Issue**

### **Solution 1: Clone Directly to `/opt/` (Simplest)**

#### **Initial Setup:**
```bash
# Remove existing structure
cd /opt
sudo rm -rf *

# Clone directly to current directory
sudo git clone https://github.com/your-username/simplify_retro_board.git .

# Fix ownership
sudo chown -R $USER:$USER /opt/*
```

#### **Future Updates:**
```bash
cd /opt
git pull origin master
npm install
npm run build
pm2 reload retro-board
```

---

### **Solution 2: Use Auto-Deploy Script (Recommended)**

#### **Setup script once:**
```bash
# Create deployment script
nano ~/auto-deploy.sh

# Copy content from scripts/auto-deploy.sh
chmod +x ~/auto-deploy.sh
```

#### **Usage:**
```bash
# Deploy anytime with single command
~/auto-deploy.sh
```

**Script does:**
- ✅ Clone to temp directory
- ✅ Move files to `/opt/`
- ✅ Backup environment
- ✅ Install dependencies
- ✅ Build & restart PM2
- ✅ Complete automation

---

### **Solution 3: Git Subtree/Sparse Checkout**

#### **For advanced users:**
```bash
cd /opt
sudo git init
sudo git remote add origin https://github.com/your-username/simplify_retro_board.git

# Configure sparse checkout (optional)
sudo git config core.sparseCheckout true
echo "src/" >> .git/info/sparse-checkout
echo "public/" >> .git/info/sparse-checkout
echo "package.json" >> .git/info/sparse-checkout

# Pull specific files
sudo git pull origin master
```

---

## 🚀 **Recommended Workflow**

### **Step 1: Initial Deployment**
```bash
# Use auto-deploy script for first time
cd ~
wget https://raw.githubusercontent.com/your-username/simplify_retro_board/master/scripts/auto-deploy.sh
chmod +x auto-deploy.sh
./auto-deploy.sh
```

### **Step 2: Environment Setup (One-time)**
```bash
cd /opt
nano .env.production
# Add your environment variables

# Create PM2 config
nano ecosystem.config.js
# Add PM2 configuration
```

### **Step 3: Future Deployments**
```bash
# Method A: Auto script
~/auto-deploy.sh

# Method B: Manual (if in /opt already)
cd /opt
git pull origin master
npm install
npm run build
pm2 reload retro-board
```

---

## 🔄 **Alternative: GitHub Actions Auto-Deploy**

### **Setup GitHub Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /opt
          git pull origin master
          npm install
          npm run build
          pm2 reload retro-board
```

---

## 📋 **Best Practices**

### **1. Environment Management**
```bash
# Always backup .env before deploy
cp /opt/.env.production /opt/.env.backup

# Use template for new deployments
cat > /opt/.env.template << EOF
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://kaitovu.io.vn/retroboard"
NEXTAUTH_SECRET="your-secret"
NEXT_PUBLIC_BASE_URL="https://kaitovu.io.vn/retroboard"
NODE_ENV="production"
EOF
```

### **2. Zero-Downtime Deployment**
```bash
# Method: Blue-Green deployment
mkdir -p /opt/blue /opt/green

# Deploy to inactive environment
# Test
# Switch routing
# Clean old environment
```

### **3. Rollback Strategy**
```bash
# Auto-deploy script creates timestamped backups
ls /opt.backup.*

# Rollback if needed
sudo rm -rf /opt/*
sudo cp -r /opt.backup.20241230_143022/* /opt/
pm2 restart retro-board
```

---

## 🎯 **Final Recommendation**

**Use Solution 2 (Auto-Deploy Script)** because:

✅ **One-command deployment**: `~/auto-deploy.sh`
✅ **Automatic backup**: Timestamped backups
✅ **Environment preservation**: Keeps .env.production
✅ **Error handling**: Stops on errors
✅ **Complete automation**: Clone → Build → Deploy → Restart

**Setup once, use forever!** 