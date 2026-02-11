# 🚀 מדריך העלאת הבקאנד ל-Render

## שלב 1: הכנה (2 דקות)

### 1.1 וודא שכל הקבצים מוכנים
- ✅ `package.json` - מעודכן
- ✅ `render.yaml` - נוצר
- ✅ `.env.production` - נוצר עם כל ה-API Keys

### 1.2 בדוק שה-server.js קיים
```bash
ls server.js
```

---

## שלב 2: רישום ל-Render (3 דקות)

### 2.1 היכנס לאתר
1. גש ל: https://render.com
2. לחץ על **"Get Started"**
3. הירשם עם GitHub (מומלץ) או Email

### 2.2 אשר את החשבון
- בדוק את המייל שקיבלת
- לחץ על קישור האימות

---

## שלב 3: העלאת הפרויקט (5 דקות)

### אפשרות 1: דרך GitHub (מומלץ)

#### 3.1 העלה את הקוד ל-GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 3.2 חבר את Render ל-GitHub
1. ב-Render Dashboard, לחץ **"New +"**
2. בחר **"Web Service"**
3. לחץ **"Connect GitHub"**
4. בחר את הריפו שיצרת
5. הגדר:
   - **Name**: `clearpick-backend`
   - **Branch**: `main`
   - **Root Directory**: `backend` (אם הריפו כולל גם frontend)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### אפשרות 2: העלאה ידנית (פשוט יותר)

#### 3.2.1 צור Web Service חדש
1. ב-Render Dashboard, לחץ **"New +"**
2. בחר **"Web Service"**
3. בחר **"Deploy from Git"** או **"Public Git repository"**

#### 3.2.2 הגדרות בסיסיות
- **Name**: `clearpick-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

---

## שלב 4: הגדרת משתני סביבה (3 דקות)

### 4.1 הוסף את ה-API Keys
ב-Render Dashboard, לך ל-**Environment**:

```
NODE_ENV=production
PORT=5000
GEMINI_API_KEY=AIzaSyCu3btljFi6Y1YCVMZXnI6HwHvIkOi8u7I
GOOGLE_SHOPPING_API_KEY=AIzaSyCJ4DCwn9kx7tqeeq1Y_n8l_pXa6vwmH7Q
GOOGLE_SHOPPING_CX=8698f382d3f484175
FRONTEND_URL=https://clearpick.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_PRODUCT_TTL=21600
LOG_LEVEL=info
```

### 4.2 שמור והמתן לפריסה
- לחץ **"Save Changes"**
- Render יתחיל לבנות ולפרוס את השרת
- זה יקח 3-5 דקות

---

## שלב 5: בדיקת הפריסה (2 דקות)

### 5.1 המתן לסטטוס "Live"
- בדוק שהסטטוס הוא **"Live"** (ירוק)
- אם יש שגיאות, בדוק את ה-Logs

### 5.2 העתק את כתובת הבקאנד
- הכתובת תהיה משהו כמו:
  ```
  https://clearpick-backend.onrender.com
  ```
- **שמור את הכתובת הזו!** נצטרך אותה בשלב הבא

### 5.3 בדוק שהשרת עובד
פתח בדפדפן:
```
https://clearpick-backend.onrender.com/api/v1/health
```

אמור להופיע:
```json
{
  "status": "OK",
  "timestamp": "...",
  "features": {
    "ai": "Gemini (Google)",
    "shopping": "Google Shopping API",
    "cache": "Redis (30 days)"
  }
}
```

---

## שלב 6: חיבור הפרונטאנד לבקאנד (5 דקות)

### 6.1 עדכן את הפרונטאנד
צור קובץ `.env` בתיקיית `frontend`:

```bash
VITE_API_URL=https://clearpick-backend.onrender.com/api/v1
```

### 6.2 בנה את הפרונטאנד מחדש
```bash
cd frontend
npm run build
```

### 6.3 העלה ל-Netlify
גרור את תיקיית `dist` ל-Netlify Dashboard

---

## ✅ סיימת!

האתר שלך עכשיו:
- ✅ פרונטאנד חי ב-Netlify
- ✅ בקאנד חי ב-Render
- ✅ Google Shopping API מחובר
- ✅ Gemini AI מחובר
- ✅ מערכת אימות פעילה

---

## 🔧 פתרון בעיות נפוצות

### הבקאנד לא עולה
1. בדוק את ה-Logs ב-Render Dashboard
2. וודא שכל ה-API Keys נכונים
3. בדוק ש-`package.json` תקין

### הפרונטאנד לא מתחבר לבקאנד
1. בדוק ש-CORS מוגדר נכון ב-`server.js`
2. וודא שכתובת הבקאנד נכונה ב-`.env`
3. בדוק שהבקאנד עובד דרך הדפדפן

### Google Shopping לא עובד
1. בדוק שה-CX ID נכון
2. וודא שה-API Key פעיל
3. בדוק את ה-Logs לשגיאות

---

## 📞 צריך עזרה?

אם משהו לא עובד, שלח לי:
1. צילום מסך של ה-Logs ב-Render
2. את השגיאה שאתה רואה
3. את כתובת הבקאנד שקיבלת

בהצלחה! 🚀
