# 🛍️ הגדרת Google Shopping API - מדריך מהיר

## 📝 **מה יש לך:**
✅ **API Key:** `AIzaSyCJ4DCwn9kx7tqeeq1Y_n8l_pXa6vwmH7Q`

## ❌ **מה חסר:**
⏳ **Custom Search Engine ID (CX)**

---

## 🚀 **איך ליצור CX ID (5 דקות):**

### **שלב 1: לך לאתר**
https://programmablesearchengine.google.com/

### **שלב 2: לחץ "Add"**
או "Create a search engine" / "הוסף מנוע חיפוש"

### **שלב 3: הגדרות:**
```
Name: ClearPick Product Search
What to search: Search the entire web
```

### **שלב 4: הגדרות מתקדמות:**
1. לחץ על "Edit search engine"
2. בחר "Search the entire web" (חפש בכל האינטרנט)
3. הפעל "Image search" (חיפוש תמונות)

### **שלב 5: קבל את ה-CX ID:**
```
תראה משהו כמו: 
017576662512468239146:omuauf_lfve

או:

a1b2c3d4e5f6g7h8i
```

העתק את זה!

### **שלב 6: הוסף ל-.env:**
```env
GOOGLE_SHOPPING_CX=your_cx_id_here
```

---

## 🔧 **אני כבר הכנתי את הקוד!**

הקובץ `backend/services/googleShoppingService.js` מוכן ומחכה רק ל-CX ID.

---

## ⚡ **אופציה מהירה:**

אם אתה רוצה לראות איך זה עובד **עכשיו**, אני יכול:

1. ליצור CX ID זמני
2. להפעיל את המערכת
3. להראות לך demo

**או**

אתה יכול ליצור את ה-CX ID בעצמך (5 דקות) ואני אחכה.

---

## 🎯 **מה תעדיף?**

1. **אני יוצר CX ID זמני** - תראה demo מיד
2. **אתה יוצר CX ID** - אני אחכה והסבר לך
3. **נדלג על זה בינתיים** - נפעיל בלי Google Shopping

**מה תרצה?** 🚀
