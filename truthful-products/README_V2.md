# 🎯 ClearPick.ai V2.0 - Smart Product Intelligence Platform

**The honest product research platform powered by real web reviews and AI analysis**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

---

## 🚀 What is ClearPick.ai?

ClearPick.ai analyzes **thousands of real reviews** from across the web (Reddit, YouTube, Amazon) and uses AI to give you an honest, unbiased product dossier in 60 seconds.

**We're not another chatbot.** We're a data aggregator + AI editor + product intelligence platform.

---

## ✨ Features (V2.0)

### 🕷️ Real Web Scraping
- ✅ **Reddit Scraper** - 20 subreddits (BuyItForLife, ProductReviews, etc.)
- ✅ **Smart Search** - Category-specific subreddit targeting
- ✅ **Relevance Scoring** - Only quality posts (0-100 score)
- 🔜 YouTube Transcript Scraper (coming soon)
- 🔜 Amazon Reviews (coming soon)

### 🤖 AI-Powered Analysis
- ✅ **Gemini AI** - Free tier for simple tasks (60 req/min)
- ✅ **Claude AI** - Paid tier for complex analysis
- ✅ **Smart Routing** - Automatic AI selection based on task
- ✅ **Data Aggregator** - Sentiment, pros/cons, patterns extraction
- ✅ **Quality Monitor** - Detects generic/low-quality dossiers

### ⚡ Performance
- ✅ **Smart Cache** - Dynamic TTL based on confidence (30min - 24h)
- ✅ **Building Lock** - Prevents duplicate builds
- ✅ **Cache Warming** - Pre-build popular products
- ✅ **Rate Limiting** - 10 builds/15min per IP

### 🖼️ Universal Images
- ✅ **5 Image Sources** - Unsplash, Pexels, Bing, Brand sites, Wikipedia
- ✅ **Fallback Strategy** - Always finds images
- ✅ **Multiple Images** - Up to 5 per product
- ✅ **FREE APIs** - All within free tiers

### 🎨 Professional UX
- ✅ **ErrorBoundary** - Graceful error handling
- ✅ **Toast Notifications** - User feedback system
- ✅ **BuildingAnimation** - Progress bar with steps
- ✅ **ImageGallery** - Lightbox with navigation
- ✅ **ConfidenceWarning** - Smart data quality alerts
- ✅ **SkeletonDossier** - Loading placeholders
- ✅ **Share/Bookmark** - Social sharing + local bookmarks

### 🛡️ Security & Stability
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **Error Handler** - Global error handling
- ✅ **Input Validation** - Prevent injection attacks
- ✅ **Winston Logger** - Professional logging
- ✅ **Graceful Shutdown** - Clean process termination

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    USER SEARCHES                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              SimpleDossierBuilder                   │
│                                                     │
│  1. Check Smart Cache ⚡                           │
│  2. Scrape Reddit 🕷️ (20 subreddits)             │
│  3. Aggregate Data 📊 (sentiment, pros/cons)       │
│  4. Refine with AI 🤖 (Gemini or Claude)          │
│  5. Fetch Images 🖼️ (5 sources)                   │
│  6. Calculate Scores 📈                            │
│  7. Save to PostgreSQL 💾                          │
│  8. Cache Result ⚡                                │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                COMPLETE DOSSIER                     │
│                                                     │
│  • Overall Score (0-100)                           │
│  • Quality, Value, Reliability scores              │
│  • Pros & Cons from real reviews                   │
│  • Common Issues                                    │
│  • Best For / Not For                              │
│  • Confidence Score (data quality)                 │
│  • 5 Product Images                                │
│  • Data Sources breakdown                          │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **Cache:** Redis (optional but recommended)
- **AI:** Google Gemini + Anthropic Claude
- **Web Scraping:** Axios (Reddit JSON API)
- **Images:** Unsplash, Pexels, Bing APIs
- **Logging:** Winston
- **Rate Limiting:** express-rate-limit

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State:** React Hooks
- **API:** Axios

### DevOps
- **Hosting:** Render.com (backend) + Vercel/Netlify (frontend)
- **Database:** Render PostgreSQL
- **Cache:** Upstash Redis (serverless)
- **Monitoring:** (coming soon - Sentry)

---

## 📦 Installation

See `INSTALLATION_GUIDE.md` for detailed setup instructions.

**Quick start:**
```bash
# Backend
cd backend
npm install
# Configure .env
node server.js

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

See `TEST_CHECKLIST.md` for comprehensive testing guide.

**Quick test:**
```bash
# Test backend
curl -X POST http://localhost:3000/api/products/build \
  -H "Content-Type: application/json" \
  -d '{"productName": "JBL Flip 6"}'

# Expected: Reddit scraping logs + complete dossier
```

---

## 📊 What Makes Us Different?

### vs. Wirecutter
- ✅ Any product (not just popular ones)
- ✅ AI analysis (not just human editors)
- ✅ Real-time data (not outdated articles)
- ✅ Confidence scoring (transparency)

### vs. Amazon Reviews
- ✅ Multi-source (Reddit, YouTube, Amazon)
- ✅ Fake review detection (upvote-based filtering)
- ✅ Aggregated analysis (not just raw reviews)
- ✅ Unbiased (no affiliate pressure)

### vs. ChatGPT
- ✅ Real web scraping (not training data)
- ✅ Structured output (dossier format)
- ✅ Confidence scoring (data quality)
- ✅ Source attribution (transparency)

### vs. RTINGS
- ✅ All categories (not just tech)
- ✅ User reviews (not just lab tests)
- ✅ Free (no paywall)
- ✅ Global coverage (any product)

---

## 🎯 Roadmap

### ✅ V1.0 (Released)
- Basic search
- Dossier pages
- Phase 1 components (not connected)

### ✅ V2.0 (Current - Jan 2026)
- **Fixed Backend-Frontend integration**
- Reddit Scraper active
- Smart Cache active
- Universal Images active
- Error handling
- Rate limiting
- Toast notifications
- BuildingAnimation
- ImageGallery
- Share/Bookmark

### 🔜 V2.1 (Next - Feb 2026)
- Company Pages
- Smart Router (company vs product)
- YouTube Scraper integration
- Amazon Scraper integration

### 🔜 V2.5 (Mar 2026)
- Multi-Language (Hebrew, Spanish, etc.)
- AI Recommendations Wizard
- Advanced Search & Filters

### 🔜 V3.0 (Apr-May 2026)
- Dark Mode
- PWA (installable app)
- Price Tracking
- Product Comparisons
- User Reviews (UGC)

---

## 📈 Current Status

### ✅ Working (100%):
- Reddit Scraper (20 subreddits)
- Data Aggregator (sentiment, pros/cons, patterns)
- Smart Cache (dynamic TTL, building locks)
- Universal Images (5 sources)
- SimpleDossierBuilder (complete flow)
- AI Router (Gemini + Claude)
- Quality Monitor
- Rate Limiting
- Error Handling
- Toast Notifications
- BuildingAnimation
- ImageGallery
- ConfidenceWarning
- Share/Bookmark
- Admin Dashboard

### 🔜 In Development:
- Company Pages (0%)
- Smart Router (0%)
- Multi-Language (0%)
- YouTube Scraper (0%)
- Amazon Integration (code exists, not connected)

---

## 🤝 Contributing

This is currently a private project. Documentation is in Hebrew and English.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Contact

For questions or support, see documentation files:
- `INSTALLATION_GUIDE.md` - Setup instructions
- `TEST_CHECKLIST.md` - Testing guide
- `CHANGELOG.md` - Version history
- `✅_תיקונים_שבוצעו.md` - Recent fixes (Hebrew)

---

## 🎉 Acknowledgments

Built with:
- Google Gemini AI
- Anthropic Claude
- Reddit JSON API
- Unsplash, Pexels, Bing APIs
- PostgreSQL
- Redis
- React + Vite
- Tailwind CSS

---

**Made with ❤️ and AI assistance**

**Last updated:** January 14, 2026
