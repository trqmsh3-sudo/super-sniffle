import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { StatsSection, HowItWorks, FAQSection, SourceLogos } from '@/components/TrustElements';

// ── Category data ────────────────────────────────────────────────────────────

const TOP_CATEGORIES = [
  { slug: 'laptops', name: 'Laptops', icon: '💻' },
  { slug: 'phones', name: 'Phones', icon: '📱' },
  { slug: 'headphones', name: 'Headphones', icon: '🎧' },
  { slug: 'cameras', name: 'Cameras', icon: '📷' },
  { slug: 'cars', name: 'Cars', icon: '🚗' },
  { slug: 'tablets', name: 'Tablets', icon: '📱' },
  { slug: 'televisions', name: 'TVs', icon: '📺' },
  { slug: 'speakers', name: 'Speakers', icon: '🔊' },
  { slug: 'watches', name: 'Watches', icon: '⌚' },
  { slug: 'gaming-consoles', name: 'Gaming', icon: '🎮' },
] as const;

const TOP_BRANDS = [
  'apple', 'samsung', 'sony', 'bmw', 'mercedes', 'tesla',
  'nike', 'adidas', 'google', 'microsoft', 'nvidia', 'dyson',
] as const;

const POPULAR_SEARCHES = [
  'Best wireless earbuds 2025',
  'iPhone 17 review',
  'Gaming laptop under $1500',
  'Best OLED TV',
  'Samsung S25 vs iPhone 16',
  'Sony WH-1000XM5',
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-bg">
      {/* ── Section 1: Hero ──────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-4 pb-16 pt-20 md:pb-24 md:pt-32">
        {/* Subtle gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(30,58,138,0.04) 0%, transparent 70%)',
          }}
        />

        <h1 className="relative mb-3 text-center text-hero font-extrabold tracking-tight text-gray-900">
          Find the Best Product.{' '}
          <span className="bg-gradient-to-r from-primary-800 to-accent bg-clip-text text-transparent">
            Instantly.
          </span>
        </h1>

        <p className="relative mb-8 max-w-lg text-center text-gray-500 md:text-lg">
          AI-powered research across 50+ trusted sources.
          <br className="hidden sm:block" />
          Real scores, real reviews, honest recommendations.
        </p>

        <div className="relative w-full max-w-[770px]">
          <SearchBar autoFocus />
        </div>

        {/* Popular searches */}
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-gray-400">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-surface-border bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-800 hover:shadow-md active:scale-[0.97]"
            >
              {term}
            </Link>
          ))}
        </div>

        {/* Trust line */}
        <div className="relative mt-10">
          <SourceLogos />
        </div>
      </section>

      {/* ── Section 2: Stats ─────────────────────────────────────────────── */}
      <StatsSection />

      {/* ── Section 3: Top Categories ────────────────────────────────────── */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-content">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Browse by Category
          </h2>
          <p className="mb-8 text-center text-sm text-gray-500">
            Explore products across every major category
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            {TOP_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?q=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-2 rounded-card border border-surface-border bg-surface-bg px-4 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover active:scale-[0.97]"
              >
                <span className="text-2xl transition-transform duration-200 group-hover:scale-110 md:text-3xl">
                  {cat.icon}
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-800">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: How It Works ──────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Section 5: Popular Brands ────────────────────────────────────── */}
      <section className="border-t border-surface-border bg-surface-bg px-4 py-16 md:py-20">
        <div className="mx-auto max-w-content">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Popular Brands
          </h2>
          <p className="mb-8 text-center text-sm text-gray-500">
            In-depth AI research for top brands
          </p>

          <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:pb-0">
            {TOP_BRANDS.map((slug) => {
              const name = slug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

              return (
                <Link
                  key={slug}
                  href={`/brand/${slug}`}
                  className="group flex flex-shrink-0 flex-col items-center gap-2.5 rounded-card border border-surface-border bg-white px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover active:scale-[0.97] md:flex-shrink"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://logo.clearbit.com/${slug}.com`}
                    alt={`${name} logo`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl bg-surface-bg object-contain p-1.5 shadow-sm"
                    loading="lazy"
                  />
                  <span className="whitespace-nowrap text-xs font-medium text-gray-500 group-hover:text-primary-800">
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 6: FAQ ───────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-border bg-white px-6 py-8 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} ClearPick.ai — Unbiased product intelligence
        </p>
      </footer>
    </div>
  );
}
