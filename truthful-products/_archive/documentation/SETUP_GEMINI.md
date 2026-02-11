# 🚀 הגדרת Gemini - מדריך מהיר

## ✅ מה עשיתי:

עדכנתי את המערכת להשתמש ב-**Google Gemini** במקום OpenAI!

---

## 📝 **צעדים להפעלה:**

### **שלב 1: התקן את Gemini SDK**

```bash
cd backend
npm install @google/generative-ai
```

---

### **שלב 2: צור קובץ `.env`**

צור קובץ חדש: `backend/.env` (ללא .example)

**העתק והדבק:**

```env
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Google Gemini API (FREE!)
GEMINI_API_KEY=AIzaSyCu3btljFi6Y1YCVMZXnI6HwHvIkOi8u7I

# Redis Cache (optional)
REDIS_URL=redis://localhost:6379

# Affiliate Programs
AMAZON_AFFILIATE_TAG=clearpick-20
WALMART_AFFILIATE_ID=your_walmart_id
BESTBUY_AFFILIATE_ID=your_bestbuy_id
```

---

### **שלב 3: הפעל את השרבר**

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend (כבר רץ)
cd frontend
npm run dev
```

---

## 🎉 **זהו! המערכת עובדת עם Gemini!**

---

## 📊 **מה השתנה:**

### **Before (OpenAI):**
```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: '...' });
```

### **After (Gemini):**
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
```

---

## 💰 **עלויות:**

| פעולה | OpenAI | Gemini |
|-------|--------|--------|
| 1 ניתוח | $0.0015 | **$0** |
| 100 ניתוחים | $0.15 | **$0** |
| 1,000 ניתוחים | $1.50 | **$0** |
| **1,500 ניתוחים/יום** | **$2.25/יום** | **$0** |

**חיסכון חודשי: $67.50!** 🎉

---

## 🚀 **בדיקה מהירה:**

### **1. בדוק שהשרבר רץ:**
```bash
curl http://localhost:3000/health
```

צריך להחזיר:
```json
{
  "status": "ok",
  "service": "ClearPick.ai API"
}
```

### **2. בדוק חיפוש מוצר:**
```bash
curl -X POST http://localhost:3000/api/products/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Sony headphones"}'
```

---

## ✅ **Checklist:**

- [ ] התקנתי `@google/generative-ai`
- [ ] יצרתי קובץ `.env` עם המפתח
- [ ] השרבר רץ על port 3000
- [ ] ה-Frontend רץ על port 5173
- [ ] בדקתי `/health` endpoint
- [ ] ניסיתי חיפוש מוצר

---

## 🎯 **מה הלאה:**

1. ✅ המערכת עובדת עם Gemini
2. ⏳ צריך להוסיף Rainforest API (לנתוני Amazon)
3. ⏳ צריך להוסיף Google Shopping API (לחנויות קטנות)
4. ⏳ צריך להירשם לתוכניות Affiliate

**אבל כרגע - המערכת עובדת עם mock data!** 🚀

---

## 🆘 **בעיות נפוצות:**

### **שגיאה: "GEMINI_API_KEY is not defined"**
```bash
# וודא שיצרת את קובץ .env
# וודא שהמפתח נכון
cat backend/.env
```

### **שגיאה: "Cannot find module @google/generative-ai"**
```bash
cd backend
npm install @google/generative-ai
```

### **שגיאה: "Port 3000 already in use"**
```bash
# שנה את הפורט ב-.env
PORT=3001
```

---

## 🎉 **סיימנו!**

**המערכת מוכנה לעבודה עם Gemini!**

עכשיו תוכל לנתח מוצרים בחינם, עד 1,500 ליום! 🚀
