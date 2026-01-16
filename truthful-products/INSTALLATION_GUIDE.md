# 📦 מדריך התקנה והרצה - ClearPick.ai V2.0

**תאריך:** 14 ינואר 2026  
**גרסה:** V2.0 - Fixed & Enhanced

---

## 🚀 Quick Start (התקנה מהירה)

### דרישות מקדימות:
- ✅ Node.js 18+ (בדוק: `node --version`)
- ✅ PostgreSQL 14+ (בדוק: `psql --version`)
- ✅ Git (בדוק: `git --version`)
- ⚠️ Redis (אופציונלי אבל מומלץ מאוד!)

---

## 📋 שלב 1: התקנת Backend

```bash
# 1. נווט לתיקיית backend
cd "c:\Users\maisi\OneDrive\Documents\מערכת המלצות למוצרים חכמה\truthful-products\backend"

# 2. התקן dependencies
npm install

# 3. צור קובץ .env (אם לא קיים)
# העתק מ-.env.example או צור ידנית
```

### הגדרת .env:
```bash
# backend/.env
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/clearpick

# Redis (אופציונלי)
REDIS_URL=redis://localhost:6379

# AI Services
GEMINI_API_KEY=your_gemini_key_here
CLAUDE_API_KEY=your_claude_key_here

# Image Services (FREE tiers!)
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
PEXELS_API_KEY=your_pexels_key_here
BING_SEARCH_API_KEY=your_bing_key_here

# Server
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### איך להשיג API Keys (חינמי!):
- **Gemini:** https://makersuite.google.com/app/apikey (חינמי!)
- **Claude:** https://console.anthropic.com/ (trial)
- **Unsplash:** https://unsplash.com/developers (50K requests/month)
- **Pexels:** https://www.pexels.com/api/ (200 requests/hour)
- **Bing:** https://azure.microsoft.com/cognitive-services/bing-image-search-api/ (1K/month)

### הגדרת Database:
```bash
# צור database
psql -U postgres
CREATE DATABASE clearpick;
\q

# הרץ migrations (אם קיימות)
npm run migrate

# או הרץ את schema.sql ידנית
psql -U postgres -d clearpick -f config/schema.sql
```

---

## 📋 שלב 2: התקנת Frontend

```bash
# 1. נווט לתיקיית frontend
cd "c:\Users\maisi\OneDrive\Documents\מערכת המלצות למוצרים חכמה\truthful-products\frontend"

# 2. התקן dependencies
npm install

# 3. צור קובץ .env (אופציונלי)
# ברירת המחדל: http://localhost:3000/api
```

### הגדרת .env (אופציונלי):
```bash
# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

---

## 🏃 שלב 3: הרצת המערכת

### Terminal 1 - Backend:
```bash
cd backend
node server.js

# אמור לראות:
# ╔═══════════════════════════════════════════╗
# ║   🚀 ClearPick.ai Backend Server         ║
# ║   📡 Running on: http://localhost:3000   ║
# ║   💾 Database: PostgreSQL                 ║
# ║   🤖 AI: Gemini + Claude                  ║
# ╚═══════════════════════════════════════════╝
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev

# אמור לראות:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### פתח דפדפן:
```
http://localhost:5173
```

---

## 🧪 בדיקות

### בדיקה 1: Backend Health
```bash
curl http://localhost:3000/api/health

# תגובה מצופה:
# {
#   "status": "ok",
#   "database": "connected",
#   "service": "ClearPick.ai API"
# }
```

### בדיקה 2: Build Dossier
```bash
curl -X POST http://localhost:3000/api/products/build ^
  -H "Content-Type: application/json" ^
  -d "{\"productName\": \"JBL Flip 6\"}"

# תגובה מצופה (לאחר ~30 שניות):
# {
#   "success": true,
#   "productId": 1,
#   "scores": { "overall": 82, ... },
#   "confidence": 78
# }
```

### בדיקה 3: Frontend
1. פתח http://localhost:5173
2. חפש: "JBL Flip 6"
3. צפוי לראות:
   - ⏳ BuildingAnimation
   - ✅ Toast: "ניתוח הושלם בהצלחה!"
   - 📊 דף תיק מלא

---

## 🐛 Troubleshooting

### בעיה: Backend לא מתחיל
```bash
# בדוק שהDB רץ
psql -U postgres -c "SELECT 1"

# בדוק שיש .env
ls backend/.env

# בדוק logs
cat backend/logs/error.log
```

### בעיה: "Cannot connect to database"
```bash
# בדוק את DATABASE_URL ב-.env
# פורמט נכון:
# DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### בעיה: "Redis connection failed"
- ⚠️ Redis אופציונלי! המערכת עובדת בלעדיו (אך יותר לאט)
- אם רוצה Redis: `redis-server` או השתמש ב-Upstash (cloud)

### בעיה: Frontend לא מוצא את Backend
```bash
# ודא ש-Backend רץ על port 3000
# ודא ש-CORS מאפשר http://localhost:5173

# backend/server.js צריך:
app.use(cors({
  origin: true,
  credentials: true
}));
```

### בעיה: "Too many requests"
- ✅ זה תקין! Rate limiting עובד
- חכה 15 דקות או נקה cookies

---

## 🎯 Features שזמינים

### ✅ פעיל ועובד:
- ✅ Reddit Scraper - 20 subreddits
- ✅ Data Aggregator - sentiment, pros/cons, patterns
- ✅ Smart Cache - TTL דינמי (30min - 24h)
- ✅ Universal Images - 5 מקורות
- ✅ AI Router - Gemini (free) + Claude (paid)
- ✅ Quality Monitor - זיהוי תיקים גנריים
- ✅ Rate Limiting - 10 builds/15min
- ✅ Error Handling - מקיף
- ✅ Toast Notifications - feedback למשתמש
- ✅ BuildingAnimation - progress bar
- ✅ ErrorBoundary - מונע crashes
- ✅ ImageGallery - multiple images
- ✅ ConfidenceWarning - אזהרות חכמות
- ✅ Share/Bookmark - שיתוף ושמירה
- ✅ Admin Dashboard - ניטור פנימי

### 🔜 בפיתוח (V2.0):
- 🔜 Company Pages
- 🔜 Smart Router (חברה vs מוצר)
- 🔜 Multi-Language (עברית)
- 🔜 YouTube Scraper
- 🔜 Amazon Integration
- 🔜 AI Recommendations
- 🔜 Dark Mode
- 🔜 PWA

---

## 📊 Performance Tips

### 1. אפשר Redis (מאוד מומלץ!)
```bash
# Windows
# הורד מ: https://github.com/microsoftarchive/redis/releases
# או השתמש ב-Memurai (Redis for Windows)

# Linux/Mac
sudo apt install redis-server  # Ubuntu
brew install redis             # Mac

# הרץ
redis-server

# עדכן .env
REDIS_URL=redis://localhost:6379
```

**תוצאה:** Cache hits ב-~50ms במקום 15-30 שניות! ⚡

### 2. Production Mode
```bash
# backend
NODE_ENV=production node server.js

# Less logging, better performance
```

### 3. Database Indexes
```sql
-- הרץ ב-psql לשיפור ביצועים
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_dossiers_product_id ON dossiers(product_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_status ON dossiers(status);
```

---

## 🎉 הצלחה!

אם הגעת לכאן והכל עובד - **כל הכבוד!** 🎊

המערכת מוכנה לשימוש עם:
- ✅ Reddit scraping אמיתי
- ✅ AI analysis חכם
- ✅ Smart caching
- ✅ UX מקצועי
- ✅ Error handling מקיף

---

## 📞 צריך עזרה?

ראה את הקבצים:
- `✅_תיקונים_שבוצעו.md` - מה תוקן
- `דוח_בדיקות_ושיפורים.md` - בעיות + פתרונות
- `תוכנית_השקה_יציבה.md` - תוכנית מלאה

---

**בהצלחה! 🚀**
