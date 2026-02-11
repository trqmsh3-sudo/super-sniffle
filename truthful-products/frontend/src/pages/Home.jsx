import React, { useEffect, useMemo, useState } from 'react';
import { Mail, CheckCircle, Sparkles, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { Button, Card } from '../components/ui';

// Smart API URL detection (keep in sync with SearchPagePremium and api.js)
const getAPIUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  if (hostname === 'www.clearpickai.com' || hostname === 'clearpickai.com' || hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
    return 'https://10w0d94b94.onrender.com/api';
  }
  return 'http://localhost:3000/api';
};
const API_URL = getAPIUrl();

const Home = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [heroQuery, setHeroQuery] = useState('');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const popular = useMemo(() => (['iPhone 15', 'Dyson V15', 'Sony WH-1000XM5']), []);

  useEffect(() => {
    // Best-effort stats for social proof
    fetch(`${API_URL.replace(/\/$/, '')}/stats`, { method: 'GET' })
      .then((r) => r.json())
      .then((d) => (d?.success ? setStats(d.data) : null))
      .catch(() => null);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Netlify Forms will handle the submission automatically
    const formData = new FormData(e.target);
    
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    .then(() => {
      console.log('Form submitted successfully');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    })
    .catch((error) => {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again.');
    });
  };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-mint-50 to-white" />
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-mint-200/40 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-cyan-200/35 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Logo size="large" />
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-mint-800 shadow-card">
                <Sparkles className="h-4 w-4 text-mint-600" />
                Real reviews. No marketing BS.
              </div>

              <h1 className="mt-6 text-5xl md:text-6xl font-black tracking-tight text-ink">
                Bought something you regret?
                <br />
                <span className="bg-gradient-to-r from-mint-700 to-cyan-600 bg-clip-text text-transparent">
                  Never again.
                </span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                Get the truth about any product in <span className="font-semibold text-ink">60 seconds</span> —
                from real reviews and discussions, not ads.
              </p>

              {/* Hero search (direct, aggressive CTA) */}
              <div className="mt-10 max-w-3xl mx-auto">
                <Card className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row gap-3 items-stretch">
                    <div className="flex-1">
                      <label className="block">
                        <div className="relative flex items-center rounded-2xl border-2 border-border bg-surface px-4 transition-all duration-200 focus-within:border-mint-500 focus-within:ring-4 focus-within:ring-[color:var(--ring)]">
                          <div className="mr-3 text-mint-600">
                            <Search className="h-5 w-5" />
                          </div>
                          <input
                            value={heroQuery}
                            onChange={(e) => setHeroQuery(e.target.value)}
                            placeholder="Search any product… (e.g., iPhone 15, Dyson V15)"
                            className="h-12 w-full bg-transparent text-ink placeholder:text-slate-400 focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${encodeURIComponent(heroQuery)}`)}
                          />
                        </div>
                      </label>
                    </div>
                    <Button
                      size="lg"
                      className="md:w-48"
                      leftIcon={<Sparkles className="h-5 w-5" />}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(heroQuery)}`)}
                    >
                      Analyze
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="text-sm text-slate-500 mr-2">Popular:</span>
                    {popular.map((q) => (
                      <button
                        key={q}
                        onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
                        className="text-sm font-semibold text-mint-800 bg-mint-50 border border-mint-100 rounded-full px-3 py-1 hover:bg-mint-100 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Social proof */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
                <span className="font-semibold text-ink">
                  {stats?.products_analyzed != null ? `${stats.products_analyzed.toLocaleString()} products analyzed` : 'Products analyzed: updating…'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-ink">
                  {stats?.dossiers_ready != null ? `${stats.dossiers_ready.toLocaleString()} dossiers ready` : 'Dossiers ready: updating…'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="italic">“Saved me from buying a lemon.”</span>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="text-3xl mb-4">🧠</div>
                <h3 className="text-lg font-bold text-ink mb-2">Honest by design</h3>
                <p className="text-slate-600 text-sm">We surface both pros and cons, with confidence and sources.</p>
              </Card>
              <Card className="p-6">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-bold text-ink mb-2">Fast results</h3>
                <p className="text-slate-600 text-sm">Caching + smooth loading states for a "butter" experience.</p>
              </Card>
              <Card className="p-6">
                <div className="text-3xl mb-4">🛡️</div>
                <h3 className="text-lg font-bold text-ink mb-2">Confidence scoring</h3>
                <p className="text-slate-600 text-sm">Know when data is strong and when it's still early.</p>
              </Card>
            </div>

            <div className="mt-14">
              <Card className="p-8">
                <h2 className="text-2xl font-black text-ink mb-2">Get Early Access</h2>
                <p className="text-slate-600 mb-6">
                  Join the waitlist — we’ll email you when it’s ready.
                </p>

          {!submitted ? (
            <form 
              name="waitlist" 
              method="POST" 
              data-netlify="true"
              onSubmit={handleSubmit} 
              className="flex flex-col sm:flex-row gap-3"
            >
              <input type="hidden" name="form-name" value="waitlist" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 input-field"
              />
              <button
                type="submit"
                className="btn-primary h-12 px-6"
              >
                <Mail size={20} className="transition-transform duration-300 group-hover:scale-110" />
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 text-mint-700 text-lg font-semibold py-4">
              <CheckCircle size={24} className="animate-[successPop_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_0.2s_backwards]" />
              <span>Thanks! You're on the list!</span>
            </div>
          )}
          </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
