# 🚀 Deploy Backend ל-Render - הוראות מדויקות

## צעד 1: התחבר ל-Render

**אתה כרגע בדף ההתחברות:** https://dashboard.render.com/login

**לחץ על "GitHub"** (הכפתור הראשון) כדי להתחבר עם GitHub

---

## צעד 2: אחרי שנכנסת, צור Web Service

1. לחץ על **"New +"** (בפינה הימנית העליונה)
2. בחר **"Web Service"**

---

## צעד 3: חבר את הריפו

1. חפש את הריפו: **`-clearpick-ai`**
2. לחץ **"Connect"** ליד הריפו

---

## צעד 4: הגדרות ה-Service

מלא את השדות הבאים:

**Name:**
```
clearpick-api
```

**Root Directory:**
```
backend
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Instance Type:**
- בחר: **Free**

---

## צעד 5: Environment Variables

לחץ על **"Add Environment Variable"** והוסף:

### חובה:
```
NODE_ENV=production
FRONTEND_URL=https://www.clearpickai.com
```

### אם יש לך מפתחות AI (אופציונלי - אם אין, המערכת תעבוד בלי AI):
```
GEMINI_API_KEY=<המפתח שלך>
ANTHROPIC_API_KEY=<המפתח שלך>
```

### אם יש לך PostgreSQL (אופציונלי):
```
DATABASE_URL=<כתובת ה-DB שלך>
```

---

## צעד 6: Deploy!

לחץ על **"Create Web Service"** בתחתית

**Render יתחיל לבנות ולדפלוי את ה-Backend (ייקח ~3-5 דקות)**

---

## צעד 7: קבל את ה-URL

אחרי שה-deploy מסתיים, תקבל URL כמו:
```
https://clearpick-api.onrender.com
```

**העתק את ה-URL הזה!**

---

## צעד 8: הוסף את ה-URL ל-Vercel

1. פתח: https://vercel.com/mosess-projects-a989c1f2/clearpick-ai/settings/environment-variables
2. לחץ **"Add New"**
3. מלא:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://clearpick-api.onrender.com/api`
   - **Environments:** סמן הכל (Production, Preview, Development)
4. לחץ **"Save"**

---

## צעד 9: Redeploy את ה-Frontend

1. חזור לדף הפרויקט: https://vercel.com/mosess-projects-a989c1f2/clearpick-ai
2. לחץ **"Deployments"**
3. לחץ על ה-deployment הראשון → שלוש נקודות → **"Redeploy"**
4. אשר

---

## ✅ זהו! תחכה 2-3 דקות ואז:

פתח: https://www.clearpickai.com/search

הקלד מוצר (למשל: "iPhone 15 Pro")

לחץ **"Analyze"**

**החיפוש אמור לעבוד!** 🎉

---

**תגיד לי אם אתה תקוע במשהו ואני אעזור!**
