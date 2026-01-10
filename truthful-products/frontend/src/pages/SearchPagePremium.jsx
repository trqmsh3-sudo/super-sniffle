import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

const SearchPagePremium = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setShowResults(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.products || []);
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Unable to connect to server');
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
        navigate(`/product/${data.productId}`);
      } else {
        setError(data.error || 'Failed to build dossier');
      }
    } catch (err) {
      console.error('Build error:', err);
      setError('Unable to build dossier');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {!showResults ? (
          /* HERO SEARCH */
          <div className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="max-w-5xl w-full">
              {/* Badge */}
              <div className="flex justify-center mb-8 animate-slide-up">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300 font-medium">
                    <span className="text-primary-400 font-bold">12,847</span> smart shoppers trust us
                  </span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-center text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-none animate-slide-up" style={{animationDelay: '0.1s'}}>
                Find Products
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                  You Can Trust
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-center text-xl md:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
                AI analyzes <span className="text-white font-semibold">thousands of real reviews</span> in seconds.
                <br className="hidden md:block" />
                No ads. No BS. Just honest insights.
              </p>

              {/* Search Box - PREMIUM */}
              <div className="max-w-4xl mx-auto mb-16 animate-slide-up" style={{animationDelay: '0.3s'}}>
                {/* Glow effect */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-accent-500/30 blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-3 border border-white/10 shadow-premium group hover:border-primary-500/50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder="Search any product... (e.g., iPhone 15 Pro, Sony headphones)"
                          className="w-full pl-14 pr-6 py-5 text-lg bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:shadow-primary-500/50 hover:-translate-y-0.5 active:translate-y-0 group"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                              Analyze
                            </>
                          )}
                        </span>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>100% Unbiased</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Results in 30s</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>92% Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>No Credit Card</span>
                </div>
              </div>

              {error && (
                <div className="mt-8 max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-scale-in">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* RESULTS VIEW */
          <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <button
                      onClick={() => setShowResults(false)}
                      className="text-slate-400 hover:text-white mb-2 flex items-center gap-2 transition-colors"
                    >
                      ← Back to search
                    </button>
                    <h2 className="text-3xl font-bold text-white">
                      Results for "<span className="text-primary-400">{query}</span>"
                    </h2>
                    <p className="text-slate-400 mt-1">
                      {results.length} {results.length === 1 ? 'product' : 'products'} found
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="container mx-auto px-4 py-12">
              {loading ? (
                /* Loading Skeletons */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-dark-800 rounded-3xl p-8 border border-white/10 animate-pulse">
                      <div className="h-8 bg-white/5 rounded-lg w-3/4 mb-4"></div>
                      <div className="h-4 bg-white/5 rounded w-1/2 mb-6"></div>
                      <div className="space-y-3">
                        <div className="h-3 bg-white/5 rounded"></div>
                        <div className="h-3 bg-white/5 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                /* No Results - Build New */
                <div className="max-w-2xl mx-auto text-center py-20">
                  <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center backdrop-blur-xl border border-white/10">
                    <Search className="w-16 h-16 text-primary-400" />
                  </div>
                  
                  <h3 className="text-4xl font-bold text-white mb-4">
                    No Dossier Yet
                  </h3>
                  
                  <p className="text-xl text-slate-400 mb-8 max-w-md mx-auto">
                    We haven't analyzed this product yet.
                    <br />
                    Want us to build a dossier?
                  </p>
                  
                  <button
                    onClick={handleBuildNew}
                    disabled={building}
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white text-lg font-bold px-12 py-6 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-2xl hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0"
                  >
                    {building ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Building Your Dossier...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <span>Build Intelligence Report</span>
                        <span className="text-sm opacity-80">(30-60s)</span>
                      </>
                    )}
                  </button>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-2xl mb-2">🌐</div>
                      <div className="text-sm text-slate-300">Searches web sources</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-2xl mb-2">🧠</div>
                      <div className="text-sm text-slate-300">AI analyzes reviews</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm text-slate-300">Generates scores</div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-400">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Results Grid - PREMIUM */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                  {results.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="group relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl p-8 border border-white/10 hover:border-primary-500/50 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-2 animate-slide-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      {/* Score Badge - TOP RIGHT */}
                      {product.overall_score && (
                        <div className="absolute top-6 right-6 w-24 h-24">
                          <div className="relative w-full h-full">
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
                            {/* Score circle */}
                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 p-0.5">
                              <div className="w-full h-full rounded-full bg-dark-900 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black bg-gradient-to-br from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                                  {product.overall_score}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">SCORE</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="pr-28">
                        {/* Category Badge */}
                        {product.category && (
                          <div className="inline-block px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full mb-4">
                            <span className="text-xs text-primary-400 font-semibold uppercase tracking-wide">
                              {product.category}
                            </span>
                          </div>
                        )}

                        {/* Product Name */}
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors">
                          {product.name}
                        </h3>

                        {/* Summary */}
                        {product.summary && (
                          <p className="text-slate-400 leading-relaxed mb-6 line-clamp-3">
                            {product.summary}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          {product.last_updated && (
                            <span className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              Updated {new Date(product.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {product.status && (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full font-medium">
                              {product.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View Full Button - Appears on Hover */}
                      <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <span className="text-white font-semibold">View Full Intelligence</span>
                          <span className="text-primary-400">→</span>
                        </div>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPagePremium;
