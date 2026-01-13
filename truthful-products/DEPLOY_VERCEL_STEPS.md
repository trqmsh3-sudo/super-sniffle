# 🚀 Deploy to Vercel - Quick Steps

## ✅ What You Need to Do in Vercel Dashboard:

### 1. Import Repository
- Go to https://vercel.com/new
- Import: `https://github.com/trqmsh3-sudo/-clearpick-ai`

### 2. Configure Project Settings

**Click "Configure Project" and set:**

```
Framework Preset: Vite

Root Directory: frontend

Build Command: npm run build

Output Directory: dist

Install Command: npm install
```

### 3. Click "Deploy" 🚀

That's it! Wait 2-3 minutes and your site will be live!

---

## 🌐 After Deployment - Connect Domain:

1. Go to Project Settings → Domains
2. Add: `clearpickai.com`
3. Copy the DNS settings Vercel gives you
4. Update DNS in Namecheap:
   - Type: A
   - Host: @
   - Value: (Vercel IP)
   - TTL: Automatic

   - Type: CNAME  
   - Host: www
   - Value: cname.vercel-dns.com
   - TTL: Automatic

---

## ✅ That's it! Your site will be live on clearpickai.com! 🎉
