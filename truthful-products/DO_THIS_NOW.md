# 🚨 עשה את זה עכשיו - דקה אחת!

## הבעיה:
הכול עובד חוץ מ-Database. צריך ליצור PostgreSQL ב-Render.

## מה לעשות:

### 1. פתח את הקישור הזה בדפדפן שלך:
```
https://dashboard.render.com/new/database
```

### 2. מלא את הטופס:
- **Name**: ``clearpickdb
- **Region**: בחר Oregon (US West) - שם נמצא ה-backend
- השאר את כל השאר ברירת מחדל

### 3. לחץ "Create Database"

### 4. המתן 30 שניות עד שה-Status יהיה "Available"

### 5. העתק את ה-DATABASE_URL:
- גלול למטה ל-**Connections**
- לחץ **Copy** ליד **Internal Database URL**

### 6. הוסף את ה-URL ל-Backend:
פתח: https://dashboard.render.com/web/srv-d5h0meadbo4c73dlp3b0/env

- לחץ **Add Environment Variable**
- Key: `DATABASE_URL`
- Value: [הדבק את ה-URL]
- לחץ **Save Changes**

### 7. זהו! בדוק:
```
https://clearpick-ai.onrender.com/api/health
```

צריך לראות: `"status":"ok"` ו-`"database":"✅ Connected"`

---

## אחרי זה:
לך ל- https://www.clearpickai.com/search ותחפש מוצר!
