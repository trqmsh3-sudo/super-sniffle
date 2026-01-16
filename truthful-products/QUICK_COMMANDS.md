# ⚡ Quick Commands - ClearPick.ai

**פקודות מהירות לשימוש יומיומי**

---

## 🚀 Start Everything

```powershell
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev

# דפדפן
http://localhost:5173
```

---

## 🧪 Testing

### Test Backend API:
```powershell
# Health check
curl http://localhost:3000/api/health

# Build dossier
curl -X POST http://localhost:3000/api/products/build `
  -H "Content-Type: application/json" `
  -d "{\"productName\": \"JBL Flip 6\"}"

# Get product
curl http://localhost:3000/api/products/1

# Search
curl "http://localhost:3000/api/search?q=JBL"
```

### Test Admin:
```powershell
# AI Stats
curl http://localhost:3000/api/admin/ai-stats

# System Info
curl http://localhost:3000/api/admin/system-info
```

---

## 🔧 Database

### Connect to DB:
```powershell
psql -U postgres -d clearpick
```

### Common Queries:
```sql
-- Count products
SELECT COUNT(*) FROM products;

-- Count dossiers
SELECT COUNT(*) FROM dossiers WHERE status = 'ready';

-- Recent products
SELECT p.name, d.overall_score, d.confidence_score 
FROM products p 
LEFT JOIN dossiers d ON p.id = d.product_id 
ORDER BY p.created_at DESC 
LIMIT 10;

-- Low confidence
SELECT p.name, d.confidence_score 
FROM products p 
JOIN dossiers d ON p.id = d.product_id 
WHERE d.confidence_score < 50 
ORDER BY d.confidence_score ASC;

-- Clear dossiers (DANGER!)
DELETE FROM dossiers;
```

---

## 📦 Dependencies

### Install:
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Add Package:
```powershell
# Backend
npm install package-name --save

# Frontend
npm install package-name --save
```

---

## 🔄 Redis

### Start Redis:
```powershell
# Windows (Memurai)
memurai.exe

# Or use Upstash (cloud)
# Just update REDIS_URL in .env
```

### Check Redis:
```powershell
redis-cli ping
# Should return: PONG
```

---

## 📝 Logs

### View Logs:
```powershell
# Backend logs
type backend\logs\combined.log
type backend\logs\error.log

# Clear logs
del backend\logs\*.log
```

---

## 🐛 Debug

### Backend Debug:
```powershell
# Run with debug logging
$env:LOG_LEVEL="debug"; node server.js
```

### Frontend Debug:
```javascript
// Open browser console (F12)
// Check for errors
// Network tab → see API calls
```

---

## 🧹 Clean Up

### Clear Cache:
```powershell
# Redis
redis-cli FLUSHALL

# Or restart Redis
```

### Clear Database:
```powershell
# DANGER - deletes all dossiers!
curl -X POST http://localhost:3000/api/admin/clear-dossiers
```

### Clear Node Modules:
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🚀 Deploy

### Render.com:
```powershell
# Make sure .env is NOT in git
git status

# Commit changes
git add .
git commit -m "Ready for deploy"
git push

# Render will auto-deploy!
```

### Manual Deploy:
```powershell
# Build frontend
cd frontend
npm run build

# Upload dist/ to Netlify/Vercel
```

---

## 📊 Monitoring

### Check System:
```powershell
# Backend health
curl http://localhost:3000/api/health

# Admin dashboard
http://localhost:5173/admin

# Database
psql -U postgres -d clearpick -c "SELECT COUNT(*) FROM products"
```

---

## ⚙️ Configuration

### Environment Variables:
```powershell
# Edit .env
notepad backend\.env

# Required:
# - DATABASE_URL
# - GEMINI_API_KEY

# Optional:
# - REDIS_URL
# - CLAUDE_API_KEY
# - UNSPLASH_ACCESS_KEY
# - PEXELS_API_KEY
# - BING_SEARCH_API_KEY
```

---

## 🎯 Common Tasks

### Add New Product:
```powershell
curl -X POST http://localhost:3000/api/products/build `
  -H "Content-Type: application/json" `
  -d "{\"productName\": \"Product Name Here\"}"
```

### Rebuild Product:
```powershell
# Just call build again - it will rebuild
curl -X POST http://localhost:3000/api/products/build `
  -H "Content-Type: application/json" `
  -d "{\"productName\": \"JBL Flip 6\"}"
```

### Check AI Stats:
```
http://localhost:5173/admin
```

### Export Bookmarks:
```javascript
// Browser console
localStorage.getItem('bookmarks')
```

---

## 🎉 That's It!

**כל הפקודות שאתה צריך במקום אחד!**

**שמור את הקובץ הזה ב-bookmarks! 🔖**

---

**Happy coding! 💻**
