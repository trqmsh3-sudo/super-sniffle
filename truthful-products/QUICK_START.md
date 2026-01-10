# ⚡ Quick Start Guide - ClearPick.ai

## 🎯 מה בנינו?

מערכת **תיקי מוצרים** מלאה עם:
- ✅ Gemini AI לאיסוף וניתוח נתונים
- ✅ PostgreSQL Database לשמירה
- ✅ REST API מלא
- ✅ Frontend מוכן (צריך חיבור קטן)

---

## 🚀 התחלה מהירה (30 דקות)

### שלב 1: PostgreSQL (10 דקות)

```bash
# 1. הורד והתקן:
https://www.postgresql.org/download/windows/

# 2. פתח pgAdmin או psql:
psql -U postgres

# 3. צור database:
CREATE DATABASE clearpick;
\c clearpick

# 4. הרץ סכימה:
\i backend/config/schema.sql

# 5. בדוק:
\dt
# אמור לראות: products, dossiers, reviews, jobs
```

---

### שלב 2: Gemini API Key (5 דקות)

```
1. לך ל: https://makersuite.google.com/app/apikey
2. צור API Key
3. העתק את המפתח
```

---

### שלב 3: Environment Variables (2 דקות)

צור קובץ `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clearpick
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
```

---

### שלב 4: התקן Dependencies (3 דקות)

```bash
cd backend
npm install
```

---

### שלב 5: בדיקות (5 דקות)

```bash
# בדוק database:
npm run test-db
# ✅ Expected: "Database connected!"

# בדוק Gemini:
npm run test-collector
# ✅ Expected: JSON עם נתונים על iPhone 15 Pro

# בדוק בניית תיק:
npm run test-dossier
# ✅ Expected: תיק מלא עם ציונים
```

---

### שלב 6: הפעל Server (1 דקה)

```bash
npm start
```

אמור לראות:
```
╔════════════════════════════════════════════════════╗
║   🚀 ClearPick.ai API Server Running              ║
║   📡 URL: http://localhost:3000                    ║
║   💾 Database: PostgreSQL                          ║
║   🤖 AI: Gemini Pro                                ║
╚════════════════════════════════════════════════════╝
```

---

### שלב 7: נסה את ה-API (5 דקות)

```bash
# Health check:
curl http://localhost:3000/api/health

# בנה תיק לסוני:
curl -X POST http://localhost:3000/api/products/build \
  -H "Content-Type: application/json" \
  -d "{\"productName\":\"Sony WH-1000XM5\",\"category\":\"headphones\"}"

# המתן 30-60 שניות...

# חפש:
curl http://localhost:3000/api/search?q=Sony

# קבל את התיק:
curl http://localhost:3000/api/products/1
```

---

## 🎨 חיבור Frontend (בקרוב)

בקרוב נחבר את Frontend ל-Backend!

התיקייה `frontend/` מוכנה, רק צריך לעדכן את ה-API calls.

---

## 📊 מה עובד עכשיו:

| רכיב | סטטוס |
|------|-------|
| **Backend API** | ✅ רץ |
| **PostgreSQL** | ✅ מחובר |
| **Gemini AI** | ✅ עובד |
| **Data Collection** | ✅ פעיל |
| **Dossier Building** | ✅ עובד |
| **Frontend** | ⏳ צריך חיבור |

---

## 🐛 בעיות נפוצות:

### "Database connection error"
```bash
# בדוק שPostgreSQL רץ:
# Windows: Services → PostgreSQL → Start
```

### "Invalid API key"
```bash
# בדוק ש-GEMINI_API_KEY ב-.env מתחיל ב-AIzaSy...
```

### "No such file or directory"
```bash
# ודא שאתה בתיקיית backend/
cd backend
```

---

## 🎯 מה הלאה?

1. ✅ **בנה עוד תיקים:**
   ```bash
   curl -X POST http://localhost:3000/api/products/build \
     -H "Content-Type: application/json" \
     -d "{\"productName\":\"iPhone 15 Pro\"}"
   ```

2. ✅ **נסה מוצרים שונים:**
   - Samsung Galaxy S24
   - MacBook Pro M3
   - Dyson V15
   - וכו'...

3. ⏳ **חבר Frontend** (הצעד הבא!)

---

## 💰 עלויות:

```
✅ PostgreSQL: $0 (local)
✅ Gemini API: $0 (חינם עד 60 requests/דקה)
✅ Backend: $0 (local)
---
סה"כ: $0 💚
```

---

## 📞 עזרה:

אם משהו לא עובד - העתק את השגיאה ושלח לי!

---

**🎉 זהו! המערכת רצה!**
