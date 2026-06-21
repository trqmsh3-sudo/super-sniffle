// =============================================================================
// ClearPick.ai — Brand Page (Next.js App Router)
// /app/brand/[slug]/page.tsx
//
// ISR revalidate: 86400 (24h) · dynamicParams: true
// Any slug is accepted — unknown brands get synthetic data + wiki products
// CSS variables for brand colors — zero runtime style calc
// =============================================================================

import type { Metadata } from 'next';
import { fetchBrandData } from '@/lib/brandData';
import BrandHero from '@/components/BrandHero';
import ProductGrid from '@/components/ProductGrid';
import RelatedBrands from '@/components/RelatedBrands';
import { Language, translations } from '@/lib/translations';
import FeedbackButton from '@/components/FeedbackButton';

// ── On-demand ISR: any slug is valid, built on first visit, cached 24h ────────

export const revalidate = 86400;
export const dynamicParams = true;

// ── Metadata ─────────────────────────────────────────────────────────────────

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ l?: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const displayName = slug
    .split(/[-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const title = `${displayName} — Products & Reviews | ClearPick.ai`;
  const description = `Explore ${displayName} products, models, specs, and expert reviews across the last 15 years on ClearPick.ai.`;

  return {
    title,
    description,
    openGraph: {
      title: `${displayName} | ClearPick.ai`,
      description,
      type: 'website',
      siteName: 'ClearPick.ai',
      images: [
        {
          url: `https://logo.clearbit.com/${slug}.com`,
          width: 200,
          height: 200,
          alt: `${displayName} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

// ── Page Component ───────────────────────────────────────────────────────────

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const data = await fetchBrandData(slug);

  // fetchBrandData now always returns data (even for unknown brands)
  const { brand, products } = data;

  const langParam = sParams?.l as Language;
  const lang: Language = ['he', 'en', 'ar', 'es', 'ru', 'fr', 'de', 'zh', 'hi'].includes(langParam)
    ? langParam
    : 'he';

  const isRTL = lang === 'he' || lang === 'ar';

  // ── JSON-LD: Organization ──────────────────────────────────────────────
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: `https://clearpick.ai/brand/${slug}`,
    logo: brand.logo,
    description: brand.bio,
  };

  // ── JSON-LD: ItemList (top 5 products) ─────────────────────────────────
  const allProducts = products.flatMap((g) => g.items);
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brand.name} Products`,
    itemListElement: allProducts.slice(0, 5).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://clearpick.ai/brand/${slug}`,
    })),
  };

  // ── JSON-LD: BreadcrumbList ────────────────────────────────────────────
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://clearpick.ai' },
      { '@type': 'ListItem', position: 2, name: brand.category.charAt(0).toUpperCase() + brand.category.slice(1), item: `https://clearpick.ai/category/${brand.category}` },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `https://clearpick.ai/brand/${slug}` },
    ],
  };

  return (
    <main
      className="premium-bg text-on-surface min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={
        {
          '--brand-primary': brand.primaryColor,
          '--brand-secondary': brand.secondaryColor,
          '--brand-primary-10': `${brand.primaryColor}1A`,
          '--brand-primary-20': `${brand.primaryColor}33`,
          '--brand-primary-50': `${brand.primaryColor}80`,
        } as React.CSSProperties
      }
    >
      {/* Atmospheric Visuals */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] hero-glow-premium pointer-events-none" />
      <div className="lens-flare-premium top-1/4 left-1/4" />

      {/* ── Structured Data ──────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <BrandHero
        name={brand.name}
        slug={brand.slug}
        logo={brand.logo}
        primaryColor={brand.primaryColor}
        secondaryColor={brand.secondaryColor}
        bio={brand.bio}
        founded={brand.founded}
        headquarters={brand.headquarters}
        category={brand.category}
        productCount={allProducts.length}
      />

      {/* ── Product Grid ─────────────────────────────────────────────────── */}
      <ProductGrid
        yearGroups={products}
        brandSlug={brand.slug}
        brandName={brand.name}
        primaryColor={brand.primaryColor}
      />

      {/* ── Related Brands ───────────────────────────────────────────────── */}
      <RelatedBrands currentSlug={slug} category={brand.category} />

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-transparent px-6 py-12 text-center text-gray-400 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-body-md text-gray-400">
            Product data powered by{' '}
            <span className="font-semibold" style={{ color: brand.primaryColor }}>
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
