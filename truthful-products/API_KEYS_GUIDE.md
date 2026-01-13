# 🔑 המפתחות שאתה צריך למלא ב-Render

## **1. GEMINI_API_KEY** (חובה - חינמי!) ✅

**מה זה:**
- מפתח של Google Gemini AI
- **חינמי!** (60 requests/דקה)
- משמש לניתוח מוצרים בסיסי

**איך להשיג:**
1. פתח: https://aistudio.google.com/apikey
2. לחץ **"Create API Key"**
3. בחר **"Create API key in new project"** או בפרויקט קיים
4. העתק את המפתח שנוצר (יתחיל ב-`AIza...`)

**דוגמה:**
```
AIzaSyCu3btljFi6Y1YCVMZXnI6HwHvIkOi8u7I
```

---

## **2. ANTHROPIC_API_KEY** (אופציונלי - בתשלום) ⚠️

**מה זה:**
- מפתח של Anthropic Claude AI
- **בתשלום** (אבל זול מאוד)
- משמש למשימות מורכבות, חיפוש אינטרנט, וניתוחים מתקדמים

**איך להשיג:**
1. פתח: https://console.anthropic.com/
2. הירשם/התחבר
3. לך ל-**"API Keys"** בתפריט
4. לחץ **"Create Key"**
5. תן שם למפתח (למשל: "ClearPick Production")
6. העתק את המפתח (יתחיל ב-`sk-ant-...`)

**דוגמה:**
```
sk-ant-api03-xxxxx-xxxxx-xxxxx
```

**💡 הערה:** אם אין לך את המפתח הזה, המערכת תעבוד גם בלי - פשוט עם פחות יכולות.

---

## 📝 **מה למלא ב-Render:**

### **חובה (Minimum):**
```
GEMINI_API_KEY=AIzaSy... (המפתח שלך מ-Google)
NODE_ENV=production
FRONTEND_URL=https://www.clearpickai.com
```

### **מומלץ (Full Features):**
```
GEMINI_API_KEY=AIzaSy... (המפתח שלך מ-Google)
ANTHROPIC_API_KEY=sk-ant-... (המפתח שלך מ-Anthropic)
NODE_ENV=production
FRONTEND_URL=https://www.clearpickai.com
```

---

## 🎯 **לסיכום:**

**אם אתה רוצה שהמערכת תעבוד בסיסי:**
- רק **GEMINI_API_KEY** ✅ (חינמי)

**אם אתה רוצה יכולות מלאות:**
- **GEMINI_API_KEY** ✅ (חינמי)
- **ANTHROPIC_API_KEY** ✅ (בתשלום, אבל זול)

---

## 💰 **עלויות:**

**Gemini:** $0 (חינמי)
**Claude:** ~$0.01-0.05 לכל ניתוח מתקדם

**אם אתה רק מתחיל, תלך רק עם Gemini - זה מספיק!**

---

**תגיד לי אם אתה צריך עזרה עם יצירת המפתחות!**
