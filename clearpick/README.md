# ClearPick.ai

> Discover every product a brand makes — powered by open data.

ClearPick.ai is a Next.js application that aggregates product information from Wikipedia and Wikidata to create comprehensive, browsable brand and category pages. No affiliate links, no paid placements — just clean, factual product data.

## Features

- **95 brands** across **20 product categories** — from laptops and phones to cars and vacuum cleaners
- **Wikipedia + Wikidata** powered — real product data pulled from open knowledge graphs
- **Smart search** with intent detection — understands brand names, categories, and product types
- **SEO optimized** — JSON-LD structured data, dynamic sitemap (115+ URLs), Open Graph meta tags
- **ISR** — pages revalidate every 24 hours for fresh data without slow builds
- **Dark UI** — clean slate-950 design with brand-colored accents
- **Error boundaries** — graceful error recovery at global and page level
- **Mobile responsive** — works on all screen sizes

## Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Framework   | Next.js 15 (App Router)       |
| Language    | TypeScript                    |
| Styling     | Tailwind CSS v4               |
| Data        | Wikipedia API, Wikidata SPARQL |
| Cache       | Redis (optional, graceful fallback) |
| Hosting     | Vercel                        |

## Project Structure

```
clearpick/
├── app/
│   ├── page.tsx                  # Homepage — hero, categories, brand logos
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # Custom 404 page
│   ├── sitemap.ts                # Dynamic sitemap (115+ URLs)
│   ├── robots.ts                 # Robots.txt
│   ├── search/page.tsx           # Search results page
│   ├── brand/[slug]/             # Dynamic brand pages
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── category/[slug]/          # Dynamic category pages
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── api/
│       ├── search/route.ts       # Brand search API
│       └── rate-search/route.ts  # Search quality rating API
├── components/
│   ├── SearchBar.tsx             # Search with intent detection
│   ├── BrandHero.tsx             # Brand page hero section
│   ├── ProductGrid.tsx           # Year-grouped product grid
│   ├── AccuracyRating.tsx        # Search accuracy feedback
│   ├── RelatedBrands.tsx         # Same-category brand links
│   └── CacheBadge.tsx            # Cache status indicator
├── hooks/
│   └── useSearchIntent.ts        # Client-side search intent hook
├── lib/
│   ├── config.ts                 # Centralized configuration
│   ├── brandRegistry.ts          # 95 brand definitions
│   ├── brandData.ts              # Brand data fetching layer
│   ├── brandColors.ts            # Brand color mappings
│   ├── wikiProductData.ts        # Wikidata SPARQL product fetcher
│   ├── wikiCategoryData.ts       # Wikipedia category product fetcher
│   ├── wikiFilters.ts            # Shared noise filters & dedup
│   ├── searchIntent.ts           # Server-side intent detection
│   └── searchCache.ts            # Redis cache layer
└── __tests__/
    └── searchIntent.test.ts      # Search intent unit tests
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable                 | Required | Description                          |
|--------------------------|----------|--------------------------------------|
| `PRODUCT_API_URL`        | No       | V12 backend URL (fallback: localhost:3000) |
| `NEXT_PUBLIC_BASE_URL`   | No       | Public site URL (fallback: https://clearpick.ai) |
| `REDIS_URL`              | No       | Redis connection string (optional)   |

## Data Sources

All product data comes from open, public sources:

- **Wikidata SPARQL** — structured product data for specific brands (model numbers, years, categories)
- **Wikipedia Search + Summary API** — product descriptions, images, and release dates
- **Clearbit Logo API** — brand logos

No scraping. No proprietary databases. No API keys required for core functionality.

## Deployment

Configured for **Vercel** deployment:

```bash
# vercel.json already configured
vercel deploy --prod
```

Set secrets in Vercel dashboard:
- `@product_api_url` — your API endpoint
- `@redis_url` — Redis connection string (optional)

## License

Private project — all rights reserved.
