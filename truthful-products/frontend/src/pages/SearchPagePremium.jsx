import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, Shield, Zap, RefreshCw, CheckCircle, AlertCircle, Wifi, Mail } from 'lucide-react';
import { Badge, Button, Card, Input, Skeleton } from '../components/ui';
import { buildProduct } from '../services/api';
import { useToast } from '../components/Toast';
import BuildingAnimation from '../components/BuildingAnimation';

// Smart API URL detection
const getAPIUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname;
  if (hostname === 'www.clearpickai.com' || hostname === 'clearpickai.com') {
    return 'https://10w0d94b94.onrender.com/api';
  }
  if (hostname.includes('vercel.app')) {
    return 'https://10w0d94b94.onrender.com/api';
  }
  return 'http://localhost:3000/api';
};

const API_URL = getAPIUrl();

// Status badge component for server connection
const ServerStatusBadge = ({ status, onRetry }) => {
  if (status === 'ready') {
    return (
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-600 animate-fade-in">
        <CheckCircle className="h-4 w-4" />
        <span>Server connected</span>
      </div>
    );
  }
  if (status === 'waking') {
    return (
      <div className="mt-3 flex flex-col items-center gap-2 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <Wifi className="h-4 w-4 animate-pulse" />
          <span>Connecting to server<span className="animate-pulse">...</span></span>
        </div>
        <p className="text-xs text-slate-400">Free hosting — first load can take up to 30 seconds</p>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="mt-3 flex flex-col items-center gap-2 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>Could not reach server</span>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs font-semibold text-mint-700 hover:text-mint-900 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry connection
        </button>
      </div>
    );
  }
  if (status === 'degraded') {
    return (
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-amber-600 animate-fade-in">
        <AlertCircle className="h-4 w-4" />
        <span>Server up, but database may be unavailable</span>
      </div>
    );
  }
  return null;
};

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
  const [backendStatus, setBackendStatus] = useState('idle'); // idle | waking | ready | degraded | error
  const [stats, setStats] = useState(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const wakeAttemptsRef = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const wakeBackend = useCallback(async () => {
    setBackendStatus((s) => (s === 'ready' ? s : 'waking'));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const resp = await fetch(`${API_URL.replace('/api', '')}/api/health`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      const data = await resp.json().catch(() => null);
      const status = data?.status === 'ok' ? 'ready' : 'degraded';
      setBackendStatus(status);
      wakeAttemptsRef.current = 0;
      return true;
    } catch {
      wakeAttemptsRef.current += 1;
      // Auto-retry up to 3 times with increasing delay
      if (wakeAttemptsRef.current < 3) {
        setBackendStatus('waking');
        await new Promise((r) => setTimeout(r, 5000 * wakeAttemptsRef.current));
        clearTimeout(timeout);
        return wakeBackend();
      }
      setBackendStatus('error');
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  const retryConnection = useCallback(() => {
    wakeAttemptsRef.current = 0;
    wakeBackend();
  }, [wakeBackend]);

  useEffect(() => {
    wakeBackend();
    // Best-effort stats for social proof
    fetch(`${API_URL.replace(/\/$/, '')}/stats`, { method: 'GET' })
      .then((r) => r.json())
      .then((d) => (d?.success ? setStats(d.data) : null))
      .catch(() => null);
  }, [wakeBackend]);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
      .then(() => {
        setWaitlistSubmitted(true);
        setTimeout(() => { setWaitlistSubmitted(false); setWaitlistEmail(''); }, 3000);
      })
      .catch(() => toast.error('Something went wrong. Please try again.'));
  };

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
    const queryToSearch = (typeof searchQuery === 'string' ? searchQuery : '') || query;
    
    if (!queryToSearch || !queryToSearch.trim()) {
      setError('Please enter a product name to search');
      return;
    }
    
    setLoading(true);
    setShowResults(true);
    setError(null);
    setSuggestions([]);
    setDidYouMean(null);

    const doFetch = async () => {
      const url = `${API_URL}/search?q=${encodeURIComponent(queryToSearch.trim())}`;
      const resp = await fetch(url);
      return resp.json();
    };

    try {
      // If backend not ready, wake it first
      if (backendStatus !== 'ready' && backendStatus !== 'degraded') {
        await wakeBackend();
      }
      
      const data = await doFetch();

      if (data.success) {
        setResults(data.products || []);
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setDidYouMean(typeof data.didYouMean === 'string' ? data.didYouMean : null);
        if (backendStatus !== 'ready') setBackendStatus('ready');
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
      }
    } catch {
      // Retry once after waking (cold-start scenario)
      try {
        setBackendStatus('waking');
        await new Promise((r) => setTimeout(r, 5000));
        await wakeBackend();
        const retryData = await doFetch();
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
        setError('Server is waking up — please wait a moment and try again.');
        setBackendStatus('error');
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
              Bought something you regret?
              <br />
              <span className="bg-gradient-to-r from-mint-700 to-cyan-600 bg-clip-text text-transparent">
                Never again.
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Get the truth about any product in <span className="font-semibold text-ink">60 seconds</span> — from real reviews and discussions, not ads.
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
                    onClick={() => handleSearch()}
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

              <ServerStatusBadge status={backendStatus} onRetry={retryConnection} />

              {/* Social proof */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
                <span className="font-semibold text-ink">
                  {stats?.products_analyzed != null ? `${stats.products_analyzed.toLocaleString()} products analyzed` : 'Products analyzed: updating…'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-ink">
                  {stats?.dossiers_ready != null ? `${stats.dossiers_ready.toLocaleString()} dossiers ready` : 'Dossiers ready: updating…'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="italic text-slate-500">"Saved me from buying a lemon."</span>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-mint-100 border border-mint-200 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-mint-700" />
                    </div>
                    <div>
                      <div className="font-bold text-ink">Honest by design</div>
                      <div className="text-sm text-slate-600">Pros & cons with confidence scores.</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-cyan-700" />
                    </div>
                    <div>
                      <div className="font-bold text-ink">Fast results</div>
                      <div className="text-sm text-slate-600">AI analysis in ~30 seconds.</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <div className="font-bold text-ink">Confidence scoring</div>
                      <div className="text-sm text-slate-600">Know when data is strong.</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Waitlist */}
              <Card className="mt-10 p-6 md:p-8 text-center">
                <h2 className="text-xl font-black text-ink mb-1">Get Early Access</h2>
                <p className="text-slate-600 mb-5 text-sm">Join the waitlist — we'll email you when new features drop.</p>
                {!waitlistSubmitted ? (
                  <form
                    name="waitlist"
                    method="POST"
                    data-netlify="true"
                    onSubmit={handleWaitlistSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                  >
                    <input type="hidden" name="form-name" value="waitlist" />
                    <input
                      type="email"
                      name="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 h-11 px-4 rounded-xl border-2 border-border bg-surface text-ink placeholder:text-slate-400 focus:outline-none focus:border-mint-500 focus:ring-4 focus:ring-[color:var(--ring)] transition-all"
                    />
                    <Button type="submit" size="md" leftIcon={<Mail className="h-4 w-4" />}>
                      Join Waitlist
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-mint-700 font-semibold py-2 animate-fade-in">
                    <CheckCircle className="h-5 w-5" />
                    <span>Thanks! You're on the list.</span>
                  </div>
                )}
              </Card>
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

            {/* Error banner */}
            {error && !loading && (
              <Card className="mt-6 p-5 border-red-200 bg-red-50/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-800">{error}</div>
                    <button
                      onClick={() => { setError(null); retryConnection(); handleSearch(query); }}
                      className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-mint-700 hover:text-mint-900 transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Try again
                    </button>
                  </div>
                </div>
              </Card>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <>
                  <div className="col-span-full text-center mb-4">
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-mint-300 border-t-mint-600" />
                      Searching for "{query}"...
                    </div>
                  </div>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-5">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="mt-3 h-4 w-1/2" />
                      <Skeleton className="mt-6 h-24 w-full" />
                    </Card>
                  ))}
                </>
              ) : results.length ? (
                results.map((p) => (
                  <Card key={p.id} className="p-5 cursor-pointer hover:shadow-mint-soft-lg hover:-translate-y-0.5 transition-all duration-200" onClick={() => navigate(`/product/${p.id}`)}>
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
              ) : !error ? (
                <Card className="p-10 col-span-full text-center">
                  {suggestions.length ? (
                    <>
                      <div className="text-2xl font-black text-ink mb-2">Be more specific</div>
                      <div className="text-slate-600 max-w-md mx-auto">
                        We found multiple possible models for "{query}". Pick one to get accurate results:
                      </div>
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
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center">
                          <Search className="h-8 w-8 text-mint-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-ink mb-2">
                        No existing dossier for "{query}"
                      </div>

                      {didYouMean ? (
                        <div className="text-slate-600 mb-4">
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
                        <div className="text-slate-600 max-w-md mx-auto mb-6">
                          We'll scan Reddit discussions and web reviews to build a fresh, unbiased intelligence report — takes about 30 seconds.
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Button
                          size="lg"
                          loading={building}
                          onClick={handleBuildNew}
                          leftIcon={<Sparkles className="h-5 w-5" />}
                          disabled={building}
                        >
                          Build intelligence report
                        </Button>
                      </div>
                      <p className="mt-3 text-xs text-slate-400">Free — powered by AI + real user reviews</p>
                    </>
                  )}
                </Card>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPagePremium;
