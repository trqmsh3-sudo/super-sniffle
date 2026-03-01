import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Section 1: Hero ──────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-4 pb-20 pt-24 md:pb-28 md:pt-36">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(59,130,246,0.08) 0%, transparent 70%)',
          }}
        />

        <h1 className="relative mb-3 text-center text-5xl font-extrabold tracking-tight text-white md:text-7xl">
          Clear<span className="text-blue-400">Pick</span>
          <span className="text-blue-300">.ai</span>
        </h1>

        <h2 className="relative mb-2 text-center text-2xl font-semibold text-white md:text-3xl">
          Find any product. Instantly.
        </h2>

        <p className="relative mb-10 max-w-lg text-center text-slate-400 md:text-lg">
          AI-powered research across every brand and model.
        </p>

        <div className="relative w-full max-w-2xl">
          <SearchBar autoFocus />
        </div>

        <p className="relative mt-12 text-xs text-slate-500">
          Unbiased scores &middot; Real reviews &middot; Honest recommendations
        </p>
      </section>

      {/* ── Section 2: Top Categories ────────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-900 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-8 text-center text-xl font-bold text-white md:text-2xl">
            Browse by Category
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            {TOP_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-800/60 px-4 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <span className="text-2xl transition-transform duration-200 group-hover:scale-110 md:text-3xl">
                  {cat.icon}
                </span>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Popular Brands ────────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-950 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-8 text-center text-xl font-bold text-white md:text-2xl">
            Popular Brands
          </h3>

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
                  className="group flex flex-shrink-0 flex-col items-center gap-2.5 rounded-2xl border border-slate-700/50 bg-slate-800/40 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/5 md:flex-shrink"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://logo.clearbit.com/${slug}.com`}
                    alt={`${name} logo`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl bg-white object-contain p-1.5 shadow-sm"
                    loading="lazy"
                  />
                  <span className="whitespace-nowrap text-xs font-medium text-slate-400 group-hover:text-white">
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} ClearPick.ai — Unbiased product intelligence
        </p>
      </footer>
    </div>
  );
}
