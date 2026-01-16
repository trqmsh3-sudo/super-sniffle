# 🔑 הוראות הגדרת Environment Variables ב‑Render

## ❗ הבעיה שמצאתי:

**ה‑ENV vars לא מגיעים לשרת!**

הלוגים מראים:
- ❌ `GEMINI_API_KEY missing`
- ❌ `ECONNREFUSED ::1:5432` (DATABASE_URL missing)
- ❌ Universal Image Service: `no API key` לכל השירותים

**הסיבה:** ה‑ENV vars מוגדרים ב‑**Environment Group נפרד**, לא ישירות על ה‑Web Service.

---

## ✅ הפתרון (3 דקות):

### שלב 1: הוסף ENV vars ישירות לשירות

1. **היכנס לשירות**: `dashboard.render.com/web/srv-d5jimbt6ubrc738vo5g0/env`
2. **לחץ על "Add" (הכפתור הכחול)**
3. **הוסף את המשתנים האלה אחד אחד**:

#### חובה (קריטי):
```
Key: DATABASE_URL
Value: [בחר "From database" → clearpickdb → Internal Database URL]
```

```
Key: GEMINI_API_KEY
Value: AIzaSyCu3btljFi6Y1YCVMZXnI6HwHvIkOi8u7I
```

```
Key: REDIS_URL  
Value: [הכתובת של Redis Cloud שלך - אם יש]
אם אין Redis Cloud: תדלג בינתיים (המערכת תעבוד בלי cache)
```

#### רצוי (לתמונות):
```
Key: UNSPLASH_ACCESS_KEY
Value: [מפתח Unsplash שלך - אם יש]
```

```
Key: PEXELS_API_KEY
Value: [מפתח Pexels שלך - אם יש]
```

```
Key: BING_SEARCH_API_KEY
Value: [מפתח Bing שלך - אם יש]
```

#### אוטומטי (כבר מוגדרים ב‑render.yaml):
- `NODE_ENV=production`
- `PORT=5000`  
- `FRONTEND_URL=https://www.clearpickai.com`

### שלב 2: שמור
לחץ **"Save Changes"** למטה.

### שלב 3: Redeploy
1. חזור למסך הראשי של השירות
2. לחץ **"Manual Deploy"**
3. המתן 2-3 דקות

### שלב 4: בדוק Logs
אחרי ש‑Deploy הושלם, לך ל‑**Logs** וחפש:
- ✅ `🔌 Connected to PostgreSQL database`
- ✅ `✅ Redis connected` (אם הגדרת REDIS_URL)
- ✅ `🚀 ClearPick.ai Unified API Server`
- ✅ **לא** אמור להופיע: `GEMINI_API_KEY missing` או `ECONNREFUSED`

---

## 🎯 תוצאה צפויה:

לאחר ההגדרה, הלוגים אמורים להראות:

```
08:XX:XX AM [ xxxxx ] 🔌 Connected to PostgreSQL database
08:XX:XX AM [ xxxxx ] ✅ Redis ready!
08:XX:XX AM [ xxxxx ] 🖼️ Universal Image Service initialized:
08:XX:XX AM [ xxxxx ]    Unsplash: ✅ (50K/month)
08:XX:XX AM [ xxxxx ]    Pexels: ✅ (200/hour)
08:XX:XX AM [ xxxxx ]    Bing: ✅ (1K/month)
08:XX:XX AM [ xxxxx ] 
08:XX:XX AM [ xxxxx ] ╔═══════════════════════════════════════════════════════════╗
08:XX:XX AM [ xxxxx ] ║   🚀 ClearPick.ai Unified API Server                     ║
08:XX:XX AM [ xxxxx ] ║   💾 Database: PostgreSQL ✅                              ║
08:XX:XX AM [ xxxxx ] ║   🤖 AI: Gemini + Claude ✅                               ║
08:XX:XX AM [ xxxxx ] ║   📊 Status: Ready ✅                                     ║
08:XX:XX AM [ xxxxx ] ╚═══════════════════════════════════════════════════════════╝
```

---

## 📞 אם עדיין לא עובד:

**בדוק ש‑DATABASE_URL מחובר נכון:**
1. Environment → DATABASE_URL → לחץ עליו
2. ודא שבחרת **"clearpickdb"**
3. ודא שבחרת **"Internal Database URL"** (לא External)

**אם אין לך Redis Cloud:**
- המערכת תעבוד בלי cache (רק יהיה יותר איטי)
- בלוגים יופיע: `⚠️ Running without cache - performance will be slower`
- זה OK ל‑testing, אבל ל‑production כדאי להוסיף

---

🚀 **בהצלחה!**
