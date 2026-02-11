const axios = require('axios');

/**
 * Product Image Service
 * Tries "official" image via Google Custom Search when configured,
 * and falls back to Wikipedia summary thumbnail (free) when not.
 */
class ProductImageService {
  normalizeForCompare(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/[\u200e\u200f]/g, '') // bidi marks
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractMetaTagContent(html, property) {
    if (!html || !property) return null;
    const escaped = String(property).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tagMatch = String(html).match(new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]*>`, 'i'));
    if (!tagMatch) return null;
    const tag = tagMatch[0];
    const contentMatch = tag.match(/content=["']([^"']+)["']/i);
    return contentMatch ? contentMatch[1] : null;
  }

  extractTitle(html) {
    const m = String(html || '').match(/<title[^>]*>([^<]+)<\/title>/i);
    return m ? String(m[1]).trim() : null;
  }

  toHttpsUrl(url) {
    if (!url) return null;
    let u = String(url).trim();
    if (!u) return null;
    // Some sources use protocol-relative URLs
    if (u.startsWith('//')) u = `https:${u}`;
    // Normalize HTML entities
    u = u.replace(/&amp;/g, '&');
    return u;
  }

  wikiThumbToOriginal(url) {
    const u = this.toHttpsUrl(url);
    if (!u) return null;
    // Convert Wikimedia thumb URLs to original file URLs (higher quality)
    // Example:
    // https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/IPhone_15.jpeg/250px-IPhone_15.jpeg
    // -> https://upload.wikimedia.org/wikipedia/commons/2/2b/IPhone_15.jpeg
    const m = u.match(
      /https?:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/([0-9a-f]\/[0-9a-f]{2}\/[^/]+)\/\d+px-/i
    );
    if (m && m[1]) {
      return `https://upload.wikimedia.org/wikipedia/commons/${m[1]}`;
    }
    return u;
  }

  scoreWikiCandidate(productName, candidate) {
    const q = this.normalizeForCompare(productName);
    const title = this.normalizeForCompare(candidate?.title || '');
    const url = this.normalizeForCompare(candidate?.url || '');

    let score = 0;

    // Penalize vectors/icons heavily
    if (title.includes('vector') || url.includes('.svg')) score -= 100;
    if (title.includes('icon') || title.includes('logo')) score -= 40;

    // Prefer filenames/titles that include the query tokens
    const tokens = q.split(' ').filter(Boolean);
    for (const t of tokens) {
      if (t.length < 3) continue;
      if (title.includes(t) || url.includes(t)) score += 6;
    }

    // iPhone: strongly prefer exact generation match when present
    if (q.includes('iphone')) {
      const genMatch = q.match(/\biphone\s*(\d{1,2})\b/);
      const gen = genMatch ? genMatch[1] : null;
      if (gen) {
        if (title.includes(`iphone_${gen}`) || url.includes(`iphone_${gen}`)) score += 50;
        if (title.includes(`iphone ${gen}`) || url.includes(`iphone ${gen}`)) score += 30;
        // Avoid unrelated series images if exact exists
        if (title.includes('series')) score -= 10;
      }
      const wantsPro = /\bpro\b/.test(q);
      if (wantsPro) {
        if (title.includes('pro') || url.includes('pro')) score += 10;
        else score -= 10;
      }
    }

    return score;
  }

  async getWikipediaImages(productName, maxImages) {
    const name = String(productName || '').trim();
    if (!name) return [];

    const ua = 'ClearPick.ai/1.0 (product images; https://www.clearpickai.com)';

    // Prefer media-list to avoid picking SVG/vector from the summary endpoint
    const title = name.replace(/\s+/g, '_');
    try {
      const resp = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`,
        { timeout: 7000, headers: { 'User-Agent': ua } }
      );

      const items = resp?.data?.items || [];
      const candidates = [];

      for (const it of items) {
        if (it?.type !== 'image') continue;

        const srcset = Array.isArray(it?.srcset) ? it.srcset : [];
        // pick the largest px from srcset (then convert to original)
        let best = null;
        let bestPx = -1;
        for (const s of srcset) {
          const src = this.toHttpsUrl(s?.src);
          if (!src) continue;
          const pxMatch = src.match(/\/(\d+)px-/i);
          const px = pxMatch ? Number(pxMatch[1]) : 0;
          if (px > bestPx) {
            bestPx = px;
            best = src;
          }
        }

        if (!best) continue;

        const original = this.wikiThumbToOriginal(best);
        if (!original) continue;

        candidates.push({
          url: original,
          title: String(it?.title || ''),
        });
      }

      // Prefer non-SVG if available
      const nonSvg = candidates.filter(
        (c) =>
          !this.normalizeForCompare(c?.title).includes('vector') &&
          !this.normalizeForCompare(c?.url).includes('.svg')
      );
      let pool = nonSvg.length ? nonSvg : candidates;

      // Extra safety for iPhone: avoid mixing variants (Plus/Pro/Max) when user didn't ask for them.
      const q = this.normalizeForCompare(name);
      if (q.includes('iphone')) {
        const genMatch = q.match(/\biphone\s*(\d{1,2})\b/);
        const gen = genMatch ? genMatch[1] : null;
        if (gen) {
          const wantsPro = /\bpro\b/.test(q);
          const wantsMax = /\bmax\b/.test(q);
          const wantsPlus = /\bplus\b/.test(q);

          const modelPool = pool.filter((c) => {
            const t = this.normalizeForCompare(c?.title || '');
            const u = this.normalizeForCompare(c?.url || '');
            const hasGen = t.includes(`iphone_${gen}`) || u.includes(`iphone_${gen}`) || t.includes(`iphone ${gen}`) || u.includes(`iphone ${gen}`);
            if (!hasGen) return false;
            if (wantsPro && !(t.includes('pro') || u.includes('pro'))) return false;
            if (!wantsPro && (t.includes('pro') || u.includes('pro'))) return false;
            if (wantsMax && !(t.includes('max') || u.includes('max'))) return false;
            if (!wantsMax && (t.includes('max') || u.includes('max'))) return false;
            if (wantsPlus && !(t.includes('plus') || u.includes('plus'))) return false;
            if (!wantsPlus && (t.includes('plus') || u.includes('plus'))) return false;
            return true;
          });

          if (modelPool.length > 0) pool = modelPool;
        }
      }

      pool.sort((a, b) => this.scoreWikiCandidate(name, b) - this.scoreWikiCandidate(name, a));

      const unique = [];
      const seen = new Set();
      for (const c of pool) {
        const u = this.toHttpsUrl(c?.url);
        if (!u || seen.has(u)) continue;
        seen.add(u);
        unique.push({
          url: u,
          source: 'wikipedia',
          type: 'secondary',
        });
        if (unique.length >= maxImages) break;
      }

      return unique;
    } catch (e) {
      // If media-list fails (page missing), fall back to summary (best-effort)
      try {
        const resp = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
          { timeout: 5000, headers: { 'User-Agent': ua } }
        );
        const data = resp?.data;
        const wikiImage = data?.originalimage?.source || data?.thumbnail?.source || null;
        const https = this.toHttpsUrl(wikiImage);
        if (https && https.startsWith('http')) {
          return [
            {
              url: this.wikiThumbToOriginal(https) || https,
              source: 'wikipedia',
              type: 'secondary',
            },
          ];
        }
      } catch (e2) {
        console.warn(`⚠️ Wikipedia image failed: ${e2?.message || e2}`);
      }
      return [];
    }
  }

  buildAppleCandidates(productName) {
    const lower = this.normalizeForCompare(productName);
    const urls = [];

    // iPhone: prefer deterministic mapping (avoids wrong images from /iphone/)
    if (/\biphone\b/.test(lower)) {
      const genMatch = lower.match(/\biphone\s*(\d{1,2})\b/);
      const gen = genMatch ? genMatch[1] : null;
      const wantsPro = /\bpro\b/.test(lower);
      if (gen) {
        if (wantsPro) urls.push(`https://www.apple.com/iphone-${gen}-pro/`);
        urls.push(`https://www.apple.com/iphone-${gen}/`);
      }
      urls.push('https://www.apple.com/iphone/');
      return urls;
    }

    // AirPods family
    if (lower.includes('airpods')) {
      if (lower.includes('max')) urls.push('https://www.apple.com/airpods-max/');
      if (lower.includes('pro')) urls.push('https://www.apple.com/airpods-pro/');
      urls.push('https://www.apple.com/airpods/');
      return urls;
    }

    // iPad family
    if (lower.includes('ipad')) {
      if (lower.includes('pro')) urls.push('https://www.apple.com/ipad-pro/');
      if (lower.includes('air')) urls.push('https://www.apple.com/ipad-air/');
      if (lower.includes('mini')) urls.push('https://www.apple.com/ipad-mini/');
      urls.push('https://www.apple.com/ipad/');
      return urls;
    }

    // Mac family
    if (lower.includes('macbook')) {
      if (lower.includes('air')) urls.push('https://www.apple.com/macbook-air/');
      if (lower.includes('pro')) urls.push('https://www.apple.com/macbook-pro/');
      urls.push('https://www.apple.com/mac/');
      return urls;
    }

    // Watch
    if (lower.includes('apple watch') || lower.includes('watch')) {
      urls.push('https://www.apple.com/watch/');
      return urls;
    }

    // Fallback slug guess (best-effort, but we'll validate title match before using)
    const slug = lower
      .replace(/\bapple\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (slug) urls.push(`https://www.apple.com/${slug}/`);
    return urls;
  }

  applePageLooksLikeMatch(productName, html, finalUrl) {
    const query = this.normalizeForCompare(productName);
    const ogTitle = this.normalizeForCompare(this.extractMetaTagContent(html, 'og:title') || '');
    const title = this.normalizeForCompare(this.extractTitle(html) || '');
    const pageTitle = ogTitle || title;
    const final = this.normalizeForCompare(finalUrl || '');

    // If we don't have a title signal, be conservative
    if (!pageTitle) return false;

    // iPhone generation should match (prevents using generic /iphone/ for "iPhone 15 Pro")
    if (query.includes('iphone')) {
      const genMatch = query.match(/\biphone\s*(\d{1,2})\b/);
      const gen = genMatch ? genMatch[1] : null;
      const wantsPro = /\bpro\b/.test(query);
      if (gen && !pageTitle.includes(`iphone ${gen}`)) return false;
      if (wantsPro && !pageTitle.includes('pro')) return false;
      if (gen && !final.includes(`iphone-${gen}`)) return false;
      return true;
    }

    // For other Apple products: require at least one of the main tokens to appear in the page title.
    const tokens = query
      .split(' ')
      .filter((t) => t.length >= 4 && !['apple', 'with', 'and', 'the'].includes(t))
      .slice(0, 3);

    if (tokens.length === 0) return false;
    return tokens.some((t) => pageTitle.includes(t));
  }

  async tryAppleOgImage(productName) {
    const lower = String(productName || '').toLowerCase();
    if (
      !/\biphone\b|\bipad\b|\bmacbook\b|\bairpods\b|\bapple watch\b|\bimac\b|\bmac mini\b/.test(lower)
    ) {
      return null;
    }

    const candidates = this.buildAppleCandidates(productName);

    for (const url of candidates) {
      try {
        const resp = await axios.get(url, {
          timeout: 8000,
          headers: {
            'User-Agent': 'ClearPick.ai/1.0 (product images; https://www.clearpickai.com)',
          },
        });

        const html = String(resp?.data || '');
        const finalUrl = resp?.request?.res?.responseUrl || url;

        // Prefer secure_url when present
        const ogImage =
          this.extractMetaTagContent(html, 'og:image:secure_url') ||
          this.extractMetaTagContent(html, 'og:image') ||
          null;

        if (!ogImage || !String(ogImage).startsWith('http')) continue;

        // Safety: avoid returning a generic Apple image for the wrong model
        if (!this.applePageLooksLikeMatch(productName, html, finalUrl)) continue;

        return ogImage;
      } catch {
        // try next candidate
      }
    }

    return null;
  }

  /**
   * Get multiple product images from different sources
   * @param {string} productName - Product name
   * @param {number} maxImages - Maximum number of images to return (default: 3)
   * @returns {Promise<Array>} Array of image objects [{url, source, type}]
   */
  async getMultipleImages(productName, maxImages = 3) {
    if (!productName || !String(productName).trim()) return [];
    const name = String(productName).trim();
    const images = [];

    // 1) Apple OG image (primary/official)
    try {
      const appleOg = await this.tryAppleOgImage(name);
      if (appleOg) {
        images.push({
          url: appleOg,
          source: 'apple',
          type: 'primary'
        });
      }
    } catch (e) {
      console.warn(`⚠️ Apple OG image failed: ${e?.message || e}`);
    }

    // 2) Wikipedia images (secondary) - prefer photo (not SVG/vector)
    if (images.length < maxImages) {
      try {
        const wiki = await this.getWikipediaImages(name, Math.max(1, maxImages - images.length));
        for (const w of wiki) {
          if (!images.some((img) => img.url === w.url)) images.push(w);
        }
      } catch (e) {
        console.warn(`⚠️ Wikipedia image failed: ${e?.message || e}`);
      }
    }

    console.log(`✅ Found ${images.length} images for "${name}"`);
    return images.slice(0, maxImages);
  }

  /**
   * Get single image URL (backward compatibility)
   * @param {string} productName - Product name
   * @returns {Promise<string|null>} Image URL or null
   */
  async getImageUrl(productName) {
    if (!productName || !String(productName).trim()) return null;
    const name = String(productName).trim();

    // 0) Apple OG image (no API key, usually very "official-looking") - FIRST PRIORITY
    const appleOg = await this.tryAppleOgImage(name).catch(() => null);
    if (appleOg) {
      console.log(`✅ Using Apple OG image (no API key needed)`);
      return appleOg;
    }

    // 1) Wikipedia REST summary (free, no API key) - SECOND PRIORITY
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
      if (typeof wikiImage === 'string' && wikiImage.startsWith('http')) {
        console.log(`✅ Using Wikipedia image (free, no API key needed)`);
        return wikiImage;
      }
    } catch (e) {
      console.warn(`⚠️ Wikipedia image failed: ${e?.message || e}`);
      // ignore, fall back
    }

    // 2) Google Custom Search (ONLY if API key is configured AND not rate limited)
    // SKIP THIS if we've been rate limited (user will see no image rather than errors)
    try {
      // Skip Google Custom Search to avoid rate limiting
      // The Apple OG + Wikipedia fallbacks should be sufficient
      console.log(`⚠️ Skipping Google Custom Search to avoid rate limiting`);
      return null;
    } catch {
      // ignore
      return null;
    }
  }
}

module.exports = new ProductImageService();

