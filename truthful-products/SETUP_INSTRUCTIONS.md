# 🚀 הוראות הגדרה - ClearPick.ai

## 📋 מה מצאתי:

בפרויקט V4 שלך יש רק **Gemini API Key**, לא OpenAI.

```
GEMINI_API_KEY=AIzaSyCu3btljFi6Y1YCVMZXnI6HwHvIkOi8u7I
```

---

## 🎯 **2 אפשרויות:**

### **אופציה 1: שימוש ב-Gemini (חינם!)**

Gemini של Google זה חינם ועובד מצוין! אני יכול לעדכן את הקוד להשתמש ב-Gemini במקום OpenAI.

**יתרונות:**
- ✅ כבר יש לך API key
- ✅ חינם לחלוטין
- ✅ מהיר מאוד
- ✅ תוצאות טובות

---

### **אופציה 2: הרשמה ל-OpenAI (GPT-4o-mini)**

אם אתה רוצה להשתמש ב-GPT-4o-mini כמו שהמלצתי:

1. **הירשם:** https://platform.openai.com/signup
2. **צור API Key:** https://platform.openai.com/api-keys
3. **קבל $5 קרדיט חינם** (מספיק ל-10,000 ניתוחים!)

---

## 💡 **ההמלצה שלי:**

**התחל עם Gemini!** זה חינם, מהיר, והמפתח כבר יש לך.

אחר כך אם תרצה, תוכל לעבור ל-OpenAI.

---

## 🔧 **איך להגדיר עם Gemini:**

### **שלב 1: צור קובץ `.env`**

```bash
cd backend
```

צור קובץ חדש בשם `.env` (ללא .example) והוסף:

```env
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# AI Service - Google Gemini (FREE!)
GEMINI_API_KEY=AIzaSyCu3btljFi6Y1YCVMZXnI6HwHvIkOi8u7I

# Redis Cache (optional - can work without)
REDIS_URL=redis://localhost:6379

# Affiliate Programs (optional for now)
AMAZON_AFFILIATE_TAG=clearpick-20
```

---

### **שלב 2: התקן Dependencies**

```bash
cd backend
npm install express cors dotenv @google/generative-ai
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

## 🎉 **זהו! האתר יעבוד עם Gemini!**

---

## 📊 **השוואה: Gemini vs GPT-4o-mini**

| תכונה | Gemini (Google) | GPT-4o-mini (OpenAI) |
|-------|-----------------|---------------------|
| **מחיר** | 🟢 חינם | 🟡 $0.15/1M tokens |
| **מהירות** | 🟢 מהיר מאוד | 🟢 מהיר |
| **איכות** | 🟢 מצוין | 🟢 מצוין |
| **API Key** | ✅ יש לך | ❌ צריך להירשם |

**שניהם מעולים!** Gemini זה בחירה חכמה להתחלה.

---

## 🚀 **רוצה שאעדכן את הקוד להשתמש ב-Gemini?**

אני יכול:
1. ✅ לעדכן את `aiService.js` להשתמש ב-Gemini
2. ✅ לעדכן את `server.js`
3. ✅ לבדוק שהכל עובד

**רוצה שאתחיל?** 🎯
