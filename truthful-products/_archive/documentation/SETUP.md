# 🚀 ClearPick Backend Setup Guide

## דרישות מקדימות

1. **Node.js 18+**
2. **PostgreSQL 14+**
3. **Gemini API Key** (חינם!)

---

## שלב 1: התקן PostgreSQL

### Windows:
```bash
# הורד מ:
https://www.postgresql.org/download/windows/

# במהלך ההתקנה:
Username: postgres
Password: <בחר סיסמה חזקה>
Port: 5432
```

### אחרי ההתקנה:
```bash
# פתח PostgreSQL shell (psql)
psql -U postgres

# צור database:
CREATE DATABASE clearpick;

# התחבר אליו:
\c clearpick

# הרץ את הסכימה:
\i config/schema.sql

# בדוק שהטבלאות נוצרו:
\dt
```

---

## שלב 2: קבל Gemini API Key (חינם!)

1. לך ל: https://makersuite.google.com/app/apikey
2. לחץ "Create API Key"
3. העתק את המפתח

---

## שלב 3: צור קובץ `.env`

צור קובץ בשם `.env` בתיקיית `backend/`:

```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clearpick
DB_USER=postgres
DB_PASSWORD=<הסיסמה שלך מ-PostgreSQL>

# AI - Smart Routing
GEMINI_API_KEY=<המפתח מ-Google>
CLAUDE_API_KEY=<אופציונלי - למשימות מורכבות>

# Google Shopping (אופציונלי)
GOOGLE_SHOPPING_API_KEY=AIzaSyCJ4DCwn9kx7tqeeq1Y_n8l_pXa6vwmH7Q
GOOGLE_SHOPPING_CX=900c2096c75e34c89

# Note: המערכת עובדת עם Gemini בלבד!
# Claude נדרש רק לweb search ומשימות מורכבות.
```

---

## שלב 4: התקן dependencies

```bash
cd backend
npm install
```

---

## שלב 5: בדוק חיבור ל-Database

```bash
npm run test-db
```

אמור לראות: `✅ Database connected!`

---

## שלב 6: בדוק Smart AI Router

```bash
npm run test-router
```

זה יבדוק:
- ✅ Gemini (משימות פשוטות - חינם!)
- ✅ Claude (משימות מורכבות - אופציונלי)
- ✅ סטטיסטיקות חיסכון

---

## שלב 7: בנה תיק מוצר ראשון

```bash
npm run test-dossier
```

זה ייצור תיק מלא למוצר בדוגמה!

**Note:** השתמש ב-Smart Routing - חוסך 70% בעלויות!

---

## שלב 8: הפעל את השרת

```bash
npm start
```

אמור לראות:
```
╔════════════════════════════════════════╗
║   🚀 ClearPick API Server Running     ║
║   URL: http://localhost:3000          ║
║   Database: Connected ✅               ║
║   Gemini AI: Ready ✅                  ║
╚════════════════════════════════════════╝
```

---

## 🧪 בדיקת API

### Health Check:
```bash
curl http://localhost:3000/api/health
```

### חיפוש מוצרים:
```bash
curl http://localhost:3000/api/search?q=iPhone
```

### בניית תיק חדש:
```bash
curl -X POST http://localhost:3000/api/products/build \
  -H "Content-Type: application/json" \
  -d '{"productName":"iPhone 15 Pro"}'
```

---

## 📝 Scripts זמינים

```bash
npm start              # הפעלת שרת ראשי
npm run mock           # הפעלת Mock Server
npm run test-db        # בדיקת חיבור לDB
npm run test-router    # בדיקת Smart AI Routing ⭐
npm run test-collector # בדיקת איסוף נתונים (legacy)
npm run test-dossier   # בניית תיק לדוגמה
```

---

## ❓ בעיות נפוצות

### שגיאת חיבור ל-Database:
```
❌ Connection refused
```
**פתרון:** בדוק שPostgreSQL רץ:
```bash
# Windows:
services.msc → PostgreSQL → Start
```

### שגיאת Gemini API:
```
❌ Invalid API key
```
**פתרון:** בדוק שהמפתח ב-`.env` נכון ומתחיל ב-`AIzaSy...`

---

## 🎉 מוכן!

עכשיו אפשר להפעיל גם את Frontend:
```bash
cd ../frontend
npm run dev
```

והמערכת תהיה חיה ב: http://localhost:5173
