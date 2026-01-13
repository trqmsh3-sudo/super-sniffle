# 🔧 תיקון 404 ב-Vercel - הוראות מדויקות

## הבעיה:
ה-Root Directory לא מוגדר כ-`frontend`, אז Vercel מחפש את הקבצים במקום הלא נכון.

## הפתרון - 2 דרכים:

### דרך 1: דרך ה-Dashboard (מומלץ) ✅

1. **פתח:** https://vercel.com/mosess-projects-a989c1f2/clearpick-ai/settings
2. **לחץ על:** "Build and Deployment" בתפריט השמאלי
3. **גלול למטה** עד שתמצא את הסקשן "Build and Development Settings"
4. **מצא את השדה:** "Root Directory"
5. **הכנס:** `frontend`
6. **שמור** (כפתור Save)

### דרך 2: דרך הטרמינל (אם אתה מחובר)

```bash
cd truthful-products
vercel --prod
```

---

## אחרי התיקון:

1. Vercel יעשה **redeploy אוטומטי**
2. תחכה 2-3 דקות
3. בדוק: https://clearpick-ai.vercel.app
4. **לא אמור להיות 404!** ✅

---

## אם עדיין יש 404:

בדוק ש:
- ✅ Root Directory = `frontend`
- ✅ Build Command = `npm run build`
- ✅ Output Directory = `dist`
- ✅ Framework = `Vite`

---

**אחרי שתתקן - תגיד לי ואבדוק שהכל עובד!** 🚀
