const axios = require('axios');
const googleShoppingService = require('./googleShoppingService');

/**
 * Product Image Service
 * Tries "official" image via Google Custom Search when configured,
 * and falls back to Wikipedia summary thumbnail (free) when not.
 */
class ProductImageService {
  async tryAppleOgImage(productName) {
    const lower = String(productName || '').toLowerCase();
    if (
      !/\biphone\b|\bipad\b|\bmacbook\b|\bairpods\b|\bapple watch\b|\bimac\b|\bmac mini\b/.test(lower)
    ) {
      return null;
    }

    // Best-effort slug guessing (works well for iPhone generations, AirPods, common Apple pages)
    const slug = lower
      .replace(/\bapple\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const candidates = [
      // Most Apple product pages follow this pattern
      `https://www.apple.com/${slug}/`,
      // Fallbacks for common families
      lower.includes('iphone') ? 'https://www.apple.com/iphone/' : null,
      lower.includes('airpods') ? 'https://www.apple.com/airpods/' : null,
      lower.includes('ipad') ? 'https://www.apple.com/ipad/' : null,
      lower.includes('macbook') ? 'https://www.apple.com/mac/' : null,
      lower.includes('apple watch') ? 'https://www.apple.com/watch/' : null,
    ].filter(Boolean);

    const ogKey = 'property="og:image" content="';

    for (const url of candidates) {
      try {
        const resp = await axios.get(url, {
          timeout: 8000,
          headers: {
            'User-Agent': 'ClearPick.ai/1.0 (product images; https://www.clearpickai.com)',
          },
        });
        const html = String(resp?.data || '');
        const i = html.indexOf(ogKey);
        if (i < 0) continue;
        const s = html.slice(i + ogKey.length);
        const j = s.indexOf('"');
        const ogImage = j > 0 ? s.slice(0, j) : null;
        if (ogImage && ogImage.startsWith('http')) return ogImage;
      } catch {
        // try next candidate
      }
    }

    return null;
  }

  async getImageUrl(productName) {
    if (!productName || !String(productName).trim()) return null;
    const name = String(productName).trim();

    // 0) Apple OG image (no API key, usually very "official-looking")
    const appleOg = await this.tryAppleOgImage(name).catch(() => null);
    if (appleOg) return appleOg;

    // 1) Google Custom Search (best quality when configured)
    try {
      const lower = name.toLowerCase();
      const isAppleProduct =
        /\biphone\b|\bipad\b|\bmacbook\b|\bairpods\b|\bapple watch\b|\bimac\b|\bmac mini\b/.test(lower);

      // Prefer official-ish sources for Apple products
      const opts = isAppleProduct
        ? {
            preferredSites: ['apple.com', 'store.storeimages.cdn-apple.com'],
            querySuffix: 'press image OR product image',
          }
        : undefined;

      const url = await googleShoppingService.getProductImage(name, opts);
      if (url) return url;
    } catch {
      // ignore, fall back
    }

    // 2) Wikipedia REST summary (free fallback)
    try {
      const resp = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
        {
          timeout: 5000,
          headers: {
            // Wikipedia requests a UA; keep it simple and honest
            'User-Agent': 'ClearPick.ai/1.0 (product images; https://www.clearpickai.com)',
          },
        }
      );

      const data = resp?.data;
      const wikiImage =
        data?.originalimage?.source || data?.thumbnail?.source || null;
      return typeof wikiImage === 'string' && wikiImage.startsWith('http')
        ? wikiImage
        : null;
    } catch {
      return null;
    }
  }
}

module.exports = new ProductImageService();

