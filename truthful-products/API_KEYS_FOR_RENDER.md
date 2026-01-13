# 🔑 המפתחות למלא ב-Render

## ✅ **מצאתי את המפתחות בקובץ .env שלך!**

---

## 📝 **מה למלא ב-Render Environment Variables:**

**לך ל-Render Dashboard → ה-Service שלך → Environment → Add Environment Variable**

### **הוסף את המשתנים הבאים:**

**1. GEMINI_API_KEY:**
- פתח את הקובץ: `backend/.env`
- העתק את הערך של `GEMINI_API_KEY=...`
- הוסף ב-Render: `GEMINI_API_KEY` = [הערך שהעתקת]

**2. ANTHROPIC_API_KEY (או CLAUDE_API_KEY):**
- פתח את הקובץ: `backend/.env`
- העתק את הערך של `CLAUDE_API_KEY=...`
- הוסף ב-Render: `ANTHROPIC_API_KEY` = [הערך שהעתקת]
- **הערה:** בקוד המקומי זה `CLAUDE_API_KEY`, אבל ב-Render צריך `ANTHROPIC_API_KEY`

**3. NODE_ENV:**
```
production
```

**4. FRONTEND_URL:**
```
https://www.clearpickai.com
```

---

## ⚠️ **חשוב - ביטחון:**

**אל תדחף את קובץ `.env` ל-GitHub!** הוא כבר ב-`.gitignore`.

---

## ✅ **איך למצוא את המפתחות:**

1. פתח את הקובץ: `truthful-products/backend/.env`
2. חפש את השורות:
   - `GEMINI_API_KEY=...`
   - `CLAUDE_API_KEY=...`
3. העתק את הערכים (בלי ה-`=`)

---

**תגיד לי כשתסיים להזין את המפתחות ב-Render!**
