// =============================================================================
// ClearPick.ai — Homepage (Localized & Corporate-Grade MVP)
// Centered layout with RTL/LTR support, translation switcher, and legal modals
// =============================================================================

'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Language, translations } from '@/lib/translations';
import FeedbackButton from '@/components/FeedbackButton';

const SUPPORTED_LANGUAGES: Language[] = ['he', 'en', 'ar', 'es', 'ru', 'fr', 'de', 'zh', 'hi'];

const formatTitle = (titleText: string) => {
  const highlights = [
    'unbiased',
    'בלתי ממומנת',
    'הבלתי ממומנת',
    'غير المحايدة',
    'غير متحيزة',
    'imparcial',
    'непредвзятую',
    'impartiale',
    'unvoreingenommene',
    '客观',
    'निष्पक्ष'
  ];
  
  let matchedWord = '';
  for (const word of highlights) {
    if (titleText.toLowerCase().includes(word.toLowerCase())) {
      matchedWord = word;
      break;
    }
  }

  if (!matchedWord) return titleText;

  const parts = titleText.split(new RegExp(`(${matchedWord})`, 'i'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === matchedWord.toLowerCase() ? (
          <em key={i} className="text-[#F5C842] not-italic">{part}</em>
        ) : (
          part
        )
      )}
    </>
  );
};

function HomeContent() {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<Language>('he');
  const [activeModal, setActiveModal] = useState<null | 'terms' | 'privacy' | 'disclosure' | 'feedback'>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const langParam = searchParams.get('l') as Language;

  // Load language preference
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
  }, [langParam]);

  const changeLanguage = (next: Language) => {
    setLang(next);
    localStorage.setItem('cp_lang', next);
    // Refresh page with updated language query param
    router.push(`/?l=${next}`);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}&l=${lang}`);
    }
  };

  const t = translations[lang];

  return (
    <div 
      className="cp-page min-h-screen flex flex-col justify-between items-center px-6 py-12 select-none relative overflow-x-hidden"
      dir={lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Film grain texture */}
      <div className="cp-noise" aria-hidden="true" />

      {/* Dynamic gold background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-radial-gradient from-[rgba(245,200,66,0.08)] via-[rgba(245,200,66,0.02)] to-transparent pointer-events-none z-0" />

      {/* Header Accent / Brand (Centered layout but balanced with language toggle) */}
      <header className="z-10 w-full max-w-4xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white font-heading">
            Clear<span className="text-[#F5C842]">Pick</span><span className="text-gray-600 text-sm">.ai</span>
          </span>
          <span className="bg-amber-500/10 text-[#F5C842] border border-amber-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
            POC v1.0
          </span>
        </div>
        
        {/* Language selector */}
        <div className="relative" dir="ltr">
          <select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value as Language)}
            className="appearance-none bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 pl-8 pr-8 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none focus:outline-none focus:ring-0"
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
      </header>

      {/* Main Hero Search Container */}
      <main className="z-10 w-full max-w-2xl text-center mt-20 mb-16 flex flex-col items-center">
        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-gray-400 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#F5C842] animate-pulse" />
          {t.statusIndicator}
        </div>

        {/* Big headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 font-heading">
          {formatTitle(t.title)}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-[#F5C842] rounded-2xl blur opacity-30 group-hover:opacity-40 transition duration-300" />
          <div className="relative flex items-center bg-[#141418] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-2 ps-4">
            {/* Search icon */}
            <div className="text-gray-500 flex-shrink-0 me-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent text-white placeholder-gray-500 py-3 text-base focus:outline-none focus:ring-0 min-w-0"
              autoFocus
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={query.trim().length < 2}
              className="bg-[#F5C842] text-black font-semibold rounded-xl px-6 py-3 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-[#F5C842] transition active:scale-95 flex-shrink-0 ms-2"
            >
              {t.search}
            </button>
          </div>
        </form>

        {/* Quick Suggestion links */}
        <div className="mt-5 text-xs text-gray-500 flex flex-wrap justify-center gap-2">
          <span>{t.trySuggest}</span>
          <button onClick={() => setQuery('PlayStation 5 Pro')} className="text-gray-400 hover:text-[#F5C842] underline decoration-dotted cursor-pointer">PlayStation 5 Pro</button>
          <span>•</span>
          <button onClick={() => setQuery('Apple Vision Pro')} className="text-gray-400 hover:text-[#F5C842] underline decoration-dotted cursor-pointer">Apple Vision Pro</button>
          <span>•</span>
          <button onClick={() => setQuery('JBL Go 5')} className="text-gray-400 hover:text-[#F5C842] underline decoration-dotted cursor-pointer">JBL Go 5</button>
        </div>
      </main>

      {/* Why ClearPick? Section (Corporate Standard Value Proposition) */}
      <section className="z-10 w-full max-w-4xl mt-12 border-t border-white/5 pt-16 pb-8">
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-[#F5C842] mb-12">
          {t.whyTitle}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 100% Unsponsored */}
          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(245,200,66,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
            <div className="text-2xl mb-4 text-[#F5C842]">🔒</div>
            <h3 className="text-white font-extrabold text-base mb-2">{t.why1Title}</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t.why1Desc}
            </p>
          </div>

          {/* Card 2: AI Consensus */}
          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(245,200,66,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
            <div className="text-2xl mb-4 text-[#F5C842]">🤖</div>
            <h3 className="text-white font-extrabold text-base mb-2">{t.why2Title}</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t.why2Desc}
            </p>
          </div>

          {/* Card 3: Price Transparency */}
          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(245,200,66,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
            <div className="text-2xl mb-4 text-[#F5C842]">🛍️</div>
            <h3 className="text-white font-extrabold text-base mb-2">{t.why3Title}</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t.why3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Feedback trigger button above footer */}
      <FeedbackButton lang={lang} />

      {/* Footer with corporate disclosures */}
      <footer className="z-10 text-xs text-gray-600 w-full text-center border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 max-w-4xl mt-12">
        <p>© {new Date().getFullYear()} ClearPick.ai. {t.footerAllRights}</p>
        <div className="flex flex-wrap justify-center gap-4 text-gray-500">
          <button onClick={() => setActiveModal('terms')} className="hover:text-[#F5C842] transition cursor-pointer">{t.terms}</button>
          <span>•</span>
          <button onClick={() => setActiveModal('privacy')} className="hover:text-[#F5C842] transition cursor-pointer">{t.privacy}</button>
          <span>•</span>
          <button onClick={() => setActiveModal('disclosure')} className="hover:text-[#F5C842] transition cursor-pointer">{t.disclosure}</button>
          <span>•</span>
          <a href="mailto:clearpick.ai@gmail.com?subject=Feedback%20for%20ClearPick.ai" className="hover:text-[#F5C842] transition cursor-pointer">{t.feedback}</a>
        </div>
        <div className="flex gap-4">
          <span className="text-[#F5C842] font-semibold">{t.footerUnsponsored}</span>
          <span className="text-gray-600">|</span>
          <span>{t.footerPowered}</span>
        </div>
      </footer>

      {/* Modals for legal disclosures */}
      {activeModal && activeModal !== 'feedback' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-[cp-rise_0.2s_ease-out]">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-lg cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-[#F5C842] mb-4">
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

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="cp-page min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
          <div className="cp-noise" aria-hidden="true" />
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/5 border-t-[#F5C842] rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium animate-pulse">
              Loading ClearPick... / טוען ClearPick...
            </p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
