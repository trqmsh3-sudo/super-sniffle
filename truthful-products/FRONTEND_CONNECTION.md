# 🔌 חיבור Frontend ל-Backend

## 📋 מצב נוכחי:

- ✅ Backend רץ על `http://localhost:3000`
- ⏳ Frontend מצביע ל-Mock data

צריך לעדכן את Frontend לדבר עם Real Backend.

---

## 🔧 שינויים נדרשים:

### 1. עדכן את ה-API endpoint

**קובץ:** `frontend/src/services/api.js`

```javascript
// לפני:
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// אחרי:
// זה כבר נכון! לא צריך לשנות
```

---

### 2. צור custom hook חדש ל-Product Search

**קובץ חדש:** `frontend/src/hooks/useProductSearch.js`

```javascript
import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useProductSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchProducts = async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/search?q=${query}`);
      setLoading(false);
      return response.data.products || [];
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  const buildDossier = async (productName, category = 'general') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/products/build`, {
        productName,
        category
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getProduct = async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      setLoading(false);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return {
    searchProducts,
    buildDossier,
    getProduct,
    loading,
    error
  };
};
```

---

### 3. עדכן את ProductSearch.jsx

**קובץ:** `frontend/src/components/product/ProductSearch.jsx`

החלף את כל התוכן ב:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductSearch } from '../../hooks/useProductSearch';

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { searchProducts, buildDossier, loading, error } = useProductSearch();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setShowResults(true);
    
    // חפש מוצרים קיימים
    const existingProducts = await searchProducts(query);
    
    if (existingProducts.length > 0) {
      setResults(existingProducts);
    } else {
      // אין תוצאות - הצע לבנות תיק חדש
      setResults([]);
    }
  };

  const handleBuildNew = async () => {
    try {
      const result = await buildDossier(query);
      
      if (result.success) {
        // נווט לדף המוצר
        navigate(`/product/${result.productId}`);
      }
    } catch (err) {
      console.error('Build error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <span className="text-2xl font-bold text-navy">Clear</span>
            <span className="text-2xl font-bold text-primary">Pick</span>
            <span className="text-lg font-normal text-navy-light">.ai</span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      {!showResults ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-navy mb-4">
                Clear<span className="text-primary">Pick</span> AI
              </h1>
              <p className="text-xl text-gray-600">
                מצא את המוצר המושלם<br />
                בלי פרסומות, בלי ביקורות מזויפות
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <label className="block text-gray-700 text-sm font-medium mb-3">
                מה אתה מחפש?
              </label>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder='למשל: "Sony WH-1000XM5" או "iPhone 15 Pro"'
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg"
                />
                
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-navy transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'מחפש...' : 'חפש מוצר'}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-navy mb-2">
                תוצאות עבור "{query}"
              </h1>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">מחפש...</p>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-navy mb-2">
                    לא מצאנו תיק למוצר הזה
                  </h3>
                  <p className="text-gray-600 mb-6">
                    אבל אנחנו יכולים לבנות תיק חדש בשבילך!
                  </p>
                  <button
                    onClick={handleBuildNew}
                    disabled={loading}
                    className="bg-primary text-white py-3 px-8 rounded-lg font-semibold hover:bg-navy transition disabled:bg-gray-300"
                  >
                    {loading ? 'בונה תיק...' : 'בנה תיק חדש'}
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    זה ייקח בערך 30-60 שניות
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-navy mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {product.summary || 'תיק מלא זמין'}
                        </p>
                      </div>
                      {product.overall_score && (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            {product.overall_score}
                          </div>
                          <div className="text-sm text-gray-500">ציון</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
```

---

### 4. עדכן את useProductDossier.js

**קובץ:** `frontend/src/hooks/useProductDossier.js`

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useProductDossier = (productId) => {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDossier = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/products/${productId}`);
        setDossier(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (productId) {
      loadDossier();
    }
  }, [productId]);

  return { dossier, loading, error };
};

export default useProductDossier;
```

---

### 5. עדכן את ProductDossier.jsx

**קובץ:** `frontend/src/components/product/ProductDossier.jsx`

עדכן את השורות הראשונות:

```javascript
import { useParams } from 'react-router-dom';
import { useProductDossier } from '../../hooks/useProductDossier';

const ProductDossier = () => {
  const { productId } = useParams();
  const { dossier, loading, error } = useProductDossier(productId);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">טוען תיק מוצר...</p>
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'המוצר לא נמצא'}</p>
        </div>
      </div>
    );
  }

  // המשך עם הקוד הקיים...
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ... שאר הקוד כמו שהוא ... */}
      
      {/* רק תקן את הגישה לנתונים: */}
      <h1>{dossier.product.name}</h1>
      <div>{dossier.scores.overall}</div>
      {/* וכו'... */}
    </div>
  );
};
```

---

## ✅ בדיקה:

1. **הפעל Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **הפעל Frontend (טרמינל חדש):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **פתח דפדפן:**
   ```
   http://localhost:5173/search
   ```

4. **חפש מוצר:**
   - הקלד "Sony WH-1000XM5"
   - לחץ "חפש מוצר"
   - אם אין תיק → לחץ "בנה תיק חדש"
   - המתן 30-60 שניות
   - תועבר לדף התיק! 🎉

---

## 🎯 זהו!

עכשיו יש לך מערכת מלאה שעובדת!

**Backend + Frontend מחוברים!** 🚀
