# 🔌 רשימת חיבורים ואינטגרציות - ClearPick.ai

## מה יושם ומה צריך לחבר

---

## ✅ **מה כבר עובד (Frontend):**

### **UI Components:**
- ✅ Header & Footer
- ✅ Logo
- ✅ Home page
- ✅ About Us page
- ✅ Product Intelligence page
- ✅ Trust Loader (4 phases)
- ✅ Affiliate Disclosure
- ✅ Price Comparison UI
- ✅ Featured Analyses
- ✅ Summary Card
- ✅ Accordion Sections
- ✅ Sticky CTA
- ✅ Mobile optimizations
- ✅ Data Sources logos

### **Styling:**
- ✅ Tailwind config (Mint/Navy theme)
- ✅ Mobile-first CSS
- ✅ Responsive design
- ✅ Animations
- ✅ Dark mode support

---

## 🔴 **מה צריך לחבר (Backend + APIs):**

---

## 1️⃣ **Backend Server**

### **מה צריך:**
```bash
cd backend
npm install
npm start
```

### **קבצים שצריך:**
- ✅ `backend/config/ai.config.js` - יש
- ✅ `backend/config/cache.config.js` - יש
- ✅ `backend/config/datasources.config.js` - יש
- ✅ `backend/config/affiliate.config.js` - יש
- ✅ `backend/services/aiService.js` - יש
- ✅ `backend/services/cacheService.js` - יש
- ❌ `backend/server.js` - **צריך ליצור!**
- ❌ `backend/routes/products.js` - **צריך ליצור!**

---

## 2️⃣ **API Keys (Environment Variables)**

### **צריך ליצור קובץ `.env`:**

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000

# Backend (.env)
PORT=3000

# OpenAI (for AI analysis)
OPENAI_API_KEY=sk-...your-key-here

# Rainforest API (for Amazon data)
RAINFOREST_API_KEY=...your-key-here

# Google Shopping API (for small retailers)
GOOGLE_SHOPPING_API_KEY=...your-key-here
GOOGLE_SHOPPING_CX=...your-cx-here

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Affiliate IDs
AMAZON_AFFILIATE_TAG=clearpick-20
WALMART_AFFILIATE_ID=...your-id
BESTBUY_AFFILIATE_ID=...your-id
```

---

## 3️⃣ **Database / Cache Setup**

### **Redis (for caching):**
```bash
# Windows (via Chocolatey)
choco install redis-64

# Or use Docker
docker run -d -p 6379:6379 redis

# Or use Redis Cloud (free tier)
# https://redis.com/try-free/
```

### **MongoDB (optional - for storing analyses):**
```bash
# Use MongoDB Atlas (free tier)
# https://www.mongodb.com/cloud/atlas

# Or local:
# Download from mongodb.com
```

---

## 4️⃣ **API Integrations**

### **A. OpenAI API**
**Purpose:** AI analysis of reviews

**Steps:**
1. Sign up: https://platform.openai.com/
2. Create API key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`
4. Cost: ~$0.50 per 1000 analyses (GPT-4o-mini)

---

### **B. Rainforest API**
**Purpose:** Fetch Amazon product data & reviews

**Steps:**
1. Sign up: https://www.rainforestapi.com/
2. Get API key
3. Add to `.env`: `RAINFOREST_API_KEY=...`
4. Cost: $0.01 per request (100 free requests)

---

### **C. Google Shopping API**
**Purpose:** Find prices from small/independent retailers

**Steps:**
1. Go to: https://console.cloud.google.com/
2. Enable "Custom Search API"
3. Create Custom Search Engine
4. Get API key & CX ID
5. Add to `.env`
6. Cost: $5 per 1000 queries (100 free per day)

---

### **D. Affiliate Programs**

#### **Amazon Associates:**
1. Sign up: https://affiliate-program.amazon.com/
2. Get affiliate tag (e.g., `clearpick-20`)
3. Add to `.env`: `AMAZON_AFFILIATE_TAG=clearpick-20`

#### **Walmart Affiliates:**
1. Sign up: https://affiliates.walmart.com/
2. Get affiliate ID
3. Add to `.env`

#### **Best Buy Affiliates:**
1. Sign up: https://www.bestbuy.com/site/affiliate-program
2. Get affiliate ID
3. Add to `.env`

---

## 5️⃣ **Backend Routes (צריך ליצור)**

### **קובץ: `backend/server.js`**
```javascript
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### **קובץ: `backend/routes/products.js`**
```javascript
const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const cacheService = require('../services/cacheService');

// Search product
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Check cache
    const cached = await cacheService.get(query);
    if (cached) {
      return res.json(cached);
    }
    
    // Fetch from Rainforest API
    // Analyze with AI
    // Cache result
    // Return data
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 6️⃣ **Frontend Integration**

### **קובץ: `frontend/src/services/api.js` (צריך ליצור)**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const searchProduct = async (query) => {
  const response = await fetch(`${API_URL}/api/products/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return response.json();
};

export const getProductDetails = async (productId) => {
  const response = await fetch(`${API_URL}/api/products/${productId}`);
  return response.json();
};
```

---

### **עדכון: `frontend/src/pages/ProductIntel.jsx`**
```javascript
import { searchProduct } from '../services/api';

const handleSearch = async () => {
  setIsLoading(true);
  try {
    const result = await searchProduct(searchQuery);
    setResults(result.data);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 7️⃣ **Testing Flow**

### **Local Development:**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start
# Server runs on http://localhost:3000

# Terminal 2 - Frontend
cd frontend
npm run dev
# App runs on http://localhost:5173

# Terminal 3 - Redis (if local)
redis-server
```

---

## 📊 **Integration Priority:**

### **Phase 1: Basic (Week 1)**
1. ✅ Create backend server.js
2. ✅ Create products routes
3. ✅ Connect frontend to backend
4. ✅ Test with mock data

### **Phase 2: APIs (Week 2)**
1. ⏳ Sign up for OpenAI
2. ⏳ Sign up for Rainforest API
3. ⏳ Integrate AI analysis
4. ⏳ Integrate product data fetching

### **Phase 3: Caching (Week 3)**
1. ⏳ Set up Redis
2. ⏳ Implement caching logic
3. ⏳ Test cache hit/miss

### **Phase 4: Monetization (Week 4)**
1. ⏳ Sign up for affiliate programs
2. ⏳ Integrate affiliate links
3. ⏳ Add Google Shopping API
4. ⏳ Test price comparison

---

## 💰 **Cost Breakdown:**

### **Monthly Costs (Estimated):**
- **OpenAI API:** $50-100 (1000-2000 analyses)
- **Rainforest API:** $10-20 (1000-2000 requests)
- **Google Shopping:** $50 (10,000 searches)
- **Redis Cloud:** $0 (free tier)
- **MongoDB Atlas:** $0 (free tier)
- **Hosting:** $5-10 (Vercel/Netlify)

**Total:** ~$115-180/month

### **Revenue Potential:**
- 1000 users/month
- 10% click-through rate = 100 clicks
- 5% conversion = 5 sales
- $20 average commission = **$100/month**

**Break-even:** ~2000 users/month

---

## 🎯 **Quick Start (Minimal Setup):**

### **Option 1: Mock Data (No APIs)**
```javascript
// Use mock data for testing UI
const mockResults = {
  title: "Sony WH-1000XM5",
  trustScore: 87,
  price: 349.99,
  // ... mock data
};
```

### **Option 2: Free Tier Only**
- OpenAI: $5 free credit
- Rainforest: 100 free requests
- Google Shopping: 100 free per day
- Redis Cloud: Free tier
- MongoDB Atlas: Free tier

**Can test for free!**

---

## ✅ **Checklist:**

### **Backend:**
- [ ] Create `backend/server.js`
- [ ] Create `backend/routes/products.js`
- [ ] Install dependencies (`express`, `cors`, `dotenv`)
- [ ] Create `.env` file
- [ ] Test server runs

### **APIs:**
- [ ] Sign up for OpenAI
- [ ] Sign up for Rainforest API
- [ ] Sign up for Google Shopping API
- [ ] Add API keys to `.env`
- [ ] Test API calls

### **Caching:**
- [ ] Install Redis (local or cloud)
- [ ] Test Redis connection
- [ ] Implement caching logic

### **Frontend:**
- [ ] Create `frontend/src/services/api.js`
- [ ] Update ProductIntel.jsx to use real API
- [ ] Test search flow
- [ ] Test loading states

### **Affiliates:**
- [ ] Sign up for Amazon Associates
- [ ] Sign up for Walmart Affiliates
- [ ] Sign up for Best Buy Affiliates
- [ ] Add affiliate IDs to `.env`
- [ ] Test affiliate links

---

## 🚀 **Next Steps:**

1. **אני יכול ליצור את קבצי ה-Backend** (`server.js`, `routes/products.js`)
2. **אני יכול ליצור את `api.js` ב-Frontend**
3. **אתה צריך להירשם ל-APIs** (OpenAI, Rainforest, etc.)
4. **נחבר הכל ונבדוק**

**רוצה שאתחיל ליצור את קבצי ה-Backend?** 🚀
