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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const label = CATEGORY_LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const color = CATEGORY_COLORS[slug] ?? '#2563eb';

  const products = await fetchCategoryProducts(slug);

  // Unknown category with no products → redirect to search
  if (!CATEGORY_LABELS[slug] && products.length === 0) {
    redirect(`/search?q=${encodeURIComponent(slug)}`);
  }

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
    <main className="min-h-screen bg-white">
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
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${color}12 0%, ${color}06 50%, transparent 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-16 md:pb-16 md:pt-24">
          <div className="text-center">
            <span
              className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-white"
              style={{ backgroundColor: color }}
            >
              Category
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
              {label}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
              AI-powered product research — honest scores and real reviews for{' '}
              {label.toLowerCase()}.
            </p>
          </div>
        </div>
        <div
          className="h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />
      </section>

      {/* ── Product Grid ─────────────────────────────────────────────────── */}
      <ProductGrid
        yearGroups={products}
        brandSlug={slug}
        brandName={label}
        primaryColor={color}
      />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-6 py-10 text-center">
        <p className="text-sm text-gray-400">
          Product data powered by{' '}
          <span className="font-semibold" style={{ color }}>
            ClearPick.ai
          </span>
        </p>
        <p className="mt-1 text-xs text-gray-300">
          Prices and availability may vary. Last updated every 24 hours.
        </p>
      </footer>
    </main>
  );
}
