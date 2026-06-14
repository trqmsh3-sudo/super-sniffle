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
}

function SearchDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const langParam = searchParams.get('l') as Language;

  const [lang, setLang] = useState<Language>('he');
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newQuery, setNewQuery] = useState(query);

  const SUPPORTED_LANGUAGES: Language[] = ['he', 'en', 'ar', 'es', 'ru', 'fr', 'de', 'zh', 'hi'];

  // Sync language with search parameters or localStorage
  useEffect(() => {
    if (SUPPORTED_LANGUAGES.includes(langParam)) {
      setLang(langParam);
      localStorage.setItem('cp_lang', langParam);
    } else {
      const saved = localStorage.getItem('cp_lang') as Language;
      if (SUPPORTED_LANGUAGES.includes(saved)) {
        setLang(saved);
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

  // ── Render States ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div 
        className="cp-page min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6"
        dir={lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="cp-noise" aria-hidden="true" />
        <div className="max-w-md w-full bg-[#141418] border border-red-500/20 rounded-2xl p-8 text-center shadow-xl">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">{t.analysisFailed}</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => fetchAnalysis(query, lang)}
              className="w-full bg-[#F5C842] text-black font-semibold py-3 rounded-xl hover:bg-amber-400 active:scale-95 transition"
            >
              {t.tryAgain}
            </button>
            <Link
              href="/"
              className="w-full bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/10 text-center"
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
      className="cp-page min-h-screen bg-[#0A0A0F] text-white flex flex-col justify-between"
      dir={lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="cp-noise" aria-hidden="true" />

      {/* Header with search bar */}
      <header className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white font-heading">
              Clear<span className="text-[#F5C842]">Pick</span><span className="text-gray-600 text-xs">.ai</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-xs md:max-w-md relative flex items-center bg-[#141418] border border-white/10 rounded-xl overflow-hidden px-3">
              <div className="text-gray-500 me-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder={t.searchAnother}
                className="w-full bg-transparent text-white placeholder-gray-500 py-3 text-sm focus:outline-none focus:ring-0"
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
      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1">
        {loading ? (
          // Loading spinner + pulse animation
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/5 border-t-[#F5C842] rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#F5C842]/20 rounded-full animate-ping" />
            </div>
            <p className="text-gray-400 text-sm font-medium animate-pulse mt-4">
              {t.loadingScan} &ldquo;{query}&rdquo;...
            </p>
          </div>
        ) : (
          data && (
            <div className="space-y-6 animate-[cp-rise_0.6s_ease-out]">
              {/* Product Info & Low Data Warning */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                    {data.productName}
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    {data.commentCount === 0
                      ? t.remarksFallback
                      : t.remarksCount.replace('{count}', String(data.commentCount)).replace('{threads}', String(data.threads.length))}
                  </p>
                </div>
                {data.commentCount === 0 ? (
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg px-3 py-1.5 text-xs font-semibold self-start sm:self-center">
                    🤖 {t.aiConsensus}
                  </div>
                ) : data.lowData ? (
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 text-[#F5C842] border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs font-semibold self-start sm:self-center">
                    ⚠️ {t.lowDataWarning}
                  </div>
                ) : null}
              </div>

              {/* Grid: Left: Score circle / warning, Right: Pros & Cons */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group">
                  {/* Subtle hover background highlight */}
                  <div className="absolute inset-0 bg-radial-gradient from-[rgba(245,200,66,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

                  <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-4">
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
                            stroke="#F5C842"
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
                      <p className="text-[11px] text-gray-500 leading-relaxed max-w-[220px] text-center mb-4">
                        {t.aiConsensusDesc}
                      </p>
                    </div>
                  ) : data.lowData ? (
                    <div className="py-6 flex flex-col items-center">
                      <div className="text-amber-500 text-3xl mb-2">🤷‍♂️</div>
                      <span className="text-[#F5C842] text-xl font-bold">N/A</span>
                      <p className="text-xs text-gray-500 max-w-[200px] mt-2 leading-relaxed mb-4">
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
                            stroke="#F5C842"
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
                      <p className="text-[11px] text-gray-500 leading-relaxed max-w-[220px] text-center mb-4">
                        {t.scoreDesc}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pros and Cons Card */}
                <div className="lg:col-span-2 bg-[#141418] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Pros column */}
                    <div>
                      <h3 className="text-emerald-400 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
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
                      <h3 className="text-rose-400 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
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
                    <h4 className="text-gray-400 font-extrabold text-xs uppercase tracking-wider">
                      {t.bestDealTitle}
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={`https://www.amazon.com/s?k=${encodeURIComponent(data.productName)}&tag=clearpick07-20`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-[#F5C842] hover:bg-amber-400 active:scale-95 text-black font-bold text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-amber-500/5 sm:flex-1"
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
                        className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white text-gray-300 font-bold text-sm px-6 py-3 rounded-xl transition active:scale-95 sm:flex-1"
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
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 shadow-lg">
                <h3 className="text-[#F5C842] font-extrabold text-sm uppercase tracking-wider mb-4">
                  {t.quotesTitle}
                </h3>
                {data.quotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.quotes.map((quote, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1C1C22]/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3 relative"
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
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 shadow-lg">
                <h3 className="text-gray-400 font-extrabold text-xs uppercase tracking-wider mb-3">
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
                        className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-gray-300 rounded-lg px-3.5 py-2 transition"
                      >
                        <span>{thread.title.length > 40 ? `${thread.title.slice(0, 40)}...` : thread.title}</span>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Feedback trigger button above footer */}
      <FeedbackButton lang={lang} />

      {/* Footer */}
      <footer className="z-10 text-xs text-gray-600 w-full text-center border-t border-white/5 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-6xl mx-auto px-6">
        <p>© {new Date().getFullYear()} ClearPick.ai. {t.footerAllRights}</p>
        <div className="flex flex-wrap justify-center gap-4 text-gray-500">
          <a href="mailto:clearpick.ai@gmail.com?subject=Feedback%20for%20ClearPick.ai" className="hover:text-[#F5C842] transition cursor-pointer">{t.feedback}</a>
        </div>
        <div className="flex gap-4">
          <span className="text-[#F5C842] font-semibold">{t.footerUnsponsored}</span>
          <span className="text-gray-600">|</span>
          <span>{t.footerPowered}</span>
        </div>
      </footer>
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
