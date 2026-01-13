# 🔧 תיקון שגיאת Build ב-Vercel

## הבעיה:
```
npm error enoent Could not read package.json
```

**הסיבה:** Vercel מחפש את `package.json` במקום הלא נכון.

---

## הפתרון (2 דקות):

### **צעד 1: עצור את ה-build הנוכחי**

**לחץ על הקישור:**
```
https://vercel.com/mosess-projects-a989c1f2/clearpick-ai
```

**אם יש build שרץ עכשיו (סימן כתום) - לחץ "Cancel" או המתן שיסתיים**

---

### **צעד 2: תקן את Root Directory**

**לחץ על "Settings" (בתפריט העליון)**

**לחץ על "General" (בצד שמאל)**

**גלול למטה עד "Build & Development Settings"**

**מצא את השדה "Root Directory"**

**לחץ על "Edit" או על השדה**

**הכנס:**
```
frontend
```

**לחץ "Save"**

---

### **צעד 3: Redeploy**

**חזור ל-Dashboard:**
```
https://vercel.com/mosess-projects-a989c1f2/clearpick-ai
```

**לחץ "Deployments"**

**לחץ על ה-deployment האחרון → שלוש נקודות → "Redeploy"**

**אשר**

---

### **צעד 4: המתן**

ה-build אמור לקחת 2-3 דקות.

תראה: "Building..." → "Ready" ✅

---

**עכשיו זה יעבוד!**
