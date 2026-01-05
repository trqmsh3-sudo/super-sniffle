# 🔍 Technical Questions - ClearPick.ai System Architecture

## Answers to Technical Implementation Questions

---

## 1. **Data Sources - What are the exact data sources the system is currently using?**

### **Current Implementation:**

#### **Amazon Data:**
- **Method:** Web scraping using **Puppeteer**
- **What we scrape:**
  - Product title, price, rating
  - Customer reviews (text + star ratings)
  - Product images
  - "Verified Purchase" badges
  - Review dates and helpfulness votes
- **API:** Amazon Product Advertising API (planned for future)
- **Frequency:** Real-time on user request

#### **Reddit Data:**
- **Method:** **Snoowrap** (Reddit API wrapper)
- **What we fetch:**
  - Posts mentioning the product
  - Comments and discussions
  - Upvotes/downvotes
  - User karma (to filter spam accounts)
- **Subreddits searched:** r/BuyItForLife, r/ProductReviews, product-specific subs
- **Rate limits:** 60 requests/minute (Reddit API limit)

#### **Planned Future Sources:**
- Walmart API
- Best Buy API
- YouTube reviews (via YouTube Data API)
- Expert review sites (TechRadar, Wirecutter, etc.)

### **Current Status:**
```javascript
// Backend structure (planned):
const dataSources = {
  amazon: {
    method: 'puppeteer',
    endpoint: '/api/scrape/amazon',
    status: 'planned'
  },
  reddit: {
    method: 'snoowrap',
    endpoint: '/api/scrape/reddit',
    status: 'planned'
  }
}
```

### **Answer:**
Currently, the system is **planned** to use:
- **Puppeteer** for Amazon web scraping
- **Snoowrap** for Reddit API integration
- **No static datasets** - all data is fetched in real-time

**Status:** Backend implementation is **not yet built** - only frontend UI exists.

---

## 2. **Sentiment Analysis - How does it work?**

### **Current Implementation:**

#### **Primary Method: LLM-Based Analysis**
- **AI Model:** **Anthropic Claude 3.5 Sonnet**
- **Process:**
  1. Collect all reviews (Amazon + Reddit)
  2. Send to Claude with structured prompt
  3. Claude analyzes:
     - Overall sentiment (positive/negative/mixed)
     - Common themes (pros/cons)
     - Fake review detection
     - Value assessment
  4. Return structured JSON response

#### **Prompt Structure:**
```
Analyze these product reviews:
[Reviews data]

Provide:
1. Overall sentiment score (1-10)
2. Top 5 pros
3. Top 5 cons
4. Fake review indicators
5. Value for money assessment
6. Final recommendation
```

#### **Fallback Method: Star Ratings + Keywords**
If LLM fails or is too expensive:
- Calculate average star rating
- Count positive keywords (great, excellent, love)
- Count negative keywords (terrible, broke, waste)
- Simple sentiment score = (positive - negative) / total

### **Current Status:**
```javascript
// Planned backend logic:
async function analyzeSentiment(reviews) {
  try {
    // Primary: Claude AI
    const aiAnalysis = await claudeAPI.analyze(reviews);
    return aiAnalysis;
  } catch (error) {
    // Fallback: Keyword matching
    return keywordBasedAnalysis(reviews);
  }
}
```

### **Answer:**
The system uses **Claude AI (LLM)** as the primary method for deep sentiment analysis. It analyzes actual review text, not just star ratings. A keyword-based fallback exists for cost/error scenarios.

**Status:** Backend implementation is **planned but not built yet**.

---

## 3. **Fake Review Detection - Are there built-in filters?**

### **Current Implementation:**

#### **Multi-Layer Fake Review Detection:**

**Layer 1: AI-Based Detection (Claude)**
Claude is prompted to identify:
- Generic/templated language
- Overly promotional tone
- Suspicious timing patterns
- Lack of specific details
- Incentivized review indicators

**Layer 2: Metadata Filters**
```javascript
const fakeReviewIndicators = {
  // Amazon-specific
  verifiedPurchase: false,        // Not verified = suspicious
  reviewerRating: '1-2 reviews',  // New account = suspicious
  helpfulVotes: 0,                // No engagement = suspicious
  
  // Reddit-specific
  accountAge: '<30 days',         // New account
  karma: '<100',                  // Low karma = bot
  postHistory: 'promotional only' // Spam pattern
}
```

**Layer 3: Pattern Recognition**
- Multiple reviews posted same day
- Identical phrasing across reviews
- Extreme ratings (all 5-star or all 1-star)
- Reviews from same IP range (if available)

**Layer 4: Cross-Reference**
- Compare Amazon reviews with Reddit discussions
- Flag products with high Amazon rating but negative Reddit sentiment
- Identify review bombing campaigns

### **Fake Review Scoring:**
```javascript
function calculateFakeScore(review) {
  let suspicionScore = 0;
  
  if (!review.verifiedPurchase) suspicionScore += 30;
  if (review.isGeneric) suspicionScore += 25;
  if (review.accountAge < 30) suspicionScore += 20;
  if (review.hasIncentive) suspicionScore += 25;
  
  return suspicionScore; // 0-100
  // >60 = likely fake, exclude from analysis
}
```

### **Answer:**
Yes, the system has **multiple built-in mechanisms**:
1. **AI detection** via Claude prompts
2. **Metadata filtering** (verified purchase, account age, karma)
3. **Pattern recognition** (timing, language, behavior)
4. **Cross-platform validation** (Amazon vs Reddit)

Reviews with fake score >60% are excluded from analysis.

**Status:** Logic is **designed but not implemented yet**.

---

## 4. **Affiliate Links & Price Comparison - How is it structured?**

### **Current Implementation:**

#### **Affiliate Link Integration:**

**Backend Structure:**
```javascript
// Affiliate link generator
const affiliateLinks = {
  amazon: {
    tag: 'clearpick-20',  // Amazon Associates ID
    format: (asin) => `https://amazon.com/dp/${asin}?tag=clearpick-20`
  },
  walmart: {
    publisherId: 'XXXXX',
    format: (itemId) => `https://walmart.com/ip/${itemId}?wmlspartner=clearpick`
  }
}

// Usage
function generateAffiliateLink(product, retailer) {
  return affiliateLinks[retailer].format(product.id);
}
```

#### **Real-Time Price Comparison:**

**Process:**
1. User searches for product
2. System scrapes/fetches from multiple retailers:
   - Amazon
   - Walmart
   - Best Buy
   - Target (future)
3. Compare prices in real-time
4. Return sorted by price (lowest first)
5. Each link includes affiliate tag

**Price Comparison API:**
```javascript
async function comparePrices(productName) {
  const [amazonPrice, walmartPrice, bestbuyPrice] = await Promise.all([
    scrapeAmazon(productName),
    scrapeWalmart(productName),
    scrapeBestBuy(productName)
  ]);
  
  return {
    prices: [
      { retailer: 'Amazon', price: amazonPrice, link: generateAffiliateLink(...) },
      { retailer: 'Walmart', price: walmartPrice, link: generateAffiliateLink(...) },
      { retailer: 'Best Buy', price: bestbuyPrice, link: generateAffiliateLink(...) }
    ].sort((a, b) => a.price - b.price)
  };
}
```

#### **Caching Strategy:**
```javascript
// Redis cache for price data
const priceCache = {
  key: `price:${productId}`,
  ttl: 3600, // 1 hour
  // Refresh prices every hour to stay current
}
```

### **Answer:**
- **Affiliate links:** Structured with retailer-specific tags (Amazon Associates, Walmart Affiliates)
- **Price comparison:** Yes, supports **real-time comparison** across multiple retailers
- **Caching:** Prices cached for 1 hour to reduce API costs
- **Revenue model:** Commission on purchases through affiliate links

**Status:** Backend structure is **designed but not implemented**.

---

## 5. **User Privacy & Data Storage - What's the architecture?**

### **Current Implementation:**

#### **Data Storage Policy:**

**What We Store:**
```javascript
const userDataStorage = {
  // Authentication (via Supabase)
  userId: 'uuid',
  email: 'encrypted',
  passwordHash: 'bcrypt',
  
  // Usage Tracking
  searchHistory: {
    stored: true,
    retention: '90 days',
    purpose: 'improve recommendations',
    userControl: 'can delete anytime'
  },
  
  // Analytics (anonymized)
  pageViews: 'anonymized',
  clickEvents: 'anonymized',
  searchQueries: 'aggregated only'
}
```

**What We DON'T Store:**
- ❌ Credit card details (handled by Stripe)
- ❌ Browsing history outside our site
- ❌ Personal identifiable info beyond email
- ❌ IP addresses (except for fraud prevention)

#### **Privacy Architecture:**

**Database Schema (Supabase):**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) ENCRYPTED,
  created_at TIMESTAMP,
  subscription_tier VARCHAR(50)
);

-- Search history (optional, user can disable)
CREATE TABLE search_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  query TEXT,
  timestamp TIMESTAMP,
  results_shown INTEGER
);
-- Auto-delete after 90 days

-- Usage limits
CREATE TABLE usage_tracking (
  user_id UUID,
  date DATE,
  searches_count INTEGER,
  PRIMARY KEY (user_id, date)
);
```

#### **Privacy Controls:**

**User Dashboard Features:**
```javascript
const privacyControls = {
  searchHistory: {
    toggle: 'on/off',
    delete: 'delete all',
    export: 'download JSON'
  },
  dataRetention: {
    option1: 'keep 30 days',
    option2: 'keep 90 days',
    option3: 'delete immediately'
  },
  accountDeletion: {
    action: 'delete all data',
    compliance: 'GDPR/CCPA right to be forgotten'
  }
}
```

#### **Compliance:**

**GDPR (Europe):**
- ✅ Right to access data
- ✅ Right to delete data
- ✅ Right to export data
- ✅ Consent before tracking
- ✅ Data encryption

**CCPA (California):**
- ✅ Disclose data collection
- ✅ Opt-out of data sale (we don't sell)
- ✅ Delete personal data on request

**Security Measures:**
```javascript
const securityMeasures = {
  encryption: {
    inTransit: 'TLS 1.3',
    atRest: 'AES-256'
  },
  authentication: {
    method: 'Supabase Auth',
    mfa: 'optional',
    sessionTimeout: '24 hours'
  },
  apiSecurity: {
    rateLimit: '100 requests/minute',
    apiKeys: 'environment variables only',
    cors: 'whitelist only'
  }
}
```

### **Answer:**
**Data Storage:**
- **Search history:** Stored for 90 days (user can disable/delete)
- **Personal data:** Email only (encrypted)
- **Payment data:** NOT stored (Stripe handles it)

**Privacy Architecture:**
- **Database:** Supabase (PostgreSQL with encryption)
- **Compliance:** GDPR + CCPA compliant
- **User control:** Full data export, deletion, and privacy settings

**Status:** Privacy policy is **written**, backend implementation is **planned**.

---

## 📊 **Implementation Status Summary**

| Component | Status | Priority |
|-----------|--------|----------|
| Frontend UI | ✅ Complete | - |
| Amazon Scraper | 🟡 Planned | High |
| Reddit Integration | 🟡 Planned | High |
| Claude AI Analysis | 🟡 Planned | High |
| Fake Review Detection | 🟡 Designed | Medium |
| Affiliate Links | 🟡 Designed | Medium |
| Price Comparison | 🟡 Designed | Medium |
| User Database | 🟡 Planned | High |
| Privacy Controls | 🟡 Designed | High |

---

## 🚀 **Next Steps for Implementation**

### **Phase 1: MVP Backend (Weeks 1-2)**
1. Set up Express.js backend
2. Implement Amazon scraper (Puppeteer)
3. Implement Reddit integration (Snoowrap)
4. Connect Claude AI API
5. Set up Redis caching

### **Phase 2: User System (Week 3)**
6. Set up Supabase authentication
7. Implement usage tracking
8. Create user dashboard

### **Phase 3: Monetization (Week 4)**
9. Set up affiliate link system
10. Implement price comparison
11. Connect Stripe for payments

### **Phase 4: Privacy & Security (Week 5)**
12. Implement privacy controls
13. Add data encryption
14. GDPR/CCPA compliance testing

---

## 💡 **Technical Recommendations**

### **For Better Fake Review Detection:**
1. Use **ReviewMeta API** (paid service, $50/month)
2. Implement **Fakespot integration** (free tier available)
3. Train custom ML model on labeled fake review dataset

### **For Better Price Comparison:**
1. Use **Rainforest API** for Amazon (more reliable than scraping)
2. Use **Walmart Open API** (free)
3. Implement **price history tracking** (show price trends)

### **For Better Performance:**
1. Use **Redis** for caching (reduce API costs by 80%)
2. Implement **queue system** (Bull.js) for long-running scrapes
3. Use **CDN** (Cloudflare) for static assets

---

## 📞 **Questions or Need Clarification?**

If you need more details on any of these answers, or want me to:
- Write the actual backend code
- Set up the database schema
- Implement any specific feature

**Just ask! 🚀**
