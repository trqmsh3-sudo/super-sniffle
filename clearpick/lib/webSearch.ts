// =============================================================================
// ClearPick.ai — DuckDuckGo Web Search (no API key needed)
// Uses DDG Lite endpoint with fetch POST — fast, reliable, no browser needed
// =============================================================================

// ── Constants ────────────────────────────────────────────────────────────────

const DDG_LITE_URL = 'https://lite.duckduckgo.com/lite/';

/** Domains to filter out — low product-data value */
const BLOCKED_DOMAINS = [
  'wikipedia.org',
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'reddit.com',
  'tiktok.com',
  'pinterest.com',
  'linkedin.com',
];

const MAX_URLS_PER_QUERY = 5;

/** Regex to extract href URLs from DDG lite HTML */
const HREF_REGEX = /href="(https?:\/\/[^"]+)"/g;

// ── Main Function ────────────────────────────────────────────────────────────

/**
 * Search DuckDuckGo Lite (POST) for each query.
 * Returns deduplicated, filtered URLs — up to 5 per query.
 * No API key or browser required.
 */
export async function webSearch(queries: string[]): Promise<string[]> {
  const seenUrls = new Set<string>();
  const allUrls: string[] = [];

  for (const query of queries) {
    try {
      const body = new URLSearchParams({ q: query });

      const response = await fetch(DDG_LITE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: body.toString(),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.warn(`[WebSearch] DDG returned ${response.status} for "${query}"`);
        continue;
      }

      const html = await response.text();

      // Extract all external URLs from the response HTML
      let added = 0;
      let match: RegExpExecArray | null;
      HREF_REGEX.lastIndex = 0;

      while ((match = HREF_REGEX.exec(html)) !== null) {
        if (added >= MAX_URLS_PER_QUERY) break;

        const url = match[1];

        // Skip DDG internal links
        if (url.includes('duckduckgo.com')) continue;

        // Filter blocked domains
        if (BLOCKED_DOMAINS.some((d) => url.includes(d))) continue;

        // Deduplicate
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);
        allUrls.push(url);
        added++;
      }

      console.log(`[WebSearch] "${query}" → ${added} URLs`);
    } catch (err) {
      console.warn(`[WebSearch] Error for query "${query}":`, err);
    }
  }

  console.log(`[WebSearch] Total: ${allUrls.length} unique URLs`);
  return allUrls;
}
