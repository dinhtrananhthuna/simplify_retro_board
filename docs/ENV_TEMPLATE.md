# Production Environment Variables Template

## 📋 Setup Instructions

1. **Copy template to production file:**
```bash
cd /home/oyhumgag/retroboard
nano .env.production
```

2. **Paste and modify the following content:**

```env
# Neon Database (Get from Neon Console -> Connection Details)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="https://kaitovu.io.vn/retroboard"
NEXTAUTH_SECRET="your-very-secure-random-secret-string-minimum-32-characters"

# Application URLs
NEXT_PUBLIC_BASE_URL="https://kaitovu.io.vn/retroboard"
NODE_ENV="production"

# Ably Real-time (Optional - for real-time features)
NEXT_PUBLIC_ABLY_KEY="your_ably_key"
ABLY_SERVER_KEY="your_ably_server_key"
```

## 🔑 Required Values

### **DATABASE_URL**
- Get from [Neon Console](https://console.neon.tech)
- Navigate: Project → Settings → Connection Details
- Format: `postgresql://user:pass@host/dbname?sslmode=require`

### **NEXTAUTH_SECRET**
- Generate with: `openssl rand -base64 32`
- Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- Must be at least 32 characters

### **Domain URLs**
- Replace `kaitovu.io.vn` with your actual domain
- Ensure HTTPS is used in production

### **Ably Keys (Optional)**
- Only needed if using real-time features
- Get from [Ably Dashboard](https://ably.com/dashboard)

## ⚠️ Security Notes

- Never commit `.env.production` to git
- Keep environment variables secure
- Use strong secrets for production
- Regularly rotate secrets 