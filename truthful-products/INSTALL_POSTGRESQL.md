# 🗄️ התקנת PostgreSQL - מדריך פשוט

**זמן: 20 דקות**

---

## 📥 **שלב 1: הורד PostgreSQL (5 דקות)**

### **לחץ כאן:**
```
https://www.postgresql.org/download/windows/
```

### **או ישירות:**
```
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
```

**בחר:**
- גרסה: **PostgreSQL 16.x** (האחרונה)
- Windows x86-64

**הורד** → `postgresql-16.x-windows-x64.exe`

---

## 💿 **שלב 2: התקן (5 דקות)**

### **הרץ את הקובץ שהורדת:**

1. **Password for postgres user:**
   ```
   בחר סיסמה חזקה!
   (תזכור אותה - תצטרך!)
   
   לדוגמה: ClearPick2026!
   ```

2. **Port:**
   ```
   5432 (default) ✅
   ```

3. **Locale:**
   ```
   Default locale ✅
   ```

4. **Components:**
   ```
   ✅ PostgreSQL Server
   ✅ pgAdmin 4
   ✅ Command Line Tools
   ⬜ Stack Builder (not needed)
   ```

5. **לחץ Next → Next → Install**

---

## ✅ **שלב 3: בדוק שעובד (2 דקות)**

### **פתח PowerShell חדש:**

```powershell
# בדוק שהתקנה הצליחה:
psql --version

# אמור לראות:
# psql (PostgreSQL) 16.x
```

---

## 🗄️ **שלב 4: צור Database (3 דקות)**

### **פתח pgAdmin או psql:**

#### **דרך 1: pgAdmin (גרפי - קל יותר)**
```
1. פתח pgAdmin 4 (התקנה הוסיפה אותו לStart Menu)
2. הזן את הסיסמה שבחרת
3. לחץ ימין על "Databases" → Create → Database
4. שם: clearpick
5. לחץ Save
```

#### **דרך 2: psql (Command Line)**
```powershell
# פתח psql:
psql -U postgres

# הזן את הסיסמה

# צור database:
CREATE DATABASE clearpick;

# בדוק:
\l
# אמור לראות "clearpick" ברשימה

# התחבר אליו:
\c clearpick

# צא:
\q
```

---

## 📋 **שלב 5: הרץ Schema (5 דקות)**

### **חזור לפרויקט:**

```powershell
cd "c:\Users\maisi\OneDrive\Documents\מערכת המלצות למוצרים חכמה\truthful-products\backend"
```

### **הרץ את ה-Schema:**

```powershell
psql -U postgres -d clearpick -f config\schema.sql
```

**הזן את הסיסמה**

אמור לראות:
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
```

---

## ✅ **שלב 6: עדכן .env (1 דקה)**

### **פתח את הקובץ:**
```
C:\Users\maisi\OneDrive\Documents\מערכת המלצות למוצרים חכמה\truthful-products\backend\.env
```

### **שנה את השורה:**
```env
DB_PASSWORD=your_password_here
```

**ל:**
```env
DB_PASSWORD=ClearPick2026!
```
(או הסיסמה שבחרת)

**שמור** (Ctrl+S)

---

## 🧪 **שלב 7: בדוק שהכל עובד (1 דקה)**

```bash
cd backend
npm run test-db
```

**אמור לראות:**
```
✅ Database connected!
✅ Found 4 tables:
   - products
   - dossiers
   - reviews
   - jobs
✅ All tests passed!
```

---

## 🎉 **סיימת! PostgreSQL מוכן!**

### **עכשיו תוכל:**

```bash
# הפעל את השרת:
npm start

# בנה תיק ראשון:
npm run test-dossier

# בדוק בדפדפן:
http://localhost:3000/api/health
```

---

## 🐛 **בעיות נפוצות:**

### **"psql: command not found"**
```
פתרון: הפעל מחדש את PowerShell אחרי ההתקנה
או הוסף ל-PATH:
C:\Program Files\PostgreSQL\16\bin
```

### **"password authentication failed"**
```
פתרון: הסיסמה ב-.env לא תואמת לזו של PostgreSQL
ודא שהסיסמה נכונה!
```

### **"database clearpick does not exist"**
```
פתרון:
psql -U postgres
CREATE DATABASE clearpick;
\q
```

### **"schema.sql not found"**
```
פתרון: ודא שאתה בתיקיית backend/
cd backend
```

---

## ⏱️ **זמן כולל: 20 דקות**

```
הורדה: 5 דקות
התקנה: 5 דקות
בדיקה: 2 דקות
יצירת DB: 3 דקות
Schema: 5 דקות
───────────────────
סה"כ: 20 דקות ✅
```

---

**בהצלחה! אני כאן אם יש בעיות!** 🚀
