import { useProductDossier } from '../../hooks/useProductDossier';

const ProductDossier = ({ productId }) => {
  const { dossier, loading } = useProductDossier(productId);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">מנתח נתונים מ-47,234 ביקורות...</p>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <p className="text-text-muted">המוצר לא נמצא</p>
    </div>;
  }

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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{dossier.name}</h1>
            <p className="text-xl text-gray-300 mb-8">ניתוח מעמיק של {dossier.total_reviews_analyzed.toLocaleString()} ביקורות אמיתיות</p>
            
            {/* Overall Score */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur rounded-lg px-6 py-3">
              <div className="text-3xl font-bold">{dossier.overall_score}</div>
              <div className="text-sm">ציון כללי</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Analysis */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Verdict Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-navy mb-6">ניתוח מפורט</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">ביצועים</span>
                    <span className="font-semibold">{dossier.scores.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full" 
                      style={{width: `${dossier.scores.performance}%`}}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">אמינות</span>
                    <span className="font-semibold">{dossier.scores.reliability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{width: `${dossier.scores.reliability}%`}}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">תמורה למחיר</span>
                    <span className="font-semibold">{dossier.scores.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{width: `${dossier.scores.value}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pros */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-navy mb-6 text-green-600">✓ יתרונות מוכחות</h3>
              <div className="space-y-4">
                {dossier.pros.slice(0, 5).map((pro, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="text-green-500 mt-1">✓</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{pro.point}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        "{pro.top_quote}" - {pro.frequency} אזכורים
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-navy mb-6 text-yellow-600">⚠ חסרונות ידועות</h3>
              <div className="space-y-4">
                {dossier.cons.slice(0, 5).map((con, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="text-yellow-500 mt-1">⚠</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{con.point}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        "{con.top_quote}" - {con.frequency} אזכורים
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Failures */}
            {dossier.common_failures.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-navy mb-6 text-red-600">🔧 תקלות נפוצות</h3>
                <div className="space-y-4">
                  {dossier.common_failures.map((failure, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <p className="font-medium text-gray-800">{failure.issue}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {failure.reports} דיווחים | חומרה: {failure.severity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Best For */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-navy mb-4">🎯 מומלץ ל</h3>
              <ul className="space-y-2">
                {dossier.best_for.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Recommended For */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-navy mb-4">❌ לא מומלץ ל</h3>
              <ul className="space-y-2">
                {dossier.not_for.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Sources */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-navy mb-4">📊 מקורות נתונים</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reddit:</span>
                  <span className="font-semibold">{dossier.reddit_mentions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amazon:</span>
                  <span className="font-semibold">{dossier.amazon_verified_reviews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">סה"כ:</span>
                  <span className="font-semibold">{dossier.total_reviews_analyzed.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                עדכון לאחרונה: {new Date(dossier.last_updated).toLocaleDateString('he-IL')}
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
              <h3 className="text-lg font-bold text-navy mb-4">רטיפית אמון</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">רק ביקורות מאומתות</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">ללא תלויות פרסומיות</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">ניתוח אובייקטיבי</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">שקיפות מלאה</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDossier;
