# ✅ השרת חי! מה עכשיו? (5 דקות)

## **שלב 1: העתק את ה-URL של ה-Backend**

ב-Render Dashboard, העתק את ה-URL של השרת (משהו כמו):
```
https://clearpick-api.onrender.com
```
או
```
https://clearpick-backend-xxxx.onrender.com
```

**העתק את ה-URL הזה!** 📋

---

## **שלב 2: בדוק שהשרת עובד**

פתח בדפדפן:
```
[ה-URL שלך]/api/health
```

לדוגמה:
```
https://clearpick-api.onrender.com/api/health
```

אמור לראות JSON עם `"success": true` או `"status": "ok"`

---

## **שלב 3: הוסף את ה-URL ל-Vercel**

### 3.1 פתח את הקישור הזה:
```
https://vercel.com/mosess-projects-a989c1f2/clearpick-ai/settings/environment-variables
```

### 3.2 לחץ על **"Add New"**

### 3.3 מלא:
- **Key:** `VITE_API_URL`
- **Value:** `[ה-URL שלך]/api` (לדוגמה: `https://clearpick-api.onrender.com/api`)
- **Environments:** סמן את **כולם** (Production, Preview, Development)

### 3.4 לחץ **"Save"**

---

## **שלב 4: Redeploy את ה-Frontend**

### 4.1 חזור לדף הפרויקט:
```
https://vercel.com/mosess-projects-a989c1f2/clearpick-ai
```

### 4.2 לחץ **"Deployments"**

### 4.3 לחץ על ה-deployment הראשון ברשימה → שלוש נקודות (⋮) → **"Redeploy"**

### 4.4 בחר **"Production"** ולחץ **"Redeploy"**

---

## **שלב 5: המתן (2-3 דקות)**

Vercel יבנה את האתר מחדש עם חיבור ל-Backend.

---

## **שלב 6: בדוק שהכל עובד!**

### 6.1 פתח:
```
https://www.clearpickai.com/search
```

### 6.2 הקלד מוצר (לדוגמה: "iPhone 15 Pro")

### 6.3 לחץ **"Analyze"**

### 6.4 המתן...

**אם הכל עובד - תראה תוצאות חיפוש! 🎉**

---

## 🎯 **זהו! המערכת מחוברת ועובדת!**

תגיד לי:
1. מה ה-URL של ה-Backend שלך?
2. אם הצלחת להוסיף אותו ל-Vercel?

ואני אעזור לך להמשיך!
