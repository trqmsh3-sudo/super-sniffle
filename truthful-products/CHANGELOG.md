# 📝 Changelog - ClearPick.ai

All notable changes to this project will be documented in this file.

---

## [2.0.0] - 2026-01-14

### 🎉 Major Release - Backend-Frontend Integration Fixed!

#### ✅ Fixed (Critical)
- **BREAKING:** Fixed Backend-Frontend disconnect
  - Backend `SimpleDossierBuilder` now properly connected to routes
  - Frontend now uses `/api/products/build` endpoint correctly
  - Reddit Scraper, AI, Cache, and Images now actually work!
- Added comprehensive error handling to all routes
- Fixed API endpoint naming inconsistencies

#### ✨ Added (New Features)
- **Rate Limiting:** Prevent API abuse (10 builds/15min per IP)
- **ErrorBoundary:** Catches React errors, prevents white screen
- **Toast Notifications:** User feedback system (success, error, warning, info)
- **BuildingAnimation:** Beautiful loading state with progress bar
- **ImageGallery:** Multiple images support with lightbox
- **ConfidenceWarning:** Visual warnings for low-quality data
- **Share/Bookmark:** Sharing and bookmarking functionality
- **SkeletonDossier:** Better loading placeholders
- **AdminDashboard:** Internal monitoring page (/admin)
- **Winston Logger:** Professional logging with file rotation

#### 🔧 Changed
- Updated `frontend/src/services/api.js` with new functions:
  - `buildProduct()` - Main build function
  - `getProductDossier()` - Get dossier by ID
  - `searchProducts()` - Search existing products
- Updated `SearchPagePremium` to use BuildingAnimation
- Updated `DossierPagePremium` with new components
- Updated `main.jsx` with ErrorBoundary and ToastProvider

#### 📊 Improved
- Better error messages for users
- Faster cache-hit responses
- More detailed logging
- Better UX feedback
- Mobile-responsive improvements

#### 🛠️ Technical
- Backend dependencies: Added `express-rate-limit`
- Frontend dependencies: No new dependencies needed!
- All new components use existing UI library

---

## [1.0.0] - 2026-01-13

### Initial Release

#### Features
- Basic product search
- Reddit scraper (not connected)
- Data aggregator (not connected)
- Smart cache (not connected)
- Universal images (not connected)
- SimpleDossierBuilder (not connected)
- Frontend with search and dossier pages

#### Known Issues
- Backend and Frontend not properly connected
- Phase 1 features exist but not active
- No error handling
- No rate limiting
- No user feedback system

---

## Migration Guide (1.0 → 2.0)

### Backend Changes:
1. Install new dependency: `npm install express-rate-limit`
2. Update routes to use SimpleDossierBuilder
3. Add rate limiting middleware
4. Update error handling

### Frontend Changes:
1. Update `main.jsx` to wrap App with ErrorBoundary and ToastProvider
2. Update `SearchPage` to use BuildingAnimation
3. Update `DossierPage` with new components
4. Use new API functions from `services/api.js`

### Breaking Changes:
- `searchProduct()` is deprecated - use `buildProduct()` instead
- Backend endpoint `/products/search` replaced with `/products/build`
- Response format changed to include more metadata

### New Features Available:
- Share product dossiers
- Bookmark products (localStorage)
- View building progress
- Better error messages
- Admin dashboard at `/admin`

---

**For full details, see:**
- `✅_תיקונים_שבוצעו.md`
- `דוח_בדיקות_ושיפורים.md`
