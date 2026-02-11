import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// Smart API URL detection
const getAPIUrl = () => {
  // If explicitly set in env, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on hostname
  const hostname = window.location.hostname;
  if (hostname === 'www.clearpickai.com' || hostname === 'clearpickai.com') {
    return 'https://clearpick-ai.onrender.com/api';
  }
  if (hostname.includes('vercel.app')) {
    return 'https://clearpick-ai.onrender.com/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:3000/api';
};

const API_URL = getAPIUrl();

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isClassicMode = location.pathname.startsWith('/classic') || location.pathname.startsWith('/search-old');
  const productBasePath = isClassicMode ? '/classic/product' : '/product';

  const handleSearch = async (searchValue = query) => {
    const safeQuery = searchValue.trim();
    if (!safeQuery) return;
    
    setLoading(true);
    setShowResults(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(safeQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.products || []);
      } else {
        setError(data.error || 'חיפוש נכשל');
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('שגיאה בחיבור לשרת');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuildNew = async () => {
    if (!query.trim()) return;
    
    setBuilding(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/products/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: query,
          category: 'general'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Success! Navigate to the product page
        navigate(`${productBasePath}/${data.productId}`);
      } else {
        setError(data.error || 'בניית תיק נכשלה');
      }
    } catch (err) {
      console.error('Build error:', err);
      setError('שגיאה בבניית תיק');
    } finally {
      setBuilding(false);
    }
  };

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, []);

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
                  placeholder='למשל: "שואב אבק אלחוטי חזק עד $400 לשיער חיות מחמד"'
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg"
                />
                
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-navy transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'מחפש...' : 'קבל המלצה'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">שגיאה:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>מבוסס על <strong>ביקורות אמיתיות</strong> מהאינטרנט</p>
              <p className="mt-2">✓ ללא תוצאות ממומנות ✓ ללא הטיות שיווקיות</p>
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
              <p className="text-gray-600">מבוסס על {results[0]?.total_reviews || '10,000+'} ביקורות מאומתות</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">מחפש תיקי מוצר...</p>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-navy mb-2">לא מצאנו תיק למוצר הזה</h3>
                  <p className="text-gray-600 mb-6">
                    אבל אנחנו יכולים לבנות תיק חדש בשבילך!
                    זה ייקח בערך 30-60 שניות.
                  </p>
                  <button
                    onClick={handleBuildNew}
                    disabled={building}
                    className="bg-primary text-white py-3 px-8 rounded-lg font-semibold hover:bg-navy transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {building ? 'בונה תיק... 🔄' : 'בנה תיק חדש ✨'}
                  </button>
                  <p className="mt-4 text-sm text-gray-500">
                    💡 נחפש באינטרנט, ננתח ביקורות, ונבנה תיק מלא
                  </p>
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`${productBasePath}/${product.id}`)}
                    className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-navy mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {product.summary || 'תיק מלא זמין'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>📊 {product.category || 'כללי'}</span>
                          <span>•</span>
                          <span>🕐 עודכן: {new Date(product.last_updated).toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                      {product.overall_score && (
                        <div className="text-center ml-4">
                          <div className="text-4xl font-bold text-primary">
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
