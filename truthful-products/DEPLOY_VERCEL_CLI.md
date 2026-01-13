# 🚀 Deploy via Vercel CLI (Command Line)

## ✅ All files are updated and pushed to GitHub!

## Now run this command in the frontend folder:

```bash
cd truthful-products/frontend
vercel
```

## If you're not logged in:

1. Run: `vercel login`
2. Follow the browser prompt
3. Then run: `vercel`

## When prompted:

- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (first time) or Yes (if project exists)
- **Project name?** → `clearpick-ai` (or any name)
- **Directory?** → `./` (current directory is `frontend`, which is correct!)
- **Override settings?** → Yes, then set:
  - **Framework?** → Vite
  - **Output Directory?** → `dist`
  - **Build Command?** → `npm run build`
  - **Install Command?** → `npm install`

## For production deployment:

```bash
vercel --prod
```

## To link domain later:

```bash
vercel domains add clearpickai.com
```

---

## ✅ That's it! Your site will be live! 🎉
