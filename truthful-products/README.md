# 🎯 ClearPick.ai

**AI-Powered Product Intelligence Platform**

Make smarter purchase decisions with comprehensive analysis powered by Google Gemini AI.

🌐 **Live Demo:** https://clearpick.netlify.app

---

## 🌐 Deploy to Netlify (5 minutes)

### Option 1: Via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Coming Soon page"
   git push
   ```

2. **Deploy on Netlify:**
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Select GitHub and choose your repo
   - Settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`
   - Click "Deploy site"

3. **Change site name:**
   - Go to Site settings
   - Click "Change site name"
   - Set to: `clearpick`
   - Your URL: `https://clearpick.netlify.app`

### Option 2: Manual Deploy (Fastest)

```bash
cd frontend
npm run build
```

Then drag the `frontend/dist` folder to https://app.netlify.com/drop

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+
- Redis server (optional)
- API Keys (Gemini, Google Shopping)

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your API keys
   ```

2. **Required API Keys:**
   - **Anthropic Claude**: https://console.anthropic.com/
   - **Reddit API**: https://www.reddit.com/prefs/apps

3. **Start Redis:**
   ```bash
   # Windows (with Redis installed)
   redis-server
   
   # Or use Docker
   docker run -d -p 6379:6379 redis
   ```

### Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:5173

---

## 📋 Features

### ✅ MVP (Current)
- **Product Intelligence Tool**
  - Search any product
  - Scrape Amazon reviews
  - Analyze Reddit discussions
  - AI-powered analysis with Claude
  - Pros/Cons breakdown
  - Price comparison
  - Overall score and recommendation
  - Redis caching (6 hours)
  - Rate limiting
  - Beautiful responsive UI

### 🚧 Coming Soon
- **Product Finder Tool**
  - Personalized recommendations
  - Interactive questionnaire
  - Budget-based filtering
  - Priority ranking

### 🔮 Future Enhancements
- YouTube review analysis
- Walmart & Best Buy integration
- Price history tracking
- User accounts
- Saved searches
- Email alerts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│    Tailwind CSS + React Router          │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────────┐
│      Express.js Backend API             │
│   Routes → Controllers → Services       │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐  ┌──▼───┐  ┌──▼────┐
│Amazon │  │Reddit│  │Claude │
│Scraper│  │ API  │  │  AI   │
└───────┘  └──────┘  └───────┘
               │
         ┌─────▼─────┐
         │   Redis   │
         │   Cache   │
         └───────────┘
```

---

## 📁 Project Structure

```
truthful-products/
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   ├── ai/        # Claude integration
│   │   │   └── scrapers/  # Web scrapers
│   │   └── utils/         # Utilities
│   └── package.json
│
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── services/      # API client
│   └── package.json
│
└── README.md
```

---

## 🔧 Tech Stack

### Backend
- **Express.js** - Web framework
- **Puppeteer** - Amazon scraping
- **Snoowrap** - Reddit API client
- **Anthropic Claude** - AI analysis
- **Redis** - Caching layer
- **Winston** - Logging

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

---

## 🎯 API Endpoints

### Product Intelligence

**POST** `/api/v1/product-intel/search`
```json
{
  "query": "iPhone 15 Pro"
}
```

**GET** `/api/v1/product-intel/suggestions?q=iphone`

### Health Check

**GET** `/health`

---

## 🔒 Security Features

- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation
- ✅ Environment variable secrets
- ✅ Error handling

---

## 📊 Performance

- **Caching**: 6-hour Redis cache for product data
- **Parallel Scraping**: Simultaneous Amazon + Reddit requests
- **Response Time**: 10-20 seconds for new searches, <1s for cached
- **Rate Limiting**: Prevents abuse

---

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Make sure Redis is running
redis-cli ping
# Should return: PONG
```

### Puppeteer Issues
```bash
# Install Chromium dependencies (Linux)
sudo apt-get install -y chromium-browser
```

### API Key Errors
- Check `.env` file has correct keys
- Verify Anthropic API key is active
- Confirm Reddit app credentials

---

## 📈 Roadmap

**Phase 1 (Current)** - MVP
- ✅ Product Intelligence
- ✅ Amazon + Reddit scraping
- ✅ Claude AI analysis
- ✅ Basic caching

**Phase 2** - Enhanced Features
- ⏳ Product Finder tool
- ⏳ More data sources (YouTube, Walmart)
- ⏳ Price history tracking

**Phase 3** - Scale
- ⏳ User accounts
- ⏳ Saved searches
- ⏳ Self-hosted Llama (cost reduction)
- ⏳ Mobile app

---

## 💰 Cost Estimation

**MVP (Current):**
- Backend hosting: $10-20/month
- Redis: $10/month (or free tier)
- Claude API: ~$20-30/month (depends on usage)
- **Total: ~$40-60/month**

**At Scale (1000+ users/day):**
- Hosting: $50-100/month
- Redis: $30/month
- AI costs: $100-200/month
- **Total: ~$180-330/month**

---

## 📝 License

MIT

---

## 🤝 Contributing

This is an MVP project. Contributions welcome!

---

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for honest product research**
