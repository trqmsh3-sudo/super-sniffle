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

  const handleBentoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    card.style.setProperty('--x', `${x}%`);
    card.style.setProperty('--y', `${y}%`);
    
    const rotateX = (e.clientY - rect.top - rect.height / 2) / 40;
    const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 40;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
  };

  const handleBentoMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
  };

  // Subtle scroll reveals
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll('.bento-card-premium');
    cards.forEach(card => {
      card.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
      observer.observe(card);
    });

    return () => {
      cards.forEach(card => observer.unobserve(card));
    };
  }, []);

  const t = translations[lang];
  const isRTL = lang === 'he' || lang === 'ar';

  return (
    <div 
      className="premium-bg text-on-surface min-h-screen flex flex-col font-body-md selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden relative"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Atmospheric Visuals */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] hero-glow-premium pointer-events-none" />
      <div className="lens-flare-premium top-1/4 left-1/4" />
      <div className="lens-flare-premium bottom-1/4 right-1/4" />

      {/* Header */}
      <header className="fixed top-0 w-full z-[100] bg-surface-glass backdrop-blur-2xl border-b border-white/5" dir="ltr">
        <div className="flex justify-between items-center px-6 md:px-12 h-24 w-full max-w-[1440px] mx-auto">
          <div 
            onClick={() => router.push('/')}
            className="font-display-lg text-2xl font-extrabold tracking-tighter text-white flex items-center gap-2 group cursor-pointer transition-all"
          >
            <div className="w-8 h-8 bg-[#F5C842] rounded-lg flex items-center justify-center text-black">
              <span className="material-symbols-outlined font-bold text-lg">auto_awesome</span>
            </div>
            ClearPick.ai
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <span className="text-on-surface-variant font-label-caps text-[11px] tracking-[0.2em] uppercase">{t.footerUnsponsored}</span>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <span className="text-on-surface-variant font-label-caps text-[11px] tracking-[0.2em] uppercase">v1.2.0</span>
          </nav>
          <div className="flex items-center gap-6">
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

      <main className="relative pt-48 min-h-screen flex flex-col items-center">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 md:px-12 text-center mb-24 relative z-10 w-full max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 glass-panel-premium rounded-full border-primary/20 bg-primary/5">
            <span className="material-symbols-outlined text-primary text-base animate-pulse">neurology</span>
            <span className="font-label-caps text-[10px] text-primary tracking-[0.25em] uppercase font-bold">{t.statusIndicator}</span>
          </div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-8 max-w-5xl mx-auto leading-[0.95] text-reveal-premium tracking-tighter">
            {formatTitle(t.title)}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-16 opacity-80 leading-relaxed">
            {t.subtitle}
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-4xl search-container-premium glass-panel-premium rounded-[2rem] p-3 shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4 bg-black/40 rounded-[1.5rem] p-3 border border-white/5 group focus-within:border-primary/40 transition-all duration-500">
              <div className="flex items-center gap-4 flex-1 px-4 w-full">
                <span className="material-symbols-outlined text-primary/60 text-2xl">search</span>
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-white font-body-md text-xl focus:ring-0 placeholder:text-text-muted/50 py-3" 
                  placeholder={t.placeholder}
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                disabled={query.trim().length < 2}
                className="w-full md:w-auto bg-[#F5C842] hover:bg-[#D4A820] text-black px-12 py-5 rounded-xl font-display-lg text-lg font-bold hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(242,202,80,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{t.search}</span>
                <span className="material-symbols-outlined text-xl" style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }}>
                  {isRTL ? 'arrow_back' : 'arrow_forward'}
                </span>
              </button>
            </form>
          </div>
          
          {/* Quick Suggestion links */}
          <div className="mt-8 text-xs text-gray-400 flex flex-wrap justify-center items-center gap-3 relative z-20">
            <span className="font-semibold text-on-surface-variant/90">{t.trySuggest}</span>
            <button 
              type="button" 
              onClick={() => setQuery('PlayStation 5 Pro')} 
              className="px-3.5 py-1.5 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-gray-300 hover:text-primary rounded-full transition duration-300 cursor-pointer text-xs min-h-0 min-w-0"
            >
              PlayStation 5 Pro
            </button>
            <button 
              type="button" 
              onClick={() => setQuery('Apple Vision Pro')} 
              className="px-3.5 py-1.5 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-gray-300 hover:text-primary rounded-full transition duration-300 cursor-pointer text-xs min-h-0 min-w-0"
            >
              Apple Vision Pro
            </button>
            <button 
              type="button" 
              onClick={() => setQuery('JBL Go 5')} 
              className="px-3.5 py-1.5 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-gray-300 hover:text-primary rounded-full transition duration-300 cursor-pointer text-xs min-h-0 min-w-0"
            >
              JBL Go 5
            </button>
          </div>

          <div className="mt-16 flex items-center gap-10 justify-center">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#f2ca50]"></div>
              <span className="text-on-surface-variant font-label-caps text-[11px] tracking-widest uppercase opacity-60">POC V1.2</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg">verified</span>
              <span className="text-on-surface-variant font-label-caps text-[11px] tracking-widest uppercase opacity-60">{t.footerUnsponsored}</span>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 pb-40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Feature */}
            <div 
              onMouseMove={handleBentoMouseMove}
              onMouseLeave={handleBentoMouseLeave}
              className="md:col-span-8 bento-card-premium glass-panel-premium rounded-[2.5rem] p-12 flex flex-col justify-end group min-h-[350px] relative overflow-hidden"
            >
              <div className="absolute top-12 left-12 w-20 h-20 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">lock_open</span>
              </div>
              <div className="relative z-10 max-w-2xl">
                <h3 className="font-display-lg text-4xl text-white mb-6">{t.why1Title}</h3>
                <p className="font-body-lg text-on-surface-variant leading-relaxed text-xl">
                  {t.why1Desc}
                </p>
              </div>
            </div>
            {/* Secondary Feature 1 */}
            <div 
              onMouseMove={handleBentoMouseMove}
              onMouseLeave={handleBentoMouseLeave}
              className="md:col-span-4 bento-card-premium glass-panel-premium rounded-[2.5rem] p-10 flex flex-col gap-8 group bg-surface-container-high/50 min-h-[350px] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">analytics</span>
              </div>
              <div>
                <h3 className="font-headline-md text-2xl text-white mb-4">{t.why2Title}</h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed opacity-70">
                  {t.why2Desc}
                </p>
              </div>
            </div>
            {/* Secondary Feature 2 */}
            <div 
              onMouseMove={handleBentoMouseMove}
              onMouseLeave={handleBentoMouseLeave}
              className="md:col-span-4 bento-card-premium glass-panel-premium rounded-[2.5rem] p-10 flex flex-col gap-8 group bg-surface-container-high/50 min-h-[250px] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">balance</span>
              </div>
              <div>
                <h3 className="font-headline-md text-2xl text-white mb-4">{t.why3Title}</h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed opacity-70">
                  {t.why3Desc}
                </p>
              </div>
            </div>
            {/* Stats/Mini Feature */}
            <div 
              onMouseMove={handleBentoMouseMove}
              onMouseLeave={handleBentoMouseLeave}
              className="md:col-span-8 bento-card-premium glass-panel-premium rounded-[2.5rem] p-10 flex items-center justify-between group overflow-hidden min-h-[250px] relative"
            >
              <div className="flex flex-col gap-2">
                <span className="font-label-caps text-primary text-[10px] tracking-widest uppercase">REAL-TIME PROCESSING</span>
                <h3 className="font-display-lg text-3xl text-white">
                  {lang === 'he' ? 'ניתוח נתונים ב-3 שניות' : '3-Second Data Analysis'}
                </h3>
              </div>
              <div className="flex items-baseline gap-1 relative z-10">
                <span className="text-6xl font-extrabold text-primary">3.2</span>
                <span className="text-xl text-primary/60 font-bold">M</span>
                <span className="text-sm text-on-surface-variant mr-2">
                  {lang === 'he' ? 'דיונים נותחו' : 'Threads Analyzed'}
                </span>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Neural Status & CTA */}
        <section className="flex flex-col items-center py-40 border-t border-white/5 relative w-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="flex flex-col items-center gap-10">
            <div className="flex items-center gap-4 px-6 py-2 glass-panel-premium rounded-full">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </div>
              <span className="font-label-caps text-[10px] tracking-[0.3em] text-white/60 uppercase">NEURAL CORE ACTIVE</span>
            </div>
            <a 
              href="mailto:clearpick.ai@gmail.com?subject=Feedback%20for%20ClearPick.ai"
              className="inline-flex items-center gap-6 px-12 py-6 glass-panel-premium rounded-2xl hover:bg-white/[0.04] hover:border-primary/30 transition-all active:scale-95 group cursor-pointer text-decoration-none"
            >
              <span className="material-symbols-outlined text-primary text-2xl">chat_bubble</span>
              <span className="font-display-lg text-xl font-semibold text-white">{t.feedback}</span>
              <span 
                className="material-symbols-outlined text-white/40 text-xl group-hover:translate-x-[-8px] transition-transform"
                style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }}
              >
                chevron_left
              </span>
            </a>
          </div>
        </section>
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
            <a className="text-text-muted font-label-caps text-[11px] tracking-widest hover:text-primary transition-colors uppercase" href="mailto:clearpick.ai@gmail.com?subject=Feedback%20for%20ClearPick.ai">{lang === 'he' ? 'יצירת קשר' : 'Contact Us'}</a>
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
