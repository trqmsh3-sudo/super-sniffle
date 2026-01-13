# 🔧 תיקון מיידי - 5 דקות

## הבעיה:
החיפוש לא עובד כי:
1. אין Backend deployed
2. Frontend לא יודע איפה ה-Backend

---

## הפתרון (עשה את זה **עכשיו**):

### **צעד 1: הוסף Environment Variable ב-Vercel (2 דקות)**

**פתח את הקישור הזה:**
```
https://vercel.com/mosess-projects-a989c1f2/clearpick-ai/settings/environment-variables
```

**לחץ על "Add New"**

**מלא:**
```
Key (Name):
VITE_API_URL

Value:
http://localhost:3000/api

Environments:
☑ Production
☑ Preview  
☑ Development
```

**לחץ "Save"**

---

### **צעד 2: Redeploy (1 דקה)**

**חזור לדף הפרויקט:**
```
https://vercel.com/mosess-projects-a989c1f2/clearpick-ai
```

**לחץ על "Deployments"**

**לחץ על ה-deployment הראשון ברשימה (שלוש נקודות ⋮ → "Redeploy")**

**אשר: "Redeploy"**

---

### **צעד 3: המתן (2-3 דקות)**

Vercel יבנה את האתר מחדש עם ה-API URL החדש.

תראה: "Building..." → "Ready"

---

### **צעד 4: בדוק**

**פתח:**
```
https://www.clearpickai.com/search
```

**פתח Developer Tools (F12) → Console**

**חפש משהו (למשל: "iPhone 15")**

**תראה:** "Unable to connect to server" — זה **טוב**! זה אומר שהקוד מנסה להתחבר.

---

## למה localhost?

בינתיים, השתמשתי ב-`localhost` כדי שהקוד לא יתקע.
אחרי שנדפלוי את ה-Backend, פשוט נעדכן את ה-Value ל-URL האמיתי.

---

## הצעד הבא (אופציונלי - רק אם אתה רוצה שהחיפוש באמת יעבוד):

**Deploy Backend ל-Render** (10 דקות) - ראה `DEPLOY_NOW.md`

---

**תגיד לי אחרי שעשית את צעד 1 ו-2 ואני אמשיך מכאן.**
