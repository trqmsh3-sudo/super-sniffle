// =============================================================================
// ClearPick.ai — Category Page
// /app/category/[slug]/page.tsx
//
// ISR revalidate: 86400 (24h) · dynamicParams: true
// Fetches products via Wikipedia Search + Summary APIs
// =============================================================================

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import ProductGrid from '@/components/ProductGrid';
import { fetchCategoryProducts } from '@/lib/wikiCategoryData';
import { Language, translations } from '@/lib/translations';
import FeedbackButton from '@/components/FeedbackButton';

// ── Category Definitions ─────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  laptops: 'Laptops',
  phones: 'Phones',
  headphones: 'Headphones',
  cameras: 'Cameras',
  cars: 'Cars',
  tablets: 'Tablets',
  televisions: 'TVs',
  speakers: 'Speakers',
  watches: 'Watches',
  'gaming-consoles': 'Gaming',
  'laptops-gaming': 'Gaming Laptops',
  monitors: 'Monitors',
  printers: 'Printers',
  routers: 'Routers',
  keyboards: 'Keyboards',
  mice: 'Mice',
  refrigerators: 'Refrigerators',
  'washing-machines': 'Washers',
  dishwashers: 'Dishwashers',
  'vacuum-cleaners': 'Vacuums',
  drones: 'Drones',
  projectors: 'Projectors',
  'power-banks': 'Power Banks',
  storage: 'Storage',
  'graphics-cards': 'Graphics Cards',
  'running-shoes': 'Running Shoes',
  sneakers: 'Sneakers',
  shoes: 'Shoes',
  jackets: 'Jackets',
  backpacks: 'Backpacks',
};

// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, string> = {
  laptops: '#2563eb',
  phones: '#7c3aed',
  headphones: '#059669',
  cameras: '#d97706',
  cars: '#dc2626',
  tablets: '#8b5cf6',
  televisions: '#0891b2',
  speakers: '#ea580c',
  watches: '#6366f1',
  'gaming-consoles': '#16a34a',
  'laptops-gaming': '#2563eb',
  monitors: '#0891b2',
  printers: '#6b7280',
  routers: '#0d9488',
  keyboards: '#7c3aed',
  mice: '#7c3aed',
  refrigerators: '#0369a1',
  'washing-machines': '#0369a1',
  dishwashers: '#0369a1',
  'vacuum-cleaners': '#6a2382',
  drones: '#059669',
  projectors: '#d97706',
  'power-banks': '#ea580c',
  storage: '#6b7280',
  'graphics-cards': '#76b900',
  'running-shoes': '#111111',
  sneakers: '#111111',
  shoes: '#111111',
  jackets: '#1d3557',
  backpacks: '#1d3557',
};

export const revalidate = 86400;
export const dynamicParams = true;

// ── Metadata ─────────────────────────────────────────────────────────────────

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ l?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const label = CATEGORY_LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const title = `${label} — Product Reviews & Rankings | ClearPick.ai`;
  const description = `Explore the best ${label.toLowerCase()} with AI-powered product research, honest scores, and real reviews on ClearPick.ai.`;

  return {
    title,
    description,
    openGraph: {
      title: `${label} | ClearPick.ai`,
      description,
      type: 'website',
      siteName: 'ClearPick.ai',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

// ── Page Component ───────────────────────────────────────────────────────────

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const label = CATEGORY_LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const color = CATEGORY_COLORS[slug] ?? '#F5C842';

  const products = await fetchCategoryProducts(slug);

  // Unknown category with no products → redirect to search
  if (!CATEGORY_LABELS[slug] && products.length === 0) {
    redirect(`/search?q=${encodeURIComponent(slug)}`);
  }

  const langParam = sParams?.l as Language;
  const lang: Language = ['he', 'en', 'ar', 'es', 'ru', 'fr', 'de', 'zh', 'hi'].includes(langParam)
    ? langParam
    : 'he';

  const isRTL = lang === 'he' || lang === 'ar';
  const t = translations[lang] || translations['he'];

  // ── JSON-LD: CollectionPage + ItemList ────────────────────────────────
  const allProducts = products.flatMap((g) => g.items);
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} — ClearPick.ai`,
    description: `Best ${label.toLowerCase()} products reviewed and compared`,
    url: `https://clearpick.ai/category/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `${label} Products`,
      itemListElement: allProducts.slice(0, 5).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `https://clearpick.ai/category/${slug}`,
      })),
    },
  };

  // ── JSON-LD: BreadcrumbList ────────────────────────────────────────────
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://clearpick.ai' },
      { '@type': 'ListItem', position: 2, name: label, item: `https://clearpick.ai/category/${slug}` },
    ],
  };

  return (
    <main 
      className="premium-bg text-on-surface min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Atmospheric Visuals */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] hero-glow-premium pointer-events-none" />
      <div className="lens-flare-premium top-1/4 left-1/4" />

      {/* ── Structured Data ──────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#F5C842]/5 to-transparent">
        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-16 md:pb-16 md:pt-24">
          <div className="text-center">
            <span
              className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
            >
              Category
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl font-display-lg">
              {label}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400 font-body-md">
              AI-powered product research — honest scores and real reviews for{' '}
              {label.toLowerCase()}.
            </p>
          </div>
        </div>
      </section>

      {/* ── Product Grid ─────────────────────────────────────────────────── */}
      <ProductGrid
        yearGroups={products}
        brandSlug={slug}
        brandName={label}
        primaryColor={color}
      />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-transparent px-6 py-12 text-center text-gray-400 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-body-md text-gray-400">
            Product data powered by{' '}
            <span className="font-semibold" style={{ color: '#F5C842' }}>
              ClearPick.ai
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <FeedbackButton lang={lang} variant="footer" />
            <span className="hidden sm:inline text-white/10">|</span>
            <p className="text-xs font-body-md text-gray-500">
              Prices and availability may vary. Last updated every 24 hours.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
