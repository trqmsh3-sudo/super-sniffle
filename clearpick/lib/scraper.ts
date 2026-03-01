// =============================================================================
// ClearPick.ai — Web Scraper (Playwright Headless Chromium)
// Extracts clean text content from product pages
// =============================================================================

// ── Types ────────────────────────────────────────────────────────────────────

export interface ScrapedPage {
  url: string;
  text: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_PAGES = 5;
const NAV_TIMEOUT = 8000;
const MAX_CHARS_PER_PAGE = 2000;

// ── Main Function ────────────────────────────────────────────────────────────

/**
 * Scrape up to MAX_PAGES URLs using Playwright headless Chromium.
 * Returns clean text (no scripts, nav, footer) for each page.
 */
export async function scrapePages(urls: string[]): Promise<ScrapedPage[]> {
  // Dynamic import — Playwright may not be installed in all environments
  let chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch {
    console.warn('[Scraper] Playwright not available — skipping scrape.');
    return [];
  }

  const results: ScrapedPage[] = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const pagesToScrape = urls.slice(0, MAX_PAGES);

    for (const url of pagesToScrape) {
      try {
        const page = await context.newPage();
        await page.goto(url, {
          timeout: NAV_TIMEOUT,
          waitUntil: 'domcontentloaded',
        });

        // Extract clean text: remove script, style, nav, footer, header elements
        const text = await page.evaluate(() => {
          // Remove unwanted elements
          const selectors = ['script', 'style', 'nav', 'footer', 'header', 'noscript', 'iframe', 'svg'];
          for (const sel of selectors) {
            document.querySelectorAll(sel).forEach((el) => el.remove());
          }

          // Get page title + main content
          const title = document.title || '';
          const body = document.body?.innerText || '';

          // Clean up: collapse whitespace, trim
          const clean = `${title}\n${body}`
            .replace(/\t/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

          return clean;
        });

        if (text.length > 20) {
          results.push({
            url,
            text: text.slice(0, MAX_CHARS_PER_PAGE),
          });
        }

        await page.close();
      } catch (err) {
        console.warn(`[Scraper] Failed to scrape ${url}:`, err instanceof Error ? err.message : err);
      }
    }
  } catch (err) {
    console.error('[Scraper] Browser launch error:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}
