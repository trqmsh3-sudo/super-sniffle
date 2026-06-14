// =============================================================================
// ClearPick.ai — Homepage (Premium Stitch-Design Version)
// Premium dark gold aesthetics, ambient glow lights, bento grid, and localized modals.
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
    'העתיד',
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
          <span key={i} className="text-gradient-gold">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};

function HomeContent() {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [activeModal, setActiveModal] = useState<null | 'terms' | 'privacy' | 'disclosure'>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const langParam = searchParams.get('l') as Language;

  // Load language preference with automatic browser language detection
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
      className="bg-surface-container-lowest text-on-background min-h-screen flex flex-col font-body-lg selection:bg-primary/30 overflow-x-hidden relative"
      dir={lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Film grain texture */}
      <div className="cp-noise" aria-hidden="true" />

      {/* Ambient Background Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full glow-underlight opacity-70 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full glow-underlight opacity-40 blur-[100px]" />
      </div>

      {/* Navbar (TopNavBar) */}
      <nav 
        className="bg-surface/60 backdrop-blur-xl fixed top-4 left-1/2 -translate-x-1/2 w-[95%] rounded-xl border border-white/10 shadow-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_10px_rgba(212,175,55,0.1)] flex justify-between items-center px-6 py-4 max-w-7xl mx-auto z-50 transition-all duration-300"
        dir="ltr"
      >
        {/* Left Actions / Language Switcher */}
        <div className="flex-1 flex items-center justify-start gap-3">
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

        {/* Brand / Logo (Center) */}
        <div className="flex-1 flex justify-center">
          <span className="font-display-lg text-headline-lg tracking-tighter text-primary">
            Clear<span className="text-white">Pick</span><span className="text-gray-500 text-xs">.ai</span>
          </span>
        </div>

        {/* Actions / Buttons (Right) */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <span className="bg-amber-500/10 text-[#f2ca50] border border-amber-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full hidden sm:inline-block">
            POC v1.1
          </span>
          <button 
            type="button"
            onClick={() => setActiveModal('disclosure')}
            className="bg-gradient-to-r from-primary to-primary-fixed text-on-primary font-label-sm text-label-sm px-6 py-2 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 active:scale-95 border border-primary/50 uppercase tracking-widest hidden md:block cursor-pointer"
          >
            {t.footerUnsponsored}
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow z-10 flex flex-col items-center pt-32 md:pt-48 pb-section-gap px-6 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">{t.statusIndicator}</span>
          </div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background max-w-4xl mb-6 leading-tight">
            {formatTitle(t.title)}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto opacity-80 leading-relaxed">
            {t.subtitle}
          </p>
        </section>

        {/* Central Action: Search Bar */}
        <section className="w-full max-w-3xl mb-12 relative group">
          {/* Glow effect behind search */}
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <form onSubmit={handleSearch} className="glass-panel rounded-full p-2 flex items-center relative z-10 focus-within:border-primary/60 focus-within:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-500">
            <span className="material-symbols-outlined text-primary ml-4 mr-2 text-2xl">search</span>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-0 text-on-background font-body-lg text-body-lg w-full placeholder:text-outline-variant pr-2"
              placeholder={t.placeholder}
              autoFocus
            />
            <button 
              type="submit"
              disabled={query.trim().length < 2}
              className="bg-gradient-to-l from-primary to-[#e3c464] text-on-primary font-title-md text-title-md px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 active:scale-95 font-semibold flex-shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {t.search}
            </button>
          </form>

          {/* Quick Suggestion links */}
          <div className="mt-5 text-xs text-gray-500 flex flex-wrap justify-center gap-2 relative z-20">
            <span>{t.trySuggest}</span>
            <button type="button" onClick={() => setQuery('PlayStation 5 Pro')} className="text-gray-400 hover:text-primary underline decoration-dotted cursor-pointer">PlayStation 5 Pro</button>
            <span>•</span>
            <button type="button" onClick={() => setQuery('Apple Vision Pro')} className="text-gray-400 hover:text-primary underline decoration-dotted cursor-pointer">Apple Vision Pro</button>
            <span>•</span>
            <button type="button" onClick={() => setQuery('JBL Go 5')} className="text-gray-400 hover:text-primary underline decoration-dotted cursor-pointer">JBL Go 5</button>
          </div>
        </section>

        {/* Value Props (Bento-ish Grid) */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mt-12">
          {/* Prop 1 */}
          <div className="glass-panel rounded-xl p-8 flex flex-col items-start text-right hover:bg-white/[0.03] transition-colors duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center border border-white/10 mb-6 relative z-10">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <h3 className="font-title-md text-title-md text-on-background mb-3 relative z-10">{t.why1Title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-80 leading-relaxed relative z-10">
              {t.why1Desc}
            </p>
          </div>

          {/* Prop 2 */}
          <div className="glass-panel rounded-xl p-8 flex flex-col items-start text-right hover:bg-white/[0.03] transition-colors duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center border border-white/10 mb-6 relative z-10">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <h3 className="font-title-md text-title-md text-on-background mb-3 relative z-10">{t.why2Title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-80 leading-relaxed relative z-10">
              {t.why2Desc}
            </p>
          </div>

          {/* Prop 3 */}
          <div className="glass-panel rounded-xl p-8 flex flex-col items-start text-right hover:bg-white/[0.03] transition-colors duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center border border-white/10 mb-6 relative z-10">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>balance</span>
            </div>
            <h3 className="font-title-md text-title-md text-on-background mb-3 relative z-10">{t.why3Title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-80 leading-relaxed relative z-10">
              {t.why3Desc}
            </p>
          </div>
        </section>

        {/* AI Pulse Indicator Decorative Element */}
        <div className="mt-16 flex items-center gap-4 opacity-50">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </div>
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Neural Core Active</span>
        </div>
      </main>

      {/* Feedback trigger button above footer */}
      <FeedbackButton lang={lang} />

      {/* Footer (Stitch-style navbar linked to React modals) */}
      <footer 
        className="bg-surface-container-lowest w-full rounded-t-xl border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-12 py-12 z-10 relative mt-auto"
        dir="ltr"
      >
        <div className="mb-8 md:mb-0 text-center md:text-left">
          <h4 className="font-headline-lg text-headline-lg text-[#ffe088] mb-2 font-heading">ClearPick.ai</h4>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-70">
            © {new Date().getFullYear()} ClearPick.ai. The Gold Standard in AI Synthesis.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <button type="button" onClick={() => setActiveModal('privacy')} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">{t.privacy}</button>
          <button type="button" onClick={() => setActiveModal('terms')} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">{t.terms}</button>
          <button type="button" onClick={() => setActiveModal('disclosure')} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">{t.disclosure}</button>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="mailto:clearpick.ai@gmail.com?subject=Feedback%20for%20ClearPick.ai">{t.feedback}</a>
        </div>
      </footer>

      {/* Modals for legal disclosures */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-[cp-rise_0.2s_ease-out]">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative text-left" dir={lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'}>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-lg cursor-pointer min-w-0 min-h-0 p-1"
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
