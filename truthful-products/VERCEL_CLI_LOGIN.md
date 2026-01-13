# 🔐 התחברות ל-Vercel דרך CLI

## שלב 1: התחברות

```bash
cd truthful-products/frontend
vercel login
```

זה יפתח לך דפדפן אוטומטית עם קישור להתחברות.

## מה קורה:
1. הטרמינל יציג לך קישור כמו: `https://vercel.com/cli/login?token=...`
2. הדפדפן ייפתח אוטומטית (או תפתח אותו ידנית)
3. לחץ על "Authorize" ב-Vercel
4. הטרמינל יציג: `✅ Success! Authentication complete.`

## שלב 2: פריסה

אחרי ההתחברות, תריץ:

```bash
vercel
```

כששואלים אותך:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → בחר את החשבון שלך
- **Link to existing project?** → `N` (No - זה פרויקט חדש)
- **What's your project's name?** → `clearpick-ai` (או כל שם שאתה רוצה)
- **In which directory is your code located?** → `./` (כי אתה כבר בתיקיית frontend)
- **Want to override the settings?** → `Y` (Yes)
  - **Which settings would you like to override?**
    - Framework: `Vite`
    - Build Command: `npm run build`
    - Output Directory: `dist`
    - Development Command: `npm run dev`
    - Install Command: `npm install`

## שלב 3: פריסה לפרודקשן

אחרי שהכל עובד, לפריסה לפרודקשן:

```bash
vercel --prod
```

## חיבור דומיין:

```bash
vercel domains add clearpickai.com
```

---

✅ זה הכל! 🚀
