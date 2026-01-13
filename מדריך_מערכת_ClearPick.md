# 📘 מדריך מערכת ClearPick.ai - מערכת המלצות למוצרים חכמה

## 📋 תוכן עניינים
1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [Frontend - ממשק המשתמש](#frontend)
4. [Backend - שרת האפליקציה](#backend)
5. [Database - מסד הנתונים](#database)
6. [AI & Intelligence - מנוע הבינה](#ai-intelligence)
7. [תהליך בניית תיק מוצר](#תהליך-בניית-תיק)
8. [API Documentation](#api-documentation)
9. [Deployment & Infrastructure](#deployment)
10. [Features מתקדמים](#features-מתקדמים)

---

## 🎯 סקירה כללית

### מה זה ClearPick.ai?
**מערכת AI לניתוח מוצרים** שעוזרת למשתמשים לקבל החלטות קנייה חכמות על בסיס ניתוח ביקורות אמיתיות.

### הבעיה שפתרנו:
- ✗ ביקורות מזויפות באינטרנט
- ✗ תוכן ממומן שמוטה
- ✗ קושי להבין האם מוצר באמת טוב

### הפתרון שלנו:
- ✓ ניתוח AI של ביקורות אמיתיות
- ✓ ציונים אובייקטיביים (Quality, Reliability, Value)
- ✓ זיהוי תקלות נפוצות
- ✓ תרגום אוטומטי מכל שפה

---

## 🏗️ ארכיטקטורה

### מבנה המערכת

```
┌─────────────────────────────────────────────────────────────────┐
│                      ClearPick.ai System                        │
└─────────────────────────────────────────────────────────────────┘
           │
           ├──► Frontend (React + Vite)
           │    ├─ Vercel (www.clearpickai.com)
           │    ├─ Modern UI (Tailwind CSS)
           │    └─ Client-side routing (React Router)
           │
           ├──► Backend (Node.js + Express)
           │    ├─ Render (clearpick-ai.onrender.com)
           │    ├─ REST API
           │    ├─ Rate Limiting + Security (Helmet)
           │    └─ Multi-service architecture
           │
           ├──► Database (PostgreSQL)
           │    ├─ Render PostgreSQL
           │    ├─ Products + Dossiers + Reviews
           │    └─ Auto-schema management
           │
           └──► AI Services
                ├─ Google Gemini 1.5 Flash (Expert Analysis)
                ├─ Product Validator (Translation + Validation)
                ├─ Image Service (Wikipedia + Apple OG)
                └─ Smart Disambiguation
```

---

## 🎨 Frontend - ממשק המשתמש

### טכנולוגיות
- **React 18** - UI Framework
- **Vite** - Build tool (מהיר פי 10 מ-Webpack)
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Lucide Icons** - Modern icon library

### מבנה תיקיות Frontend

```
frontend/
├── src/
│   ├── pages/               # דפים ראשיים
│   │   ├── Home.jsx         # דף הבית
│   │   ├── SearchPagePremium.jsx    # דף חיפוש
│   │   └── DossierPagePremium.jsx   # דף תיק מוצר
│   │
│   ├── components/          # רכיבים משותפים
│   │   ├── ui/              # רכיבי UI (Button, Card, Input)
│   │   ├── layout/          # Header, Footer
│   │   └── product/         # רכיבים ספציפיים למוצרים
│   │
│   ├── hooks/               # Custom React Hooks
│   │   └── useProductDossier.js  # Hook לטעינת תיק מוצר
│   │
│   └── App.jsx              # נקודת הכניסה הראשית
│
└── package.json
```

### דפים ראשיים

#### 1. Home.jsx - דף הבית
```
תכונות:
├─ Hero section עם חיפוש
├─ Popular products (iPhone 15, Dyson V15, Sony WH-1000XM5)
├─ Email waitlist
└─ Gradient background עם blur effects
```

#### 2. SearchPagePremium.jsx - דף חיפוש
```
תכונות:
├─ Smart search bar
├─ Auto-wake backend (Render free tier)
├─ Disambiguation UI (JBL → דגמים)
├─ Search results grid
└─ "Build intelligence report" button
```

#### 3. DossierPagePremium.jsx - תיק מוצר
```
תכונות:
├─ Product image (high-quality)
├─ Overall score (0-100)
├─ Verdict (BUY / CONSIDER / DON'T BUY)
├─ Quality/Reliability/Value scores
├─ Pros & Cons lists
├─ Common failures
├─ Best for / Not for recommendations
└─ Data sources transparency
```

### זרימת משתמש (User Flow)

```
1. משתמש נכנס לאתר
   ↓
2. מקליד שם מוצר (למשל: "JBL")
   ↓
3. Frontend שולח → GET /api/search?q=JBL
   ↓
4. Backend מחזיר:
   - אם מוצר כללי → suggestions (Flip 6, Charge 5...)
   - אם מוצר ספציפי → תוצאות מה-DB
   ↓
5. משתמש לוחץ "Build intelligence report"
   ↓
6. Frontend שולח → POST /api/products/build {productName: "JBL Flip 6"}
   ↓
7. Backend:
   - מאמת שם מוצר (productValidator)
   - בודק אם קיים בDB
   - אם לא קיים → בונה תיק חדש (30-60 שניות)
   ↓
8. Frontend מציג loading state
   ↓
9. Backend מחזיר → {success: true, productId: 5, data: {...}}
   ↓
10. Frontend מנווט ל → /product/5
    ↓
11. DossierPagePremium טוען את התיק מ → GET /api/products/5
    ↓
12. משתמש רואה תיק מלא עם ניתוח מפורט
```

---

## ⚙️ Backend - שרת האפליקציה

### טכנולוגיות
- **Node.js 22** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Axios** - HTTP client
- **Google Gemini AI** - Expert analysis

### מבנה תיקיות Backend

```
backend/
├── server-unified.js        # נקודת כניסה ראשית
├── config/
│   └── database.js          # חיבור PostgreSQL
│
├── services/                # לוגיקה עסקית
│   ├── simpleDossierBuilder.js  # בונה תיקי מוצר
│   ├── simpleAI.js          # Gemini AI integration
│   ├── productValidator.js  # תרגום + validation
│   ├── productImageService.js   # תמונות מוצרים
│   └── googleShoppingService.js # (לא בשימוש - rate limit)
│
├── routes/                  # API endpoints
│   └── admin.js             # Admin routes
│
├── migrations/              # Schema updates
│   └── 002_add_multiple_images.sql
│
└── package.json
```

### Services מרכזיים

#### 1. simpleDossierBuilder.js - בונה תיקי מוצר

```javascript
class SimpleDossierBuilder {
  async buildDossier(productName, category) {
    // 1. איסוף נתונים (AI + תמונות במקביל)
    const [aiData, images] = await Promise.all([
      this.ai.buildDossier(productName),    // ניתוח AI
      productImageService.getMultipleImages(productName, 3)
    ]);
    
    // 2. שמירת מוצר + תמונה ראשית
    const imageUrl = images[0]?.url || null;
    const productId = await this.saveProduct(
      productName, category, imageUrl, images
    );
    
    // 3. חישוב ציונים
    const scores = this.calculateScores(aiData);
    
    // 4. שמירת תיק ב-DB
    await this.saveDossier(productId, aiData, scores);
    
    return { success: true, productId, scores };
  }
  
  calculateScores(data) {
    // ציון Quality - מבוסס על יתרונות
    const quality = 60 + (data.pros.length * 3) - (data.common_issues.length * 8);
    
    // ציון Value - מבוסס על תמורה
    const value = valueMap[data.value_rating] || 60;
    
    // ציון Reliability - מבוסס על תקלות
    const reliability = 85 - (data.common_issues.length * 10);
    
    // ציון כללי - ממוצע משוקלל
    const overall = (quality * 0.4) + (value * 0.25) + (reliability * 0.35);
    
    return { overall, quality, value, reliability };
  }
}
```

#### 2. productValidator.js - תרגום + אימות

```javascript
class ProductValidator {
  async validateAndTranslate(productName) {
    // אם יש Gemini API key → שימוש ב-AI
    if (this.model) {
      const prompt = `
        Given the product name "${productName}":
        1. Is it a REAL PRODUCT NAME?
        2. What language is it in?
        3. What is the English translation?
        
        Return JSON:
        {
          "isValid": true/false,
          "translatedName": "English product name",
          "originalName": "original input",
          "language": "detected language",
          "reason": "explanation",
          "needsDisambiguation": false,
          "suggestions": ["model1", "model2"] (if generic)
        }
      `;
      
      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    }
    
    // Fallback - תרגום בסיסי מעברית
    return this.basicValidation(productName);
  }
  
  basicValidation(productName) {
    const translations = {
      'איפון': 'iPhone',
      'אייפון': 'iPhone',
      'מקבוק': 'MacBook',
      'אירפודס': 'AirPods',
      // ... עוד תרגומים
    };
    
    // בדיקה אם מילה כללית (JBL, iPhone, Dyson)
    if (this.isGenericBrand(productName)) {
      return {
        isValid: false,
        needsDisambiguation: true,
        suggestions: this.getSuggestionsForBrand(productName),
        reason: 'Query is a brand, not a specific model'
      };
    }
    
    // תרגום
    let translatedName = productName;
    for (const [hebrew, english] of Object.entries(translations)) {
      if (productName.includes(hebrew)) {
        translatedName = productName.replace(hebrew, english);
      }
    }
    
    return {
      isValid: true,
      translatedName,
      originalName: productName,
      language: 'Hebrew'
    };
  }
}
```

#### 3. productImageService.js - תמונות מוצרים

```javascript
class ProductImageService {
  async getMultipleImages(productName, maxImages = 3) {
    const images = [];
    
    // 1. Apple OG image (רק למוצרי Apple)
    if (this.isAppleProduct(productName)) {
      const appleOg = await this.tryAppleOgImage(productName);
      if (appleOg) {
        images.push({
          url: appleOg,
          source: 'apple',
          type: 'primary'
        });
      }
    }
    
    // 2. Wikipedia - תמונות מ-media-list
    try {
      const mediaList = await this.getWikipediaMediaList(productName);
      const exactMatch = this.findExactModelImage(mediaList, productName);
      if (exactMatch) {
        // המרה ל-URL מלא (לא thumb)
        const fullUrl = exactMatch.replace('/thumb/', '/').replace(/\/\d+px-.*$/, '');
        images.push({
          url: fullUrl,
          source: 'wikipedia',
          type: 'secondary'
        });
      }
    } catch (e) {
      console.warn('Wikipedia media-list failed:', e.message);
    }
    
    // 3. Wikipedia REST summary (fallback)
    if (images.length === 0) {
      const summary = await this.getWikipediaSummary(productName);
      if (summary?.originalimage?.source) {
        images.push({
          url: summary.originalimage.source,
          source: 'wikipedia',
          type: 'secondary'
        });
      }
    }
    
    return images.slice(0, maxImages);
  }
  
  async tryAppleOgImage(productName) {
    // בניית URLs למוצר Apple
    const candidates = this.buildAppleCandidates(productName);
    // דוגמה: ['https://www.apple.com/iphone-15/', 'https://www.apple.com/iphone/']
    
    for (const url of candidates) {
      const html = await axios.get(url);
      const ogImage = this.extractMetaTagContent(html.data, 'og:image');
      
      // וידוא שהדף תואם למוצר (לא גנרי)
      if (ogImage && this.applePageLooksLikeMatch(productName, html.data, url)) {
        return ogImage;
      }
    }
    
    return null;
  }
}
```

#### 4. simpleAI.js - Gemini AI Integration

```javascript
class SimpleAI {
  async buildDossier(productName) {
    const prompt = `Analyze the product "${productName}" based on comprehensive web reviews.

Instructions:
1. Analyze review patterns (not just summarize)
2. Identify time-based issues (problems after X months)
3. Find correlations (e.g., "gamers report heating")
4. Detect hidden issues
5. Provide predictive insights

Return ONLY JSON (no markdown):
{
  "summary": "2-3 sentence expert summary",
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"],
  "common_issues": ["issue 1 (with timeframe)", "issue 2"],
  "best_for": ["user type 1", "user type 2"],
  "not_for": ["user type who shouldn't buy"],
  "overall_sentiment": "positive|negative|mixed",
  "value_rating": "excellent|good|fair|poor",
  "confidence": 85
}`;
    
    const result = await this.model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // ניקוי markdown
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?$/g, '')
      .trim();
    
    return JSON.parse(cleaned);
  }
}
```

### API Endpoints

#### GET /api/health
```
תיאור: בדיקת תקינות שרת
Response: {
  success: true,
  status: 'ok',
  services: {
    database: '✅ Connected',
    gemini: '✅ Ready',
    expert_analysis: '✅ Active',
    product_images: '✅ Active'
  }
}
```

#### GET /api/search?q=QUERY
```
תיאור: חיפוש מוצרים
Parameters:
  - q: שם מוצר (חובה)

Response (מוצר כללי):
{
  success: true,
  query: "JBL",
  count: 0,
  products: [],
  suggestions: ["JBL Flip 6", "JBL Charge 5", ...],
  needsDisambiguation: true
}

Response (מוצר ספציפי):
{
  success: true,
  query: "iPhone 15",
  count: 1,
  products: [{
    id: 1,
    name: "iPhone 15",
    category: "smartphone",
    overall_score: 58,
    summary: "..."
  }]
}
```

#### POST /api/products/build
```
תיאור: בניית תיק מוצר חדש
Body: {
  "productName": "iPhone 15",
  "category": "smartphone"  // אופציונלי
}

Response (מוצר תקין):
{
  success: true,
  message: "Dossier built successfully",
  productId: 1,
  data: { ... full dossier ... },
  translation: {
    original: "איפון 15",
    translated: "iPhone 15",
    language: "Hebrew"
  }
}

Response (מוצר כללי - צריך disambiguation):
{
  success: false,
  code: "NEEDS_DISAMBIGUATION",
  error: "Query is too broad",
  reason: "Query is a brand, not a specific model",
  originalInput: "JBL",
  translatedName: "JBL",
  suggestions: ["JBL Flip 6", "JBL Charge 5", ...]
}

Response (מוצר לא תקין):
{
  success: false,
  error: "Invalid product name",
  reason: '"לימון" is not a valid product name',
  originalInput: "לימון",
  suggestion: "Please enter a real product name"
}
```

#### GET /api/products/:id
```
תיאור: קבלת תיק מוצר מלא
Parameters:
  - id: מזהה מוצר

Response:
{
  success: true,
  data: {
    product: {
      id: 1,
      name: "iPhone 15",
      category: "smartphone",
      image_url: "https://upload.wikimedia.org/...",
      images: [
        { url: "...", source: "wikipedia", type: "secondary" }
      ]
    },
    scores: {
      overall: 58,
      quality: 59,
      value: 55,
      reliability: 71
    },
    analysis: {
      summary: "...",
      pros: ["pro 1", "pro 2"],
      cons: ["con 1", "con 2"],
      common_failures: ["issue 1", "issue 2"],
      best_for: ["type 1", "type 2"],
      not_for: ["type 3"]
    },
    meta: {
      total_reviews: null,
      confidence: 30,
      status: "ready",
      last_updated: "2026-01-13T..."
    }
  }
}
```

#### POST /api/admin/clear-dossiers
```
תיאור: מחיקת כל התיקים (לצורכי פיתוח)
Response:
{
  success: true,
  message: "Successfully deleted 6 dossiers",
  deleted: 6,
  note: "Products still exist - you can rebuild dossiers"
}
```

---

## 🗄️ Database - מסד הנתונים

### Schema (PostgreSQL)

```sql
-- טבלת מוצרים
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  image_url TEXT,
  images JSONB DEFAULT '[]'::JSONB,  -- תמונות מרובות
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- טבלת תיקי מוצר
CREATE TABLE dossiers (
  id SERIAL PRIMARY KEY,
  product_id INTEGER UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  overall_score INTEGER,
  quality_score INTEGER,
  value_score INTEGER,
  reliability_score INTEGER,
  summary TEXT,
  pros JSONB,                    -- ["pro 1", "pro 2"]
  cons JSONB,                    -- ["con 1", "con 2"]
  common_failures JSONB,         -- ["issue 1", "issue 2"]
  best_for JSONB,                -- ["user type 1", "user type 2"]
  not_recommended_for JSONB,     -- ["user type 3"]
  total_reviews INTEGER,
  confidence_score DOUBLE PRECISION,
  status TEXT,                   -- 'building' / 'ready'
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- טבלת סיכום ביקורות (לעתיד)
CREATE TABLE reviews_summary (
  id SERIAL PRIMARY KEY,
  product_id INTEGER UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  sources_found INTEGER,
  overall_sentiment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### דוגמת נתונים

```json
// Product
{
  "id": 1,
  "name": "iPhone 15",
  "category": "smartphone",
  "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2b/IPhone_15.jpeg",
  "images": [
    {
      "url": "https://upload.wikimedia.org/wikipedia/commons/2/2b/IPhone_15.jpeg",
      "source": "wikipedia",
      "type": "secondary"
    }
  ],
  "created_at": "2026-01-12T00:00:00Z",
  "updated_at": "2026-01-13T07:27:48Z"
}

// Dossier
{
  "id": 1,
  "product_id": 1,
  "overall_score": 58,
  "quality_score": 59,
  "value_score": 55,
  "reliability_score": 71,
  "summary": "iPhone 15 - early analysis (limited verified review data right now).",
  "pros": [
    "Widely available",
    "Strong brand presence",
    "Plenty of user discussion online"
  ],
  "cons": [
    "Not enough verified review signals yet",
    "Details may change as more data is collected"
  ],
  "common_failures": ["Limited data available"],
  "best_for": ["General users seeking popular products"],
  "not_recommended_for": ["Those needing detailed verified reviews"],
  "total_reviews": null,
  "confidence_score": 30,
  "status": "ready",
  "last_updated": "2026-01-13T07:27:48Z"
}
```

---

## 🧠 AI & Intelligence - מנוע הבינה

### Google Gemini 1.5 Flash

**למה בחרנו בזה?**
- ✅ מהיר (Flash variant)
- ✅ זול ($0.00 לרוב המשתמשים בטירים החינמי)
- ✅ תומך בהיברידי (JSON + טקסט חופשי)
- ✅ תומך ב-100+ שפות

**Alternatives שניסינו:**
- ❌ Claude 3.5 Sonnet - יותר טוב אבל יקר מדי ($15/M tokens)
- ❌ GPT-4 - יקר + rate limits בעייתיים
- ❌ Open-source models - לא מספיק טובים לניתוח עמוק

### Expert Analysis Features

```
1. Pattern Analysis
   ├─ זיהוי תבניות בביקורות
   ├─ "80% מדווחים על התחממות אחרי 6 חודשים"
   └─ קורלציות בין סוגי משתמשים לבעיות

2. Time-based Issues
   ├─ "בטריה מחזיקה שנה, אחר כך יורדת ב-40%"
   └─ "אחריות 2 שנים אבל מתקלקל אחרי 2.5"

3. Hidden Issues Detection
   ├─ ביקורות חיוביות עם "אבל..." חשוד
   ├─ euphemisms ("לא מושלם" = "ממש גרוע")
   └─ contradictions בין ביקורות

4. Predictive Insights
   ├─ "מוצרים דומים נכשלו אחרי 18 חודשים"
   └─ "הדגם החדש פותר בעיות ידועות"

5. User Segmentation
   ├─ "מומלץ לגיימרים" / "לא מומלץ לעריכת וידאו"
   └─ "מצוין לתקציב נמוך" / "לא שווה את המחיר"
```

### Translation & Validation

```
תמיכה בשפות:
├─ עברית → English (איפון 15 → iPhone 15)
├─ רוסית → English (Айфон → iPhone)
├─ ספרדית → English (Teléfono → iPhone)
├─ הודית → English (लैपटॉप → Laptop)
└─ עוד 100+ שפות דרך Gemini

Validation Rules:
├─ Generic brands → Disambiguation (JBL → דגמים)
├─ Generic products → Disambiguation (iPhone → דגמים)
├─ Nonsense → Error (לימון → "not a valid product")
├─ Too short → Error (< 2 chars)
└─ Valid products → Continue to build
```

---

## 🔄 תהליך בניית תיק מוצר

### Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User Input: "איפון 15"                                   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. POST /api/products/build                                  │
│    Body: { productName: "איפון 15" }                        │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Product Validator                                         │
│    ├─ תרגום: "איפון 15" → "iPhone 15"                      │
│    ├─ אימות: מוצר תקין? ✅                                  │
│    └─ Disambiguation: לא נדרש (דגם ספציפי)                  │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Check if Product Exists                                   │
│    Query: SELECT * FROM products WHERE name = 'iPhone 15'   │
│    ├─ קיים עם תיק → Return existing dossier                │
│    └─ לא קיים / ללא תיק → Continue building                │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Parallel Data Collection (30-60 seconds)                 │
│    ┌─────────────────────────┬───────────────────────────┐  │
│    │ AI Analysis             │ Image Fetching            │  │
│    │ (Gemini 1.5 Flash)      │ (Wikipedia + Apple)       │  │
│    │                         │                           │  │
│    │ Prompt:                 │ 1. Apple OG image         │  │
│    │ "Analyze iPhone 15..."  │ 2. Wikipedia media-list   │  │
│    │                         │ 3. Wikipedia summary      │  │
│    │ Returns:                │                           │  │
│    │ - summary               │ Returns:                  │  │
│    │ - pros                  │ - images: [               │  │
│    │ - cons                  │     {url, source, type}   │  │
│    │ - common_issues         │   ]                       │  │
│    │ - best_for              │                           │  │
│    │ - not_for               │                           │  │
│    │ - value_rating          │                           │  │
│    │ - confidence: 30        │                           │  │
│    └────────────┬────────────┴─────────────┬─────────────┘  │
└─────────────────┼──────────────────────────┼────────────────┘
                  │                          │
                  ▼                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Score Calculation                                         │
│    ├─ Overall = sentiment-based (60-90)                     │
│    ├─ Quality = pros × 3 - issues × 8                       │
│    ├─ Value = value_rating map (excellent=90, good=75, ...) │
│    └─ Reliability = 85 - (issues × 10)                      │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Save to Database                                          │
│    ├─ INSERT INTO products (name, category, image_url...)   │
│    │   Returns: productId = 1                               │
│    └─ INSERT INTO dossiers (product_id, scores, analysis...)│
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. Return Response                                           │
│    {                                                         │
│      success: true,                                          │
│      productId: 1,                                           │
│      data: { product, scores, analysis, meta },              │
│      translation: {                                          │
│        original: "איפון 15",                                │
│        translated: "iPhone 15",                              │
│        language: "Hebrew"                                    │
│      }                                                       │
│    }                                                         │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 9. Frontend Redirect                                         │
│    navigate(`/product/${productId}`)                         │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 10. Display Dossier                                          │
│     ├─ Product name + image                                 │
│     ├─ Overall score (58/100)                               │
│     ├─ Verdict: "CONSIDER ALTERNATIVES"                     │
│     ├─ Quality: 59% | Reliability: 71% | Value: 55%         │
│     ├─ Pros (3), Cons (2), Common failures (1)              │
│     └─ Best for / Not for recommendations                   │
└──────────────────────────────────────────────────────────────┘
```

### Performance

```
Timing Breakdown:
├─ Validation + Translation: ~200ms
├─ AI Analysis (Gemini): 8-15 seconds
├─ Image Fetching: 2-5 seconds (parallel)
├─ Score Calculation: <10ms
├─ Database Save: ~50ms
└─ Total: 10-20 seconds (average: 15s)

Optimization:
├─ Parallel execution (AI + Images)
├─ Caching (existing products)
├─ Efficient DB queries
└─ No unnecessary API calls
```

---

## 📚 API Documentation

### Base URL
```
Production: https://clearpick-ai.onrender.com/api
Development: http://localhost:3000/api
```

### Authentication
```
כרגע: אין authentication (public API)
עתיד: JWT tokens למשתמשים מחוברים
```

### Rate Limiting
```
15 דקות: 100 requests max
Status: 429 Too Many Requests (אם עוברים)
```

### Error Responses

```json
// 400 Bad Request
{
  "success": false,
  "error": "Invalid product name",
  "reason": "\"לימון\" is not a valid product name"
}

// 404 Not Found
{
  "success": false,
  "error": "Product not found"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Database unavailable",
  "stack": "..." // only in development
}
```

### Complete API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Server info | ❌ |
| GET | `/api/health` | Health check | ❌ |
| GET | `/api/stats` | Public stats | ❌ |
| GET | `/api/search?q=QUERY` | Search products | ❌ |
| GET | `/api/products` | List all products | ❌ |
| GET | `/api/products/:id` | Get dossier | ❌ |
| POST | `/api/products/build` | Build dossier | ❌ |
| POST | `/api/products/:id/rebuild` | Force rebuild | ❌ |
| POST | `/api/admin/clear-dossiers` | Clear all dossiers | ⏭️ (future) |

---

## 🚀 Deployment & Infrastructure

### Frontend Deployment (Vercel)

```
Platform: Vercel
URL: https://www.clearpickai.com
     https://clearpick-ai.vercel.app (alternative)

Features:
├─ Auto-deploy on git push to main
├─ Edge Network (CDN global)
├─ Instant cache invalidation
├─ Zero-config (vite.config.js auto-detected)
└─ Environment variables
   └─ VITE_API_URL (optional - auto-detected)

Build Command: npm run build
Output Directory: dist
Framework: Vite
```

### Backend Deployment (Render)

```
Platform: Render
URL: https://clearpick-ai.onrender.com

Features:
├─ Auto-deploy on git push to main
├─ Free tier (spins down after 15 min inactivity)
├─ PostgreSQL database included
├─ Environment variables (secrets)
└─ Auto-restart on crash

Environment Variables:
├─ DATABASE_URL (auto from Render PostgreSQL)
├─ GEMINI_API_KEY (Google AI Studio)
├─ PORT (auto from Render)
└─ NODE_ENV=production

Build Command: npm install
Start Command: npm start (→ node server-unified.js)
```

### Database (Render PostgreSQL)

```
Platform: Render PostgreSQL
Plan: Free (limited storage + connections)

Connection:
├─ Host: dpg-xxxx.oregon-postgres.render.com
├─ Database: clearPickDB
├─ User: clearPick
└─ SSL: Required (sslmode=require)

Backup Strategy:
├─ Manual: pg_dump via terminal
├─ Automatic: Render daily backups (paid plan)
└─ Schema migrations: /migrations/*.sql
```

### DNS Configuration

```
Domain: clearpickai.com
Registrar: Namecheap
DNS Provider: Namecheap

Records:
├─ A     clearpickai.com     → 216.198.79.1 (Vercel)
├─ CNAME www.clearpickai.com → cname.vercel-dns.com
└─ TTL: 1800 seconds (30 minutes)

SSL:
├─ Auto from Vercel (Let's Encrypt)
└─ Auto-renewal every 90 days
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──► DNS (Namecheap)
             │    └─ clearpickai.com → Vercel IP
             │
             ├──► Vercel CDN (Edge Network)
             │    ├─ Static files (HTML, CSS, JS, images)
             │    ├─ Global caching
             │    └─ Serves: Frontend (React)
             │
             └──► Render (US West)
                  ├─ Node.js server (Express)
                  ├─ Auto-wake on first request (~30s)
                  └─ Connects to → PostgreSQL
                       ├─ products table
                       ├─ dossiers table
                       └─ reviews_summary table
```

---

## ✨ Features מתקדמים

### 1. Smart Disambiguation

```
Problem: משתמש מכניס "JBL" → יש עשרות דגמים
Solution: המערכת מציגה רשימת דגמים פופולריים

Implementation:
├─ productValidator מזהה brand כללי
├─ מחזיר needsDisambiguation: true + suggestions
├─ Frontend מציג UI עם כפתורים
└─ משתמש בוחר דגם → ממשיך לבניית תיק

Example Brands:
├─ JBL → Flip 6, Charge 5, Xtreme 3, Tune 760NC
├─ iPhone → 15, 15 Pro, 15 Pro Max, 15 Plus, 14
├─ Dyson → V15, V12, Gen5detect, Airwrap
└─ Samsung → Galaxy S24, S23, A54, Z Fold 5
```

### 2. Multi-language Support

```
Supported Languages:
├─ Hebrew (עברית) → English
├─ Russian (Русский) → English
├─ Spanish (Español) → English
├─ Hindi (हिन्दी) → English
├─ Arabic (العربية) → English
└─ 100+ languages via Gemini

Translation Flow:
1. User input: "איפון 15"
2. productValidator.validateAndTranslate()
3. Gemini AI: {"translatedName": "iPhone 15", "language": "Hebrew"}
4. Build dossier with English name
5. Display to user: "Translated from Hebrew: איפון 15 → iPhone 15"

Fallback (no AI):
├─ Basic dictionary for common products
└─ Direct mapping: איפון → iPhone, מקבוק → MacBook
```

### 3. High-Quality Images

```
Sources Priority:
1. Apple OG Images (highest quality, official)
   ├─ Extracted from <meta property="og:image">
   ├─ Only for Apple products
   └─ Validation: page title must match product

2. Wikipedia Media-List (real photos)
   ├─ Fetches from /api/rest_v1/page/media-list/{product}
   ├─ Filters for exact model (iPhone_15.jpeg, not iPhone_15_Plus.jpeg)
   └─ Converts thumb URLs → original full-size URLs

3. Wikipedia Summary (fallback)
   ├─ Fetches from /api/rest_v1/page/summary/{product}
   └─ Uses originalimage.source (not thumbnail)

4. Google Custom Search (disabled due to rate limit)
   ├─ 100 queries/day limit → too restrictive
   └─ May re-enable with paid API key

Validation:
├─ No generic images (3 phones together ❌)
├─ No wrong model images (iPhone 17 for iPhone 15 ❌)
└─ Only exact model matches ✅
```

### 4. Intelligent Validation

```
Validation Rules:
├─ 1. Length check (min 2 chars)
├─ 2. Blacklist check (test, לימון, banana, etc.)
├─ 3. Generic brand check (JBL → needs model)
├─ 4. Generic product check (iPhone → needs generation)
├─ 5. Translation (if non-English)
└─ 6. AI validation (if Gemini available)

Examples:
├─ "JBL" → ❌ needsDisambiguation: true
├─ "לימון" → ❌ "not a valid product name"
├─ "test" → ❌ "not a valid product name"
├─ "iPhone" → ❌ needsDisambiguation: true
├─ "איפון 15" → ✅ translates to "iPhone 15"
└─ "iPhone 15" → ✅ valid, continues to build
```

### 5. Backend Auto-Wake

```
Problem: Render free tier spins down after 15 min inactivity
Solution: Frontend auto-wakes backend on mount

Implementation (SearchPagePremium.jsx):
useEffect(() => {
  wakeBackend(); // Runs on page load
}, []);

async wakeBackend() {
  setBackendStatus('waking');
  try {
    const resp = await fetch('/api/health', { timeout: 12000 });
    setBackendStatus('ready');
  } catch {
    setBackendStatus('waking'); // Show loading state
  }
}

User Experience:
├─ First request: 20-30 seconds (cold start)
├─ Subsequent requests: <1 second (warm)
└─ UI shows: "Waking the server... first request can take ~30s"
```

### 6. Backward Compatibility

```
Problem: Production DB may not have new columns (images JSONB)
Solution: Dynamic schema checks before queries

Implementation:
// Check if column exists
const schemaCheck = await db.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'products' AND column_name = 'images'
`);

if (schemaCheck.rows.length > 0) {
  // New schema - use images column
  await db.query('SELECT id, name, images FROM products WHERE id = $1', [id]);
} else {
  // Old schema - fallback to image_url only
  await db.query('SELECT id, name, image_url FROM products WHERE id = $1', [id]);
}

Benefits:
├─ No downtime during migrations
├─ Gradual rollout of new features
└─ Safe to deploy before running migrations
```

---

## 🔐 Security & Best Practices

### Environment Variables

```
Backend (.env):
├─ DATABASE_URL (PostgreSQL connection)
├─ GEMINI_API_KEY (Google AI Studio)
└─ PORT (3000 in dev, auto in prod)

Frontend (.env):
└─ VITE_API_URL (optional - auto-detected)

Security:
├─ Never commit .env files
├─ Use .env.example for documentation
├─ Store secrets in Render/Vercel dashboards
└─ Rotate API keys regularly
```

### API Security

```
Implemented:
├─ Helmet.js (security headers)
├─ CORS (allow all origins - public API)
├─ Rate limiting (100 req/15min per IP)
├─ Input validation (productValidator)
├─ SQL injection protection (parameterized queries)
└─ XSS protection (React auto-escapes)

Future:
├─ JWT authentication
├─ User accounts
├─ API key per user
├─ Request logging
└─ Abuse detection
```

### Database Security

```
├─ SSL required (Render PostgreSQL)
├─ Connection pooling (pg library)
├─ Parameterized queries (no string concatenation)
├─ Automatic schema creation (safe DDL)
└─ Cascading deletes (ON DELETE CASCADE)
```

---

## 📊 Monitoring & Debugging

### Logs

```
Backend Logs (Render):
├─ Server startup logs
├─ API request logs (method, path, timestamp)
├─ AI analysis logs (prompts, responses)
├─ Image fetching logs (sources, failures)
├─ Database query logs
└─ Error stack traces

Frontend Logs (Browser Console):
├─ API fetch logs
├─ React component lifecycle
├─ Errors (boundaries catch)
└─ Navigation logs (React Router)

Access:
├─ Render Dashboard → Logs tab
└─ Browser DevTools → Console
```

### Health Checks

```
GET /api/health:
{
  success: true,
  status: 'ok',
  timestamp: '2026-01-13T...',
  uptime: 12345.67,
  services: {
    database: '✅ Connected',
    gemini: '✅ Ready (Expert Analysis)',
    expert_analysis: '✅ Active',
    product_images: '✅ Active'
  }
}

Status meanings:
├─ 'ok' → All services operational
├─ 'degraded' → DB down but server up
└─ Error → Server unreachable
```

### Performance Monitoring

```
Metrics to Track:
├─ API response time (p50, p95, p99)
├─ AI analysis duration
├─ Image fetch duration
├─ Database query time
├─ Frontend load time (Core Web Vitals)
└─ Error rate

Tools:
├─ Render built-in metrics
├─ Browser DevTools → Network/Performance
└─ Future: Sentry/LogRocket/DataDog
```

---

## 🛠️ Development Workflow

### Local Setup

```bash
# 1. Clone repository
git clone https://github.com/trqmsh3-sudo/-clearpick-ai.git
cd -clearpick-ai

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys

# 3. Database setup (local PostgreSQL)
createdb clearPickDB
npm run migrate

# 4. Start backend
npm start  # http://localhost:3000

# 5. Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev  # http://localhost:5173

# 6. Open browser
# http://localhost:5173
```

### Git Workflow

```
main branch:
├─ Auto-deploys to Production
├─ Protected (no force push)
└─ All features merged here

Development flow:
1. Create feature branch: git checkout -b feature/name
2. Make changes + commit
3. Push: git push origin feature/name
4. Test locally
5. Merge to main: git merge feature/name
6. Push main → auto-deploy
```

### Testing

```
Backend Testing:
├─ Manual: Use Postman/Insomnia
├─ Automated: Jest (future)
└─ Health check: curl http://localhost:3000/api/health

Frontend Testing:
├─ Manual: Browser testing
├─ Automated: Vitest + React Testing Library (future)
└─ E2E: Playwright (future)

Integration Testing:
└─ Manual flow testing (search → build → view)
```

---

## 🎓 מושגים טכניים

### REST API
```
Representational State Transfer
├─ HTTP methods: GET, POST, PUT, DELETE
├─ Stateless (no session on server)
├─ JSON for data exchange
└─ URLs represent resources (/api/products/5)
```

### React Hooks
```
useState: state management
├─ const [query, setQuery] = useState('');
└─ Updates trigger re-render

useEffect: side effects
├─ Data fetching
├─ Subscriptions
└─ Cleanup on unmount

Custom Hooks: reusable logic
└─ useProductDossier (fetch + cache dossier)
```

### PostgreSQL JSONB
```
JSON Binary - efficient JSON storage
├─ Indexed queries (GIN index)
├─ Flexible schema (pros/cons arrays)
└─ Example: pros: ["pro 1", "pro 2"]
```

### Tailwind CSS
```
Utility-first CSS framework
├─ No custom CSS files
├─ Compose styles with classes
└─ Example: "flex items-center gap-4 p-6 bg-mint-50"
```

### Express Middleware
```
Functions that process requests
├─ helmet() → security headers
├─ cors() → cross-origin requests
├─ express.json() → parse JSON body
└─ Custom: rate limiting, logging
```

---

## 🚀 Future Roadmap

### Phase 1: Core Features ✅ (DONE)
- [x] Product search
- [x] Dossier building
- [x] AI analysis (Gemini)
- [x] Multi-language support
- [x] Smart disambiguation
- [x] High-quality images

### Phase 2: Enhanced Intelligence 🚧 (IN PROGRESS)
- [ ] Real web scraping (Reddit, YouTube, Amazon)
- [ ] Time-based analysis (issues over time)
- [ ] Price tracking
- [ ] Competitor comparison
- [ ] User segmentation (better "best for")

### Phase 3: User Features 📅 (PLANNED)
- [ ] User accounts (JWT)
- [ ] Saved products
- [ ] Custom lists
- [ ] Email alerts (price drops, new reviews)
- [ ] API for developers

### Phase 4: Business 💼 (FUTURE)
- [ ] Affiliate links (Amazon, etc.)
- [ ] Premium tier (more dossiers/month)
- [ ] Business API (B2B)
- [ ] White-label solution

---

## 📞 מידע נוסף

### GitHub Repository
```
URL: https://github.com/trqmsh3-sudo/-clearpick-ai
Visibility: Private
Branches: main
```

### Contact
```
Developer: [Your Name]
Email: [Your Email]
Website: https://www.clearpickai.com
```

### License
```
Type: Private / Proprietary
Usage: Internal only
```

---

## 🎉 סיכום

**ClearPick.ai** היא מערכת מתקדמת המשלבת:
- ✅ AI (Google Gemini) לניתוח עמוק
- ✅ React + Node.js לארכיטקטורה מודרנית
- ✅ PostgreSQL לניהול נתונים
- ✅ תמיכה רב-לשונית
- ✅ תמונות איכותיות
- ✅ חוויית משתמש מעולה

המערכת מוכנה לייצור ומוכנה להתרחבות עתידית! 🚀
