# ✅ Test Checklist - ClearPick.ai V2.0

**מטרה:** לוודא שהמערכת עובדת לפני deploy

---

## 🔧 Pre-Test Setup

### 1. התקנה
- [x] Backend: `npm install` הושלם
- [x] Frontend: `npm install` הושלם
- [x] express-rate-limit מותקן בbackend

### 2. Environment Variables
- [ ] `backend/.env` קיים ומוגדר נכון
- [ ] `GEMINI_API_KEY` מוגדר
- [ ] `DATABASE_URL` מוגדר
- [ ] (Optional) `REDIS_URL` מוגדר

### 3. Database
- [ ] PostgreSQL רץ
- [ ] Database `clearpick` קיים
- [ ] Tables קיימות (products, dossiers)
- [ ] Connection עובדת

---

## 🧪 Backend Tests

### API Health
- [ ] `GET /api/health` מחזיר `{status: "ok"}`
- [ ] Database status: "connected"
- [ ] Response time < 1s

**Test:**
```bash
curl http://localhost:3000/api/health
```

---

### Product Build (הכי חשוב!)
- [ ] `POST /api/products/build` עובד
- [ ] Reddit Scraper נקרא (לוגים מראים scraping)
- [ ] Data Aggregator עובד (pros/cons מחולצים)
- [ ] Gemini AI נקרא
- [ ] Images נאספות (Universal Image Service)
- [ ] Dossier נשמר בDB
- [ ] Response כולל: productId, scores, confidence
- [ ] Build time: 15-30 שניות

**Test:**
```bash
curl -X POST http://localhost:3000/api/products/build ^
  -H "Content-Type: application/json" ^
  -d "{\"productName\": \"JBL Flip 6\"}"
```

**Expected logs:**
```
🔨 Building dossier for: "JBL Flip 6"
🚀 Starting SimpleDossierBuilder...
📝 Step 1/6: Scraping Reddit...
   ✓ Found 47 Reddit posts
📝 Step 2/6: Analyzing aggregated data...
   ✓ Sentiment: 72% positive
📝 Step 3/6: Refining with Gemini AI...
📝 Step 4/6: Fetching images...
   ✓ Found 5 images
📝 Step 5/6: Saving to database...
✅ Dossier V2.1 Complete!
```

---

### Cache Test
- [ ] Build product שנית → cache hit
- [ ] Response מהיר (< 1s)
- [ ] Response includes `cached: true`
- [ ] Logs show "Cache HIT"

**Test:**
```bash
# Second request (same product)
curl -X POST http://localhost:3000/api/products/build ^
  -H "Content-Type: application/json" ^
  -d "{\"productName\": \"JBL Flip 6\"}"
```

**Expected:**
```
✅ Product already exists with ready dossier
✅ Cache HIT!
```

---

### Rate Limiting Test
- [ ] 11 requests תוך 15 דקות → ה-11 נדחה
- [ ] Error: "Too many build requests"
- [ ] Status code: 429

**Test:**
```powershell
# PowerShell
1..11 | ForEach-Object {
  curl -X POST http://localhost:3000/api/products/build `
    -H "Content-Type: application/json" `
    -d "{\"productName\": \"Test Product $_\"}"
}
```

**Expected:** Request #11 returns 429 error

---

### Get Product Test
- [ ] `GET /api/products/:id` עובד
- [ ] מחזיר product + dossier + scores
- [ ] Invalid ID → 404 error
- [ ] Response time < 500ms

**Test:**
```bash
curl http://localhost:3000/api/products/1
```

---

### Search Test
- [ ] `GET /api/search?q=JBL` עובד
- [ ] מחזיר רשימת מוצרים
- [ ] Sorted by score (הכי טוב ראשון)
- [ ] Empty query → 400 error

**Test:**
```bash
curl "http://localhost:3000/api/search?q=JBL"
```

---

### Admin Routes
- [ ] `GET /api/admin/ai-stats` עובד
- [ ] מחזיר Gemini vs Claude stats
- [ ] `GET /api/admin/system-info` עובד
- [ ] `POST /api/admin/clear-dossiers` עובד (זהירות!)

---

## 🎨 Frontend Tests

### Home Page
- [ ] נטען בלי errors
- [ ] Search box עובד
- [ ] Popular products clickable
- [ ] Responsive במובייל

**Test:** פתח http://localhost:5173

---

### Search Flow
- [ ] חיפוש מוצר → BuildingAnimation מופיע
- [ ] Progress bar מתקדם
- [ ] Steps מתעדכנים (Reddit → Images → AI → Save)
- [ ] לאחר build → Toast: "✅ ניתוח הושלם!"
- [ ] Navigation לdossier page אוטומטי

**Test:** חפש "Sony WH-1000XM5"

---

### Dossier Page
- [ ] תמונות נטענות (ImageGallery)
- [ ] Multiple images - thumbnails מוצגים
- [ ] Click על תמונה → lightbox
- [ ] Arrows navigation בlightbox
- [ ] ESC סוגר lightbox
- [ ] Scores מוצגים (Overall, Quality, Value, Reliability)
- [ ] Pros & Cons מוצגים
- [ ] Common Issues מוצגים
- [ ] Summary מוצג
- [ ] Confidence warning (אם < 70%)

**Test:** פתח דף תיק קיים

---

### Share Functionality
- [ ] כפתור Share → clipboard copy
- [ ] Toast: "הקישור הועתק! 📋"
- [ ] Mobile: native share dialog (אם נתמך)

**Test:** לחץ על Share בדף תיק

---

### Bookmark Functionality
- [ ] כפתור Bookmark → שמירה
- [ ] Icon מתמלא (filled)
- [ ] Toast: "נשמר! 🔖"
- [ ] Click שוב → מחיקה
- [ ] Toast: "הוסר מהשמורים"
- [ ] Bookmarks נשמרים ב-localStorage

**Test:** לחץ על Bookmark בדף תיק

---

### Error Handling
- [ ] חיפוש ריק → Toast error
- [ ] Backend down → ErrorBoundary עובד
- [ ] Invalid product ID → 404 page
- [ ] Network error → Toast error
- [ ] Image load error → fallback placeholder

**Test:** נתק backend ונסה לחפש

---

### Mobile Responsive
- [ ] נראה טוב באייפון (Safari)
- [ ] נראה טוב באנדרואיד (Chrome)
- [ ] כפתורים גדולים מספיק (44px+)
- [ ] טקסט קריא (16px+)
- [ ] אין horizontal scroll
- [ ] Touch gestures עובדים (swipe בimages)

**Test:** פתח בפלאפון או Chrome DevTools (F12 → Toggle Device)

---

### Admin Dashboard
- [ ] `/admin` נטען
- [ ] AI Stats מוצגים
- [ ] Database Stats מוצגים (אם יש)
- [ ] System Health מוצג
- [ ] Refresh button עובד
- [ ] Clear Dossiers עובד (זהירות!)

**Test:** פתח http://localhost:5173/admin

---

## 🚨 Error Cases (חשוב!)

### Test Error Scenarios:
- [ ] Product name ריק → 400 error
- [ ] Invalid product ID → 404 error
- [ ] Gemini API key לא תקין → fallback to Claude
- [ ] Database down → 500 error עם הודעה ברורה
- [ ] Redis down → מערכת עובדת (slower)
- [ ] Rate limit exceeded → 429 error
- [ ] Network timeout → error handling

---

## 📊 Performance Tests

### Load Time:
- [ ] Home page: < 2s
- [ ] Dossier page: < 3s
- [ ] Search results: < 2s
- [ ] Images load progressively

### Build Time:
- [ ] New product build: 15-30s
- [ ] Cache hit: < 1s
- [ ] Concurrent builds: handled gracefully

### Memory:
- [ ] Backend memory stable (no leaks)
- [ ] Frontend memory stable
- [ ] Redis memory usage reasonable

---

## ✅ Sign-Off Checklist

### קריטי (חובה לפני deploy):
- [ ] ✅ Backend מתחיל ללא errors
- [ ] ✅ Frontend מתחיל ללא errors
- [ ] ✅ Database connection עובדת
- [ ] ✅ `/api/products/build` עובד עם Reddit scraping
- [ ] ✅ Cache hit עובד
- [ ] ✅ Rate limiting עובד
- [ ] ✅ Error handling עובד
- [ ] ✅ Toast notifications עובדים
- [ ] ✅ BuildingAnimation מוצג
- [ ] ✅ ImageGallery עובד
- [ ] ✅ Share/Bookmark עובדים
- [ ] ✅ Mobile responsive
- [ ] ✅ אין console errors בדפדפן

### מומלץ (nice to have):
- [ ] 🟡 Redis פעיל
- [ ] 🟡 Winston logging עובד
- [ ] 🟡 Admin dashboard מוצג
- [ ] 🟡 All API keys מוגדרים
- [ ] 🟡 Performance optimal

---

## 🎯 Success Criteria

המערכת מוכנה לdeploy אם:
1. ✅ כל הבדיקות הקריטיות עברו
2. ✅ אין bugs חמורים
3. ✅ UX נעים וחלק
4. ✅ Error handling עובד
5. ✅ Mobile responsive

---

## 📝 Test Log

תעד כאן את תוצאות הבדיקות:

```
תאריך: ___________
בודק: ___________

Backend Tests:
✅ Health check
✅ Product build
✅ Cache hit
✅ Rate limiting
✅ Error handling

Frontend Tests:
✅ Home page
✅ Search flow
✅ Dossier page
✅ Share/Bookmark
✅ Mobile

Bugs Found:
1. ___________
2. ___________

Status: Ready / Needs fixes
```

---

**בהצלחה בבדיקות! 🧪**
