# 🔑 הוספת Environment Variables ידנית (2 דקות)

## 📍 אתה נמצא כאן:
`https://dashboard.render.com/web/srv-d5jimbt6ubrc738vo5g0/env`

---

## ✅ שלב 1: הוסף DATABASE_URL

1. **לחץ על הכפתור הכחול "Add"** (בצד ימין למעלה)
2. **בחר מהתפריט: "From Database"**
3. **בחר את הדאטהבייס**: `clearpickdb` (או `clearpick-db`)
4. **Key**: `DATABASE_URL` (אוטומטי)
5. **Value**: בחר **"Internal Database URL"**
6. **לחץ "Add"**

---

## ✅ שלב 2: הוסף GEMINI_API_KEY

1. **לחץ שוב על "Add"**
2. **בחר: "Environment Variable"** (לא "From Database" הפעם)
3. **Key**: `GEMINI_API_KEY`
4. **Value**: `AIzaSyCu3btljFi6Y1YCVMZXnI6HwHvIkOi8u7I`
5. **לחץ "Add"**

---

## ✅ שלב 3: שמור ועשה Deploy

1. **גלול למטה ולחץ "Save Changes"** (כפתור כחול גדול)
2. **חזור לדף הראשי** של השירות (לחץ על "------------------------" בתפריט השמאלי)
3. **לחץ "Manual Deploy"** (כפתור כחול בצד ימין למעלה)
4. **המתן 2-3 דקות** שה-Deploy יסתיים

---

## ✅ שלב 4: בדוק שזה עובד

אחרי שה-Deploy הסתיים:

1. **לך ל-"Logs"** (בתפריט השמאלי)
2. **חפש את השורות האלה** (צריך להופיע ללא שגיאות):
   ```
   🔌 Connected to PostgreSQL database
   🚀 ClearPick.ai Unified API Server
   📊 Status: Ready
   ```

3. **ודא שלא מופיע**:
   - ❌ `GEMINI_API_KEY missing`
   - ❌ `ECONNREFUSED ::1:5432`

---

## 🎯 אם זה עובד:

תראה בלוגים:
```
08:XX:XX AM [ xxxxx ] 🔌 Connected to PostgreSQL database
08:XX:XX AM [ xxxxx ] 
08:XX:XX AM [ xxxxx ] ╔═══════════════════════════════════════════════════════════╗
08:XX:XX AM [ xxxxx ] ║   🚀 ClearPick.ai Unified API Server                     ║
08:XX:XX AM [ xxxxx ] ║   💾 Database: PostgreSQL                                ║
08:XX:XX AM [ xxxxx ] ║   🤖 AI: Gemini + Claude (Smart Routing)                 ║
08:XX:XX AM [ xxxxx ] ║   📊 Status: Ready                                        ║
08:XX:XX AM [ xxxxx ] ╚═══════════════════════════════════════════════════════════╝
```

---

## 📞 אחרי שזה עובד:

תגיד לי "עבד!" ואני אבדוק את הלוגים המלאים ואמשיך לשלב הבא.

---

🚀 **בהצלחה!**
