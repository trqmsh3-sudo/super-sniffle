# 🔧 תיקון בעיית החיבור ל-Backend

## 🐛 הבעיה:
החיפוש לא עובד כי `VITE_API_URL` לא מוגדר ב-Vercel, אז הקוד מנסה להתחבר ל-`localhost:3000` (שאינו קיים ב-production).

---

## ✅ הפתרון - 2 דקות:

### **שלב 1: בדוק אם יש Backend deployed**

**פתח בדפדפן:**
```
https://clearpick-api.onrender.com/api/health
```

**אם זה עובד** - תקבל JSON response עם `"success": true`

**אם זה לא עובד** - צריך לדפלוי את ה-backend קודם (ראה DEPLOY_NOW.md)

---

### **שלב 2: הוסף Environment Variable ב-Vercel**

**1. פתח Vercel Dashboard:**
```
https://vercel.com/dashboard
```

**2. בחר את הפרויקט "clearpick-ai" (או השם שלך)**

**3. לחץ על "Settings" (בתפריט העליון)**

**4. לחץ על "Environment Variables" (בצד שמאל)**

**5. לחץ על "Add New"**

**6. מלא:**
```
Key: VITE_API_URL
Value: https://clearpick-api.onrender.com/api
Environment: Production, Preview, Development (בחר את כולם)
```

**7. לחץ "Save"**

---

### **שלב 3: Redeploy**

**1. חזור ל-Dashboard של הפרויקט**

**2. לחץ על "Deployments"**

**3. לחץ על ה-deployment האחרון (שלוש נקודות → "Redeploy")**

**או:**

**4. Vercel יעשה redeploy אוטומטי אחרי שתשמור את ה-Environment Variable**

---

### **שלב 4: בדוק**

**1. המתן 2-3 דקות לredeploy**

**2. רענן את האתר:**
```
https://www.clearpickai.com/search
```

**3. נסה לחפש מוצר**

**4. פתח Developer Tools (F12) → Console**

**5. אמור לראות network requests ל-`https://clearpick-api.onrender.com/api/search`**

---

## ⚠️ אם ה-Backend לא deployed:

**ראה את הקובץ:** `DEPLOY_NOW.md`

**בקצרה:**
1. Deploy Backend ל-Render
2. קבל URL (למשל: `https://clearpick-api.onrender.com`)
3. חזור לכאן והוסף את ה-URL כ-`VITE_API_URL`

---

## ✅ אחרי התיקון:

- ✅ החיפוש יעבוד
- ✅ בניית תיקים תעבוד
- ✅ כל ה-API calls יעברו ל-backend האמיתי

---

**זמן כולל: 2-5 דקות** ⚡
