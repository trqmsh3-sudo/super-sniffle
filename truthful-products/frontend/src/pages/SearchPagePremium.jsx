import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { Badge, Button, Card, Input, Skeleton } from '../components/ui';
import { buildProduct } from '../services/api';
import { useToast } from '../components/Toast';
import BuildingAnimation from '../components/BuildingAnimation';

// Smart API URL detection
const getAPIUrl = () => {
  // If explicitly set in env, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on hostname
  const hostname = window.location.hostname;
  if (hostname === 'www.clearpickai.com' || hostname === 'clearpickai.com') {
    return 'https://10w0d94b94.onrender.com/api';
  }
  if (hostname.includes('vercel.app')) {
    return 'https://10w0d94b94.onrender.com/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:3000/api';
};

const API_URL = getAPIUrl();

const SearchPagePremium = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [didYouMean, setDidYouMean] = useState(null);
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [buildingProduct, setBuildingProduct] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('idle'); // idle | waking | ready | degraded
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const wakeBackend = async () => {
    setBackendStatus((s) => (s === 'ready' ? s : 'waking'));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const resp = await fetch(`${API_URL.replace('/api', '')}/api/health`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      const data = await resp.json().catch(() => null);
      setBackendStatus(data?.status === 'ok' ? 'ready' : 'degraded');
      return true;
    } catch {
      // Render free tier may be sleeping; keep UI in "waking"
      setBackendStatus('waking');
      return false;
    } finally {
      clearTimeout(timeout);
    }
  };

  useEffect(() => {
    // Wake Render (free tier can sleep; first request may take ~30s).
    wakeBackend();
  }, []);

  useEffect(() => {
    // Allow deep-link: /search?q=...
    const q = new URLSearchParams(location.search).get('q');
    if (q && typeof q === 'string' && q.trim()) {
      setQuery(q);
      setError(null);
      // Auto-search once - pass q directly to avoid race condition
      handleSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleSearch = async (searchQuery = null) => {
    // Use provided query or fallback to state
    const queryToSearch = searchQuery || query;
    
    // Ensure queryToSearch is a string before calling trim
    if (!queryToSearch || typeof queryToSearch !== 'string' || !queryToSearch.trim()) {
      setError('Please enter a product name to search');
      return;
    }
    
    setLoading(true);
    setShowResults(true);
    setError(null);
    setSuggestions([]);
    setDidYouMean(null);
    
    try {
      if (backendStatus !== 'ready') {
        await wakeBackend();
      }
      
      const url = `${API_URL}/search?q=${encodeURIComponent(queryToSearch)}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setResults(data.products || []);
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setDidYouMean(typeof data.didYouMean === 'string' ? data.didYouMean : null);
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      // Retry once after a short delay (common on cold start)
      try {
        setBackendStatus('waking');
        await new Promise((r) => setTimeout(r, 8000));
        await wakeBackend();
        const retryResp = await fetch(`${API_URL}/search?q=${encodeURIComponent(queryToSearch)}`);
        const retryData = await retryResp.json();
        if (retryData.success) {
          setResults(retryData.products || []);
          setSuggestions(Array.isArray(retryData.suggestions) ? retryData.suggestions : []);
          setDidYouMean(typeof retryData.didYouMean === 'string' ? retryData.didYouMean : null);
          setError(null);
        } else {
          setError(retryData.error || 'Search failed');
          setResults([]);
        }
      } catch {
        setError('Unable to connect to server');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuildNew = async () => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      toast.error('אנא הכנס שם מוצר');
      return;
    }
    
    setBuilding(true);
    setBuildingProduct(query);
    setError(null);
    
    try {
      // Show building animation and call SimpleDossierBuilder
      const result = await buildProduct(query, 'general');
      
      if (result.success) {
        // Success!
        toast.success('✅ ניתוח הושלם בהצלחה!');
        
        // Navigate to dossier page
        setTimeout(() => {
          navigate(`/dossier/${result.productId}`);
        }, 500);
      } else {
        toast.error(result.error || 'שגיאה בבניית התיק');
        setBuilding(false);
      }
    } catch (err) {
      console.error('Build error:', err);
      toast.error(`❌ שגיאה: ${err.message || 'לא הצלחנו לבנות את התיק'}`);
      setBuilding(false);
    }
  };

  const exampleQueries = useMemo(() => (['iPhone 15', 'AirPods Pro 2', 'Dyson V15', 'Sony WH-1000XM5']), []);

  // Show BuildingAnimation while building dossier
  if (building) {
    return <BuildingAnimation productName={buildingProduct} estimatedTime={30} />;
  }

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-mint-50 to-white" />
      <div className="absolute -z-10 -top-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-mint-200/35 blur-3xl" />
      <div className="absolute -z-10 -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {!showResults ? (
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <Badge variant="mint">Live web reviews • confidence scoring</Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-ink">
              Find Products
              <br />
              <span className="bg-gradient-to-r from-mint-700 to-cyan-600 bg-clip-text text-transparent">
                You Can Trust
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Search any product and get a clean, honest dossier from real reviews: scores, pros/cons, and common failures.
            </p>

            <div className="mt-10 max-w-3xl mx-auto">
              <Card className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-3 items-stretch">
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Search any product… (e.g., iPhone 15 Pro, Sony headphones)"
                    leftIcon={<Search className="h-5 w-5" />}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    error={error}
                  />
                  <Button
                    className="md:w-48"
                    size="lg"
                    loading={loading}
                    leftIcon={<Sparkles className="h-5 w-5" />}
                    onClick={handleSearch}
                  >
                    Analyze
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="text-sm text-slate-500 mr-2">Try:</span>
                  {exampleQueries.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuery(q);
                        setError(null);
                        handleSearch(q);
                      }}
                      className="text-sm font-semibold text-mint-800 bg-mint-50 border border-mint-100 rounded-full px-3 py-1 hover:bg-mint-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </Card>

              {(backendStatus === 'waking' || backendStatus === 'degraded') && (
                <p className="mt-4 text-sm text-slate-500">
                  {backendStatus === 'waking'
                    ? 'Waking the server… first request can take ~30s on free hosting.'
                    : 'Server is up, but database may be unavailable (degraded mode).'}
                </p>
              )}

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-mint-100 border border-mint-200 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-mint-700" />
                    </div>
                    <div>
                      <div className="font-bold text-ink">Unbiased</div>
                      <div className="text-sm text-slate-600">Pros & cons, always.</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-cyan-700" />
                    </div>
                    <div>
                      <div className="font-bold text-ink">Fast</div>
                      <div className="text-sm text-slate-600">Smooth loading states.</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <div className="font-bold text-ink">Clear scores</div>
                      <div className="text-sm text-slate-600">Confidence included.</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-sm font-semibold text-slate-600 hover:text-mint-700"
                >
                  ← Back to search
                </button>
                <h2 className="mt-2 text-3xl font-black text-ink">Results</h2>
                <p className="text-slate-600">for <span className="font-semibold text-ink">{query}</span></p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowResults(false)}>New search</Button>
                <Button
                  loading={building}
                  onClick={handleBuildNew}
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  disabled={building || (suggestions.length > 0)}
                  title={suggestions.length > 0 ? 'Pick a model first' : undefined}
                >
                  Build intelligence report
                </Button>
              </div>
            </div>

            {(didYouMean || suggestions.length > 0) && (
              <Card className="mt-6 p-6">
                <div className="font-black text-ink">Refine your query</div>
                {didYouMean ? (
                  <div className="mt-1 text-slate-600">
                    Did you mean{' '}
                    <button
                      className="font-semibold text-mint-800 underline underline-offset-4"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(didYouMean)}`)}
                      type="button"
                    >
                      {didYouMean}
                    </button>
                    ?
                  </div>
                ) : null}

                {suggestions.length > 0 ? (
                  <>
                    <div className="mt-2 text-slate-600">
                      “{query}” is too broad. Pick an exact model to get accurate results:
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestions.slice(0, 8).map((s) => (
                        <button
                          key={s}
                          onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                          className="text-sm font-semibold text-mint-800 bg-mint-50 border border-mint-100 rounded-full px-3 py-1 hover:bg-mint-100 transition-colors"
                          type="button"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </Card>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="mt-3 h-4 w-1/2" />
                    <Skeleton className="mt-6 h-24 w-full" />
                  </Card>
                ))
              ) : results.length ? (
                results.map((p) => (
                  <Card key={p.id} className="p-5 cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-ink">{p.name}</div>
                        <div className="mt-1">
                          <Badge variant="neutral">{p.category || 'general'}</Badge>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-mint-600 to-cyan-500 text-white flex items-center justify-center font-black shadow-mint-soft">
                        {p.overall_score ?? '—'}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-600 line-clamp-3">{p.summary || 'No summary yet.'}</div>
                    <div className="mt-4 text-sm font-semibold text-mint-800">View dossier →</div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 col-span-full text-center">
                  <div className="text-2xl font-black text-ink mb-2">
                    {suggestions.length ? 'Be more specific' : 'No products found'}
                  </div>

                  {didYouMean ? (
                    <div className="text-slate-600">
                      Did you mean{' '}
                      <button
                        className="font-semibold text-mint-800 underline underline-offset-4"
                        onClick={() => navigate(`/search?q=${encodeURIComponent(didYouMean)}`)}
                        type="button"
                      >
                        {didYouMean}
                      </button>
                      ?
                    </div>
                  ) : (
                    <div className="text-slate-600">
                      {suggestions.length
                        ? 'We found multiple possible models. Pick one to get accurate results:'
                        : 'Want us to build a dossier from web reviews?'}
                    </div>
                  )}

                  {suggestions.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2 justify-center">
                      {suggestions.slice(0, 8).map((s) => (
                        <button
                          key={s}
                          onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                          className="text-sm font-semibold text-mint-800 bg-mint-50 border border-mint-100 rounded-full px-3 py-1 hover:bg-mint-100 transition-colors"
                          type="button"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex justify-center">
                    <Button
                      loading={building}
                      onClick={handleBuildNew}
                      leftIcon={<Sparkles className="h-5 w-5" />}
                      disabled={building || (suggestions.length > 0)}
                      title={suggestions.length > 0 ? 'Pick a model first' : undefined}
                    >
                      Build intelligence report
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPagePremium;
