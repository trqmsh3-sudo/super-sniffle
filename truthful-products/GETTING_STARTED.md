# 🚀 Getting Started with TruthfulProducts

Complete step-by-step guide to run the project locally.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **Redis** installed or Docker available
- ✅ **Git** (optional, for version control)
- ✅ **Code editor** (VS Code recommended)

---

## 🔑 Step 1: Get API Keys

### 1.1 Anthropic Claude API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-`)
6. **Important**: You'll need to add credits to your account

### 1.2 Reddit API Credentials

1. Go to https://www.reddit.com/prefs/apps
2. Scroll to bottom and click "Create App" or "Create Another App"
3. Fill in:
   - **Name**: TruthfulProducts
   - **Type**: Select "script"
   - **Description**: Product research tool
   - **Redirect URI**: http://localhost:5000
4. Click "Create app"
5. Copy:
   - **Client ID** (under app name)
   - **Client Secret** (shown as "secret")

---

## 🛠️ Step 2: Install Redis

### Option A: Windows (Recommended - Docker)

```powershell
# Install Docker Desktop first, then:
docker run -d -p 6379:6379 --name redis redis:latest

# Verify it's running:
docker ps
```

### Option B: Windows (Native)

Download from: https://github.com/microsoftarchive/redis/releases
Or use WSL2 with Linux Redis

### Option C: macOS

```bash
brew install redis
brew services start redis
```

### Option D: Linux

```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

### Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

---

## 📦 Step 3: Install Project Dependencies

Open terminal in project root:

```bash
# Navigate to project
cd truthful-products

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

**This will take 2-5 minutes depending on your internet speed.**

---

## ⚙️ Step 4: Configure Environment Variables

### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Now edit `backend/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Redis Cache
REDIS_URL=redis://localhost:6379

# AI Service - Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# Reddit API
REDDIT_CLIENT_ID=YOUR_CLIENT_ID_HERE
REDDIT_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
REDDIT_USER_AGENT=TruthfulProducts/1.0

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Caching
CACHE_PRODUCT_TTL=21600

# CORS
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

**Replace the placeholder values with your actual API keys!**

---

## 🚀 Step 5: Run the Application

You need **TWO terminal windows** open:

### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Redis connected successfully
🚀 Server running on port 5000
📍 API endpoint: http://localhost:5000/api/v1
🏥 Health check: http://localhost:5000/health
🌍 Environment: development
```

### Terminal 2 - Frontend Server

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## ✅ Step 6: Test the Application

1. **Open browser**: http://localhost:5173
2. **You should see**: Beautiful home page with two cards
3. **Click**: "Research a Product" card
4. **Search for**: "iPhone 15 Pro" or "Weber Spirit II E-310"
5. **Wait**: 10-20 seconds for analysis
6. **View results**: Score, pros/cons, pricing, verdict

---

## 🧪 Verify Everything Works

### Test Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2025-12-27T19:30:00.000Z",
  "uptime": 123.456
}
```

### Test Product Search

```bash
curl -X POST http://localhost:5000/api/v1/product-intel/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 15 Pro"}'
```

Should return product analysis JSON.

---

## 🐛 Common Issues & Solutions

### Issue 1: Redis Connection Error

**Error**: `Redis connection error: ECONNREFUSED`

**Solution**:
```bash
# Check if Redis is running
redis-cli ping

# If not running, start it:
# Docker:
docker start redis

# macOS:
brew services start redis

# Linux:
sudo systemctl start redis
```

### Issue 2: Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process or change PORT in .env
```

### Issue 3: Anthropic API Error

**Error**: `Authentication error` or `Invalid API key`

**Solution**:
- Check your API key in `.env` is correct
- Verify you have credits in your Anthropic account
- Make sure there are no extra spaces in the key

### Issue 4: Reddit API Error

**Error**: `401 Unauthorized`

**Solution**:
- Verify Client ID and Secret are correct
- Make sure you selected "script" type when creating the app
- Check there are no extra spaces in credentials

### Issue 5: Puppeteer/Chromium Error

**Error**: `Failed to launch browser`

**Solution**:
```bash
# Windows: Install Visual C++ Redistributable
# Download from Microsoft

# Linux: Install dependencies
sudo apt-get install -y chromium-browser

# macOS: Usually works out of the box
```

### Issue 6: Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Understanding the Flow

1. **User searches** for a product (e.g., "iPhone 15 Pro")
2. **Backend receives** the request
3. **Fuzzy search** corrects typos if needed
4. **Check cache** - if found, return immediately
5. **If not cached**:
   - Scrape Amazon reviews (Puppeteer)
   - Fetch Reddit discussions (Snoowrap)
   - Send data to Claude AI for analysis
   - Cache the result for 6 hours
6. **Return analysis** to frontend
7. **Frontend displays** beautiful results

---

## 🎯 Next Steps

Now that everything works:

1. **Try different products**: Search for various items
2. **Check the logs**: Watch terminal output to understand the flow
3. **Explore the code**: Start with `backend/src/server.js` and `frontend/src/App.jsx`
4. **Customize**: Change colors in `tailwind.config.js`
5. **Add features**: Follow the roadmap in main README

---

## 📚 Useful Commands

```bash
# Backend
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests (when added)

# Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build

# Both
npm install         # Install dependencies
npm update          # Update dependencies
```

---

## 🔍 Project Structure Quick Reference

```
backend/
├── src/
│   ├── server.js              # Entry point
│   ├── routes/                # API routes
│   ├── controllers/           # Request handlers
│   ├── services/
│   │   ├── scrapers/         # Amazon, Reddit scrapers
│   │   ├── ai/               # Claude integration
│   │   └── cache.service.js  # Redis caching
│   └── config/               # Configuration

frontend/
├── src/
│   ├── App.jsx               # Main app component
│   ├── pages/                # Page components
│   ├── components/           # Reusable components
│   └── services/api.js       # API client
```

---

## 💡 Tips for Development

1. **Keep both terminals visible** to see logs in real-time
2. **Use browser DevTools** (F12) to debug frontend
3. **Check backend logs** for API errors
4. **Redis caching** means second search is instant
5. **Rate limiting** prevents API abuse (100 req/15min)

---

## 🎉 You're Ready!

The platform is now running locally. Start searching for products and see the magic happen!

**Need help?** Check the main README.md or open an issue.

---

**Happy coding! 🚀**
