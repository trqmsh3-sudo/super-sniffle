# 🚀 Deployment Checklist - V2.1

## 📋 Pre-Deployment Steps

### 1. Environment Variables (Render)

כנס ל-Render Dashboard → Backend Service → Environment:

#### Required (Must Have):
```env
# Database
DATABASE_URL=postgresql://... (already configured)

# AI
GEMINI_API_KEY=your-key (already configured)

# Redis Cache
REDIS_URL=redis://default:password@host:port
```

#### Optional (Recommended):
```env
# Universal Image Service
UNSPLASH_ACCESS_KEY=your-key
PEXELS_API_KEY=your-key
BING_SEARCH_API_KEY=your-key
```

#### How to Get:
- **Redis:** See `API_KEYS_SETUP.md` → Redis Cloud (30MB free)
- **Unsplash:** See `API_KEYS_SETUP.md` → Unsplash (50k/month free)
- **Pexels:** See `API_KEYS_SETUP.md` → Pexels (200/hour free)
- **Bing:** See `API_KEYS_SETUP.md` → Azure Bing (1k/month free)

---

### 2. Package.json Verification

✅ Check `backend/package.json`:
```json
{
  "dependencies": {
    "redis": "^5.10.0",  ← Required for caching
    "axios": "^1.6.5",   ← Required for API calls
    "@google/generative-ai": "^0.24.1"  ← Already there
  }
}
```

---

### 3. Database Migration (if needed)

If `products.images` column doesn't exist:
```sql
ALTER TABLE products
ADD COLUMN images JSONB DEFAULT '[]'::JSONB;
```

Already exists? ✅ Skip this step.

---

### 4. Git Push

```bash
cd truthful-products
git status
git add .
git commit -m "feat: V2.1 - Reddit scraping + Smart caching + Universal images"
git push origin main
```

---

## 🔍 Post-Deployment Verification

### 1. Health Check
```bash
curl https://clearpick-ai.onrender.com/api/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "...",
  "version": "2.1.0"
}
```

---

### 2. Test Build Endpoint
```bash
curl -X POST https://clearpick-ai.onrender.com/api/products/build \
  -H "Content-Type: application/json" \
  -d '{"productName": "Sony WH-1000XM5", "category": "headphones"}'
```

Expected:
```json
{
  "success": true,
  "productId": 123,
  "scores": { "overall": 85, ... },
  "confidence": 72,
  "dataSource": { "reddit": 15 },
  "fromCache": false
}
```

---

### 3. Test Cache (second request)
```bash
# Same request again (should be instant!)
curl -X POST https://clearpick-ai.onrender.com/api/products/build \
  -H "Content-Type: application/json" \
  -d '{"productName": "Sony WH-1000XM5", "category": "headphones"}'
```

Expected:
```json
{
  "success": true,
  "fromCache": true,  ← Should be true!
  "cachedAt": "...",
  "ttl": 3400
}
```

---

### 4. Check Images
```bash
curl https://clearpick-ai.onrender.com/api/products/123
```

Check response for:
```json
{
  "product": {
    "image_url": "https://...",  ← Should exist
    "images": [                   ← Should have multiple
      { "url": "...", "source": "unsplash" },
      { "url": "...", "source": "pexels" },
      ...
    ]
  }
}
```

---

## 📊 Monitoring

### Check Logs (Render Dashboard):
```
✅ Look for: "Reddit Scraper: Found X posts"
✅ Look for: "Cache HIT" or "Cache MISS"
✅ Look for: "Universal Image Service: Found X images"
❌ Look for errors: "Redis connection failed" (if so, check REDIS_URL)
```

---

## 🐛 Troubleshooting

### Issue 1: Redis not connecting
**Symptom:** Logs show "❌ Redis connection failed"  
**Fix:** 
1. Check REDIS_URL format: `redis://default:password@host:port`
2. Verify Redis Cloud database is running
3. Check IP whitelist (should allow 0.0.0.0/0)

---

### Issue 2: No images found
**Symptom:** `images: []` in response  
**Fix:**
1. Add at least one image API key (Unsplash recommended)
2. Check logs for "⚠️ Unsplash search failed"
3. Verify API key is correct

---

### Issue 3: Slow responses (not using cache)
**Symptom:** Every request takes 15+ seconds  
**Fix:**
1. Check Redis is connected (see Issue 1)
2. Verify cache keys exist: Check admin endpoint
3. Look for "Cache HIT" in logs

---

### Issue 4: Build timeout
**Symptom:** 504 Gateway Timeout  
**Fix:**
1. Reddit scraping can be slow (10-15s normal)
2. First request always slower (no cache)
3. Consider reducing subreddits in redditScraper.js

---

## ✅ Success Criteria

- [ ] Health endpoint responds with 200 OK
- [ ] First build completes (15-20s is normal)
- [ ] Second build uses cache (< 1s)
- [ ] Images appear in product dossiers
- [ ] Redis cache is working (check logs)
- [ ] No errors in Render logs

---

## 📈 Expected Metrics (after 24h)

| Metric | Target | How to Check |
|--------|--------|--------------|
| Cache Hit Rate | >70% | Admin dashboard |
| Avg Response Time | <2s | Render metrics |
| Reddit Posts/Search | 10-30 | Logs |
| Images/Product | 3-5 | API responses |
| Uptime | >99% | Render dashboard |

---

## 🚀 Next Steps After Deployment

1. **Frontend Update:** Update frontend to display multiple images
2. **Admin Dashboard:** Add cache stats, image sources
3. **Monitoring:** Set up alerts for errors
4. **Testing:** Build 10-20 products to test
5. **Optimization:** Monitor performance, adjust cache TTL

---

**Ready to deploy!** 🎉
