# 🔑 API Keys Setup Guide

להלן הדרכה מפורטת לקבלת API keys **חינמיים** עבור שירותי התמונות ו-Caching.

---

## 1. 🖼️ Unsplash API (50,000 requests/month - FREE!)

### Steps:
1. **צור חשבון:**
   - לך ל: https://unsplash.com/join
   - הירשם עם Email או Google

2. **צור Application:**
   - לך ל: https://unsplash.com/oauth/applications
   - לחץ על "New Application"
   - קרא ואשר את ה-Terms
   - מלא פרטים:
     - **Application name:** ClearPick.ai
     - **Description:** Product image search for ClearPick.ai
   - לחץ "Create application"

3. **העתק את ה-Access Key:**
   - בדף האפליקציה, תמצא:
     - **Access Key** ← זה מה שאתה צריך!
   - העתק והוסף ל-`.env`:
     ```
     UNSPLASH_ACCESS_KEY=your-access-key-here
     ```

### Rate Limits:
- **Demo:** 50 requests/hour
- **Production (free):** 50,000 requests/month
- (צריך לעשות upgrade ל-Production בהגדרות האפליקציה)

---

## 2. 🖼️ Pexels API (200 requests/hour - FREE!)

### Steps:
1. **צור חשבון:**
   - לך ל: https://www.pexels.com/
   - לחץ "Join" → הירשם

2. **בקש API Key:**
   - לך ל: https://www.pexels.com/api/
   - גלול למטה ולחץ "Create Account" או "Get Started"
   - מלא את הטופס:
     - **Description:** Product image search for ClearPick.ai
     - **URL:** https://www.clearpickai.com
   - אשר את ה-Terms

3. **העתק את ה-API Key:**
   - ה-API key יישלח למייל שלך
   - או תראה אותו בדף:
   - העתק והוסף ל-`.env`:
     ```
     PEXELS_API_KEY=your-api-key-here
     ```

### Rate Limits:
- **Free:** 200 requests/hour
- אין הגבלה חודשית!

---

## 3. 🔍 Bing Image Search API (1,000 transactions/month - FREE!)

### Steps:
1. **צור Azure Account:**
   - לך ל: https://azure.microsoft.com/free/
   - לחץ "Start free"
   - הירשם (צריך כרטיס אשראי לאימות, אבל לא יחייבו!)

2. **צור Bing Search Resource:**
   - לך ל: https://portal.azure.com
   - לחץ "Create a resource"
   - חפש "Bing Search v7"
   - לחץ "Create"
   - מלא פרטים:
     - **Name:** clearpick-bing-search
     - **Pricing tier:** F1 (Free - 1,000 transactions/month)
     - **Resource group:** יצור חדש: "clearpick-rg"
   - לחץ "Create"

3. **העתק את ה-API Key:**
   - אחרי שנוצר, לך ל-Resource
   - בתפריט צד, לחץ "Keys and Endpoint"
   - העתק **Key 1**
   - הוסף ל-`.env`:
     ```
     BING_SEARCH_API_KEY=your-key-here
     ```

### Rate Limits:
- **Free (F1):** 1,000 transactions/month
- **Paid:** משתלם רק אם עוברים את ה-1,000

---

## 4. 🗄️ Redis Cloud (30MB - FREE!)

### Steps:
1. **צור חשבון:**
   - לך ל: https://redis.com/try-free/
   - לחץ "Get Started Free"
   - הירשם עם Google או Email

2. **צור Database:**
   - אחרי הרשמה, לחץ "Create database"
   - בחר:
     - **Subscription:** Free
     - **Cloud:** AWS / GCP / Azure (לפי בחירה)
     - **Region:** בחר קרוב ביותר (Europe-West לישראל)
     - **Name:** clearpick-cache
   - לחץ "Create database"

3. **העתק את ה-Connection String:**
   - אחרי שנוצר, לחץ על ה-Database
   - גלול ל-"Configuration"
   - העתק את ה-**Public endpoint**
   - פורמט: `redis://username:password@host:port`
   - הוסף ל-`.env`:
     ```
     REDIS_URL=redis://default:your-password@your-host:port
     ```

### Limits:
- **Free:** 30MB storage, 30 concurrent connections
- מספיק ל-~10,000 dossiers בcache!

---

## 5. 🎯 Alternative: Local Redis (אם אתה רוצה לרוץ לוקאלי)

### Windows:
```powershell
# Install via WSL2 (recommended)
wsl --install
wsl
sudo apt update
sudo apt install redis-server
redis-server
```

### Mac:
```bash
brew install redis
brew services start redis
```

### Docker (כל מערכת):
```bash
docker run --name redis -p 6379:6379 -d redis
```

### בקובץ `.env`:
```
REDIS_URL=redis://localhost:6379
```

---

## 📝 Example `.env` File

```env
# Gemini AI
GEMINI_API_KEY=your-gemini-key

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Image Services (כולם אופציונליים!)
UNSPLASH_ACCESS_KEY=your-unsplash-key
PEXELS_API_KEY=your-pexels-key
BING_SEARCH_API_KEY=your-bing-key

# Caching (אופציונלי אבל מומלץ!)
REDIS_URL=redis://default:password@host:port
```

---

## ✅ Verification

אחרי שהגדרת את כל ה-API keys, הרץ:

```bash
node backend/tests/test-universal-images.js "iPhone 15"
```

זה יבדוק את כל השירותים ויראה איזה API keys עובדים! ✅

---

## 💰 Cost Summary

| Service | Free Tier | Cost After Limit |
|---------|-----------|------------------|
| Unsplash | 50,000/month | N/A (לא זמין) |
| Pexels | 200/hour | $0 (unlimited) |
| Bing | 1,000/month | $0.003/transaction |
| Redis Cloud | 30MB | $7/month (250MB) |

**Total Monthly Cost: $0** (אם נשארים בגבולות החינמיים)

---

## 🚀 Production Recommendations

1. **Unsplash:** שדרג ל-Production mode (עדיין חינם!)
2. **Redis:** התחל עם Free tier, שדרג רק אם צריך
3. **Bing:** מעקב אחר usage - אם עוברים 1,000/month, שקול Pexels ראשון
4. **Monitoring:** הוסף alerts על API usage ב-Admin Dashboard

---

**זהו! עכשיו יש לך גישה ל-4 מקורות תמונות + caching מהיר!** 🎉
