import type { MetadataRoute } from 'next';
import { BRAND_REGISTRY } from '@/lib/brandRegistry';
import { BASE_URL } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BASE_URL;

  const brandUrls = BRAND_REGISTRY.map((brand) => ({
    url: `${baseUrl}/brand/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = [
    'laptops', 'phones', 'headphones', 'cameras', 'cars',
    'tablets', 'televisions', 'speakers', 'watches', 'gaming-consoles',
    'laptops-gaming', 'monitors', 'printers', 'routers',
    'keyboards', 'mice', 'refrigerators', 'washing-machines', 'dishwashers', 'vacuum-cleaners',
  ].map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...brandUrls,
    ...categoryUrls,
  ];
}
