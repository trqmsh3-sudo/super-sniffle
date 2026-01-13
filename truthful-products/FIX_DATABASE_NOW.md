# 🔧 הוראות תיקון Database - Render

## הבעיה:
```
column "created_at" of relation "dossiers" does not exist
```

## הפתרון:
צריך להריץ migration על PostgreSQL ב-Render.

---

## שיטה 1: דרך Render Dashboard (הכי פשוט!)

### שלב 1: פתח Shell
1. לך ל: https://dashboard.render.com/web/srv-d5h0meadbo4c73dlp3b0
2. לחץ על **"Shell"** בצד שמאל
3. זה יפתח terminal

### שלב 2: הרץ Migration
העתק והדבק את הפקודה הזאת:
```bash
npm run migrate
```

זהו! זה יריץ את ה-migration ויוסיף את העמודה החסרה.

---

## שיטה 2: דרך Render PostgreSQL Console (אלטרנטיבה)

### שלב 1: פתח PostgreSQL Console
1. לך ל: https://dashboard.render.com
2. לחץ על **"clearpickdb"** (ה-PostgreSQL database)
3. לחץ על **"Connect"** → **"External Connection"**
4. העתק את ה-**"PSQL Command"**

### שלב 2: התחבר
הדבק את הפקודה ב-PowerShell:
```powershell
# הדבק את הפקודה שקיבלת מRender
psql -h ...
```

### שלב 3: הרץ SQL
העתק והדבק:
```sql
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

UPDATE dossiers 
SET created_at = last_updated 
WHERE created_at IS NULL;

-- בדוק שזה עבד:
\d dossiers
```

אתה אמור לראות את `created_at` ברשימת העמודות!

---

## שיטה 3: אוטומטי (Render יריץ בעצמו)

הוספתי את ה-migration לקוד. כשRender יעשה deploy חדש, הוא אמור להריץ אותו אוטומטית.

**אבל!** זה יקח זמן (1-2 דקות), אז אם אתה רוצה לבדוק עכשיו - עדיף שיטה 1 או 2.

---

## ✅ איך לבדוק שזה עבד:

### 1. בדוק דרך API:
```powershell
curl https://clearpick-ai.onrender.com/api/health
```

אם אתה רואה:
```json
{
  "database": "✅ Connected"
}
```
זה אומר שה-database עובד!

### 2. נסה חיפוש:
```powershell
curl "https://clearpick-ai.onrender.com/api/search?q=iPhone"
```

### 3. בנה דוסייה:
```powershell
curl -X POST https://clearpick-ai.onrender.com/api/products/build `
  -H "Content-Type: application/json" `
  -d '{\"productName\": \"AirPods Pro 2\", \"category\": \"Audio\"}'
```

אם זה עובד ללא שגיאות - **המערכת תקינה!** ✅

---

## 🎯 במקביל - הפעלתי Gemini Only

כדי לחסוך בטוקנים, שיניתי את הקוד להשתמש **רק ב-Gemini** (חינם) במקום Claude.

### להחזיר את Claude:
פתח `backend/services/aiRouter.js` ושנה:
```javascript
get forceGeminiOnly() {
  return false; // שנה true ל-false
}
```

והפעל:
```bash
git add -A
git commit -m "Restore Claude routing"
git push
```

Render יעשה deploy אוטומטי ו-Claude יחזור לעבודה!

---

**תריץ את ה-migration עכשיו ותגיד לי אם זה עובד!** 🚀
