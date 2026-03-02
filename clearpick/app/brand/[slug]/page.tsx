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

// ── On-demand ISR: any slug is valid, built on first visit, cached 24h ────────

export const revalidate = 86400;
export const dynamicParams = true;

// ── Metadata ─────────────────────────────────────────────────────────────────

interface BrandPageProps {
  params: Promise<{ slug: string }>;
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

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const data = await fetchBrandData(slug);

  // fetchBrandData now always returns data (even for unknown brands)
  const { brand, products } = data;

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
      className="min-h-screen bg-surface-bg"
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

      {/* ── Footer Accent ────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-border bg-white px-6 py-10 text-center">
        <p className="text-sm text-gray-400">
          Product data powered by{' '}
          <span className="font-semibold" style={{ color: brand.primaryColor }}>
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
