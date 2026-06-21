// =============================================================================
// ClearPick.ai — Search Results & Analysis Dashboard (MVP)
// Renders the unsponsored score, pros, cons, quotes, and sources.
// =============================================================================

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Language, translations } from '@/lib/translations';
import FeedbackButton from '@/components/FeedbackButton';

interface AnalysisResponse {
  productName: string;
  unsponsoredScore: number;
  pros: string[];
  cons: string[];
  quotes: string[];
  threads: { title: string; url: string }[];
  commentCount: number;
  lowData: boolean;
  error?: string;
}function SearchDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const langParam = searchParams.get('l') as Language;

  const [lang, setLang] = useState<Language>('en');
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newQuery, setNewQuery] = useState(query);
  const [activeModal, setActiveModal] = useState<null | 'terms' | 'privacy' | 'disclosure'>(null);

  const SUPPORTED_LANGUAGES: Language[] = ['he', 'en', 'ar', 'es', 'ru', 'fr', 'de', 'zh', 'hi'];

  // Sync language with search parameters or localStorage with browser language detection
  useEffect(() => {
    if (SUPPORTED_LANGUAGES.includes(langParam)) {
      setLang(langParam);
      localStorage.setItem('cp_lang', langParam);
    } else {
      const saved = localStorage.getItem('cp_lang') as Language;
      if (SUPPORTED_LANGUAGES.includes(saved)) {
        setLang(saved);
      } else {
        // Automatic browser language detection
        const browserLang = navigator.language.split('-')[0] as Language;
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
          setLang(browserLang);
        } else {
          setLang('en'); // Default fallback to English
        }
      }
    }
    setIsReady(true);
  }, [langParam]);

  const changeLanguage = (next: Language) => {
    setLang(next);
    localStorage.setItem('cp_lang', next);
    // Refresh search with updated language query param
    router.push(`/search?q=${encodeURIComponent(query)}&l=${next}`);
  };

  const fetchAnalysis = async (searchQuery: string, currentLang: Language) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, lang: currentLang }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error ?? 'Failed to analyze product reviews.');
      }

      const result = await response.json();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query && isReady) {
      setNewQuery(query);
      fetchAnalysis(query, lang);
    }
  }, [query, lang, isReady]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newQuery.trim();
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}&l=${lang}`);
    }
  };

  const t = translations[lang];
  const isRTL = lang === 'he' || lang === 'ar';

  // ── Render States ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div 
        className="premium-bg text-on-surface min-h-screen flex flex-col items-center justify-center p-6"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Atmospheric Visuals */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] hero-glow-premium pointer-events-none" />
        <div className="max-w-md w-full glass-panel-premium border-red-500/20 rounded-[2rem] p-8 text-center shadow-2xl relative z-10">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 font-display-lg text-white">{t.analysisFailed}</h2>
          <p className="text-gray-400 text-sm mb-6 font-body-md leading-relaxed">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => fetchAnalysis(query, lang)}
              className="w-full bg-[#F5C842] hover:bg-[#D4A820] text-black font-bold py-4 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(242,202,80,0.3)] transition active:scale-95 cursor-pointer"
            >
              {t.tryAgain}
            </button>
            <Link
              href="/"
              className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 text-center transition cursor-pointer"
            >
              {t.backToHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="premium-bg text-on-surface min-h-screen flex flex-col justify-between font-body-md selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Atmospheric Visuals */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] hero-glow-premium pointer-events-none" />
      <div className="lens-flare-premium top-1/4 left-1/4" />
      <div className="lens-flare-premium bottom-1/4 right-1/4" />

      {/* Header with search bar */}
      <header className="border-b border-white/5 bg-surface-glass backdrop-blur-2xl sticky top-0 z-50 py-4 px-6" dir="ltr">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div 
            onClick={() => router.push('/')}
            className="font-display-lg text-2xl font-extrabold tracking-tighter text-white flex items-center gap-2 group cursor-pointer transition-all"
          >
            <div className="w-8 h-8 bg-[#F5C842] rounded-lg flex items-center justify-center text-black">
              <span className="material-symbols-outlined font-bold text-lg">auto_awesome</span>
            </div>
            ClearPick.ai
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-xs md:max-w-md relative flex items-center bg-black/40 border border-white/10 rounded-full px-4 focus-within:border-primary/50 transition-all duration-300">
              <span className="material-symbols-outlined text-primary/60 text-lg me-2">search</span>
              <input
                type="text"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder={t.searchAnother}
                className="w-full bg-transparent text-white placeholder:text-text-muted/40 py-2.5 text-sm focus:outline-none focus:ring-0 border-none outline-none"
              />
              <button type="submit" className="hidden" />
            </form>

            {/* Language selector */}
            <div className="relative" dir="ltr">
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value as Language)}
                className="appearance-none bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 pl-8 pr-8 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none focus:outline-none focus:ring-0"
              >
                <option value="he" className="bg-[#141418] text-white">עברית</option>
                <option value="en" className="bg-[#141418] text-white">English</option>
                <option value="ar" className="bg-[#141418] text-white">العربية</option>
                <option value="es" className="bg-[#141418] text-white">Español</option>
                <option value="ru" className="bg-[#141418] text-white">Русский</option>
                <option value="fr" className="bg-[#141418] text-white">Français</option>
                <option value="de" className="bg-[#141418] text-white">Deutsch</option>
                <option value="zh" className="bg-[#141418] text-white">简体中文</option>
                <option value="hi" className="bg-[#141418] text-white">हिन्दी</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-gray-400 text-xs">
                🌐
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow relative z-10">
        {loading ? (
          // Loading spinner + pulse animation
          <div className="flex flex-col items-center justify-center py-32 gap-6 relative z-10">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/5 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/20 rounded-full animate-ping" />
            </div>
            <p className="text-on-surface-variant text-base font-medium animate-pulse mt-4 font-body-md text-center max-w-md">
              {t.loadingScan} &ldquo;{query}&rdquo;...
            </p>
          </div>
        ) : (
          data && (
            <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
              {/* Product Info & Low Data Warning */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display-lg text-white">
                    {data.productName}
                  </h1>
                  <p className="text-on-surface-variant text-xs sm:text-sm mt-1">
                    {data.commentCount === 0
                      ? t.remarksFallback
                      : t.remarksCount.replace('{count}', String(data.commentCount)).replace('{threads}', String(data.threads.length))}
                  </p>
                </div>
                {data.commentCount === 0 ? (
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold self-start sm:self-center">
                    🤖 {t.aiConsensus}
                  </div>
                ) : data.lowData ? (
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 text-[#f2ca50] border border-amber-500/20 rounded-full px-4 py-1.5 text-xs font-semibold self-start sm:self-center">
                    ⚠️ {t.lowDataWarning}
                  </div>
                ) : null}
              </div>

              {/* Grid: Left: Score circle / warning, Right: Pros & Cons */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="glass-panel-premium rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group border-white/5">
                  {/* Subtle hover background highlight */}
                  <div className="absolute inset-0 bg-radial-gradient from-[rgba(242,202,80,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

                  <h3 className="text-on-surface-variant text-xs uppercase font-bold tracking-wider mb-4">
                    {t.unsponsoredScore}
                  </h3>

                  {data.commentCount === 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center mb-4">
                        {/* Radial Progress Ring */}
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            stroke="#f2ca50"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 54}
                            strokeDashoffset={2 * Math.PI * 54 * (1 - data.unsponsoredScore / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        {/* Score display inside circle */}
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-3xl font-extrabold text-white leading-none">
                            {data.unsponsoredScore}%
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">
                            {t.unbiasedLabel}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-[220px] text-center mb-4">
                        {t.aiConsensusDesc}
                      </p>
                    </div>
                  ) : data.lowData ? (
                    <div className="py-6 flex flex-col items-center">
                      <div className="text-amber-500 text-3xl mb-2">🤷‍♂️</div>
                      <span className="text-[#f2ca50] text-xl font-bold">N/A</span>
                      <p className="text-xs text-on-surface-variant max-w-[200px] mt-2 leading-relaxed mb-4">
                        {t.lowDataDesc}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center mb-4">
                        {/* Radial Progress Ring */}
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            stroke="#f2ca50"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 54}
                            strokeDashoffset={2 * Math.PI * 54 * (1 - data.unsponsoredScore / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        {/* Score display inside circle */}
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-3xl font-extrabold text-white leading-none">
                            {data.unsponsoredScore}%
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">
                            {t.unbiasedLabel}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-[220px] text-center mb-4">
                        {t.scoreDesc}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pros and Cons Card */}
                <div className="lg:col-span-2 glass-panel-premium rounded-[2rem] p-6 shadow-lg flex flex-col justify-between border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Pros column */}
                    <div>
                      <h3 className="text-emerald-400 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 font-display-lg">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs">✓</span>
                        {t.prosTitle}
                      </h3>
                      {data.pros.length > 0 ? (
                        <ul className="space-y-3">
                          {data.pros.map((pro, index) => (
                            <li key={index} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2.5">
                              <span className="text-emerald-500 mt-1 select-none">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-xs italic">{t.noPros}</p>
                      )}
                    </div>

                    {/* Cons column */}
                    <div>
                      <h3 className="text-rose-400 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 font-display-lg">
                        <span className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-xs">✗</span>
                        {t.consTitle}
                      </h3>
                      {data.cons.length > 0 ? (
                        <ul className="space-y-3">
                          {data.cons.map((con, index) => (
                            <li key={index} className="text-gray-300 text-sm leading-relaxed flex items-start gap-2.5">
                              <span className="text-rose-500 mt-1 select-none">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-xs italic">{t.noCons}</p>
                      )}
                    </div>
                  </div>

                  {/* Best Deal Finder Widget */}
                  <div className="border-t border-white/5 mt-6 pt-6 flex flex-col gap-4">
                    <h4 className="text-on-surface-variant font-extrabold text-xs uppercase tracking-wider">
                      {t.bestDealTitle}
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={`https://www.amazon.com/s?k=${encodeURIComponent(data.productName)}&tag=clearpick07-20`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-[#F5C842] hover:bg-[#D4A820] hover:shadow-[0_0_20px_rgba(242,202,80,0.3)] hover:scale-[1.01] active:scale-95 text-black font-bold text-sm px-6 py-3 rounded-xl transition duration-300 sm:flex-1 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {t.checkAmazon}
                      </a>
                      <a
                        href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(data.productName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white text-gray-300 font-bold text-sm px-6 py-3 rounded-xl transition active:scale-95 sm:flex-1 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {t.compareOther}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quotes Section (Unfiltered Voices) */}
              <div className="glass-panel-premium rounded-[2rem] p-6 shadow-lg border-white/5">
                <h3 className="text-primary font-extrabold text-sm uppercase tracking-wider mb-4 font-display-lg">
                  {t.quotesTitle}
                </h3>
                {data.quotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.quotes.map((quote, idx) => (
                      <div
                        key={idx}
                        className="bg-white/[0.02] border border-white/5 hover:border-primary/20 rounded-2xl p-5 flex flex-col justify-between gap-3 relative transition-all duration-300"
                      >
                        <span className="text-2xl text-white/10 absolute top-2 left-2 leading-none font-serif select-none">&ldquo;</span>
                        <p className="text-gray-300 text-sm italic relative z-10 leading-relaxed pt-2 pl-2">
                          {quote}
                        </p>
                        <div className="text-[10px] text-gray-500 self-end font-semibold uppercase tracking-wider">
                          {t.redditUser}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs italic">{t.noQuotes}</p>
                )}
              </div>

              {/* Source Threads */}
              <div className="glass-panel-premium rounded-[2rem] p-6 shadow-lg border-white/5">
                <h3 className="text-on-surface-variant font-extrabold text-xs uppercase tracking-wider mb-3">
                  {t.sourcesTitle}
                </h3>
                {data.threads.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.threads.map((thread, index) => (
                      <a
                        key={index}
                        href={thread.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 text-xs text-gray-300 hover:text-primary rounded-xl px-4 py-2.5 transition duration-300"
                      >
                        <span>{thread.title.length > 40 ? `${thread.title.slice(0, 40)}...` : thread.title}</span>
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs italic">{t.noSources}</p>
                )}
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="w-full pt-20 pb-20 border-t border-white/5 bg-surface-container-lowest" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 md:px-12 gap-12 w-full max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-6">
            <div className="font-display-lg text-2xl font-extrabold text-white tracking-tighter">ClearPick.ai</div>
            <p className="text-text-muted font-body-md text-sm max-w-md opacity-60">
              © {new Date().getFullYear()} ClearPick.ai. {lang === 'he' ? 'מודיעין מוצרים המופק מקונסנזוס אנושי אותנטי. הדור הבא של צרכנות מבוססת אמת.' : 'Product intelligence extracted from authentic human consensus. The next generation of truth-based consumerism.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <button type="button" onClick={() => setActiveModal('privacy')} className="text-text-muted font-label-caps text-[11px] tracking-widest hover:text-primary transition-colors uppercase cursor-pointer">{t.privacy}</button>
            <button type="button" onClick={() => setActiveModal('terms')} className="text-text-muted font-label-caps text-[11px] tracking-widest hover:text-primary transition-colors uppercase cursor-pointer">{t.terms}</button>
            <button type="button" onClick={() => setActiveModal('disclosure')} className="text-text-muted font-label-caps text-[11px] tracking-widest hover:text-primary transition-colors uppercase cursor-pointer">{t.disclosure}</button>
            <FeedbackButton lang={lang} variant="footer" />
          </div>
        </div>
      </footer>

      {/* Modals for legal disclosures */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative text-right" dir={isRTL ? 'rtl' : 'ltr'}>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-lg cursor-pointer min-w-0 min-h-0 p-1"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-[#f2ca50] mb-4">
              {activeModal === 'terms' && t.terms}
              {activeModal === 'privacy' && t.privacy}
              {activeModal === 'disclosure' && t.disclosure}
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {activeModal === 'terms' && t.termsBody}
              {activeModal === 'privacy' && t.privacyBody}
              {activeModal === 'disclosure' && t.disclosureBody}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="cp-page min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
          <div className="cp-noise" aria-hidden="true" />
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/5 border-t-[#F5C842] rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium animate-pulse">
              Loading ClearPick dashboard... / טוען דשבורד ClearPick...
            </p>
          </div>
        </div>
      }
    >
      <SearchDashboardContent />
    </Suspense>
  );
}
