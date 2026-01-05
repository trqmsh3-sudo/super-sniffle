# TruthfulProducts Backend API

Unbiased product research platform - Backend service

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Redis server running locally or remote
- API Keys (see below)

### Installation

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your API keys:

**Anthropic Claude API:**
- Sign up at https://console.anthropic.com/
- Get your API key from dashboard
- Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-xxx`

**Reddit API:**
- Create app at https://www.reddit.com/prefs/apps
- Choose "script" type
- Get client ID and secret
- Add to `.env`:
  ```
  REDDIT_CLIENT_ID=your_id
  REDDIT_CLIENT_SECRET=your_secret
  ```

**Redis:**
- Install locally: https://redis.io/download
- Or use cloud Redis (Redis Labs, Upstash)
- Update `REDIS_URL` in `.env`

### Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:5000

### Test the API

```bash
# Health check
curl http://localhost:5000/health

# Search for a product
curl -X POST http://localhost:5000/api/v1/product-intel/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 15 Pro"}'

# Get autocomplete suggestions
curl http://localhost:5000/api/v1/product-intel/suggestions?q=iphone
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   ├── ai/         # AI integration
│   │   └── scrapers/   # Web scrapers
│   ├── utils/          # Utilities
│   └── server.js       # Entry point
├── logs/               # Log files
├── package.json
└── .env
```

## 🔧 API Endpoints

### Product Intelligence

**POST** `/api/v1/product-intel/search`
```json
{
  "query": "Weber Spirit II E-310"
}
```

**GET** `/api/v1/product-intel/suggestions?q=weber`

### Health Check

**GET** `/health`

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **Puppeteer** - Amazon scraping
- **Snoowrap** - Reddit API
- **Anthropic Claude** - AI analysis
- **Redis** - Caching
- **Winston** - Logging

## 📊 Features

- ✅ Parallel web scraping (Amazon + Reddit)
- ✅ AI-powered product analysis
- ✅ Fuzzy search with typo correction
- ✅ Redis caching (6-hour TTL)
- ✅ Rate limiting
- ✅ Comprehensive error handling
- ✅ Structured logging

## 🔒 Security

- Helmet.js for security headers
- CORS protection
- Rate limiting (100 req/15min)
- Input validation
- Environment variables for secrets

## 📝 License

MIT
