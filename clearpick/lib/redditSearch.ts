// =============================================================================
// ClearPick.ai — Reddit Search & Scraper Helper (Playwright & Hybrid Version)
// Searches Reddit via multiple fallbacks: Playwright Direct, RSS, and DDG.
// =============================================================================

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export interface RedditComment {
  author: string;
  body: string;
  score: number;
}

export interface RedditThreadResult {
  title: string;
  url: string;
  snippet: string;
  comments: RedditComment[];
}

export interface RedditSearchResult {
  query: string;
  threads: RedditThreadResult[];
  allCommentsText: string;
  commentCount: number;
  lowData: boolean;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getRedditAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'clearpick-ai:v1.0.0 (by /u/clearpick_dev)',
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    } else {
      console.warn(`[RedditSearch] Access token response failed: ${response.status} ${response.statusText}`);
    }
  } catch (err) {
    console.error('[RedditSearch] Failed to get Reddit access token:', err);
  }
  return null;
}

async function searchRedditOfficial(productName: string, accessToken: string): Promise<RedditSearchResult> {
  const query = productName;
  const searchUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&limit=8`;
  
  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'clearpick-ai:v1.0.0 (by /u/clearpick_dev)',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Reddit API search failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const posts = data?.data?.children ?? [];
  const targetPosts = posts.slice(0, 2);

  const enrichedThreads: RedditThreadResult[] = [];
  let totalComments = 0;
  const combinedTextParts: string[] = [];

  for (const post of targetPosts) {
    const permalink = post.data.permalink;
    const threadUrl = `https://www.reddit.com${permalink}`;
    const commentApiUrl = `https://oauth.reddit.com${permalink}?limit=30`;

    try {
      const commentResponse = await fetch(commentApiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'clearpick-ai:v1.0.0 (by /u/clearpick_dev)',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (commentResponse.ok) {
        const commentData = await commentResponse.json();
        const rawComments = commentData[1]?.data?.children ?? [];
        const comments: RedditComment[] = [];

        for (const c of rawComments) {
          if (c.kind === 't1') {
            const author = c.data.author || 'Anonymous';
            const body = c.data.body || '';
            const score = c.data.score ?? 0;

            if (body.length > 10 && !author.toLowerCase().includes('bot') && author.toLowerCase() !== 'automoderator') {
              comments.push({ author, body, score });
            }
          }
        }

        enrichedThreads.push({
          title: post.data.title || 'Reddit Thread',
          url: threadUrl,
          snippet: '',
          comments,
        });

        totalComments += comments.length;
        combinedTextParts.push(`Thread Title: ${post.data.title}`);
        for (const c of comments) {
          combinedTextParts.push(`Comment by ${c.author} (Score: ${c.score}): ${c.body}`);
        }
      }
    } catch (err) {
      console.warn(`[RedditSearch] Official API comment fetch failed for ${threadUrl}:`, err);
    }
  }

  const lowData = totalComments < 15;
  return {
    query: productName,
    threads: enrichedThreads,
    allCommentsText: combinedTextParts.join('\n\n'),
    commentCount: totalComments,
    lowData,
  };
}

/**
 * Searches Reddit and retrieves thread details + comments using Playwright.
 * If Playwright fails or isn't available, falls back to direct API and search feeds.
 */
export async function searchReddit(productName: string): Promise<RedditSearchResult> {
  console.log(`[RedditSearch] Initiating search for: "${productName}"`);
  
  // ── Step 0: Try Official Reddit API (Most Stable & Cloud-Safe) ──
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (clientId && clientSecret && clientId !== 'your_reddit_client_id' && clientSecret !== 'your_reddit_client_secret') {
    console.log('[RedditSearch] Official Reddit API credentials detected. Fetching via OAuth...');
    const token = await getRedditAccessToken(clientId, clientSecret);
    if (token) {
      try {
        const result = await searchRedditOfficial(productName, token);
        console.log(`[RedditSearch] Official Reddit API search succeeded. Scraped ${result.commentCount} comments.`);
        return result;
      } catch (officialErr) {
        console.error('[RedditSearch] Official Reddit API search failed, trying scrapers:', officialErr);
      }
    }
  }
  
  // ── Step 1: Try Playwright Direct Scraping (Most Reliable & Captcha Resistant) ──
  try {
    const pw = await import('playwright');
    const browser = await pw.chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({ userAgent: USER_AGENT });
      const page = await context.newPage();
      
      // Optimize: Block styles, images, fonts, and media
      const blockResources = async (p: any) => {
        await p.route('**/*', (route: any) => {
          const type = route.request().resourceType();
          if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
            route.abort();
          } else {
            route.continue();
          }
        });
      };
      
      await blockResources(page);
      
      const searchUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(productName)}`;
      console.log(`[RedditSearch] Playwright navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { timeout: 12000 });
      
      // Wait for search result links containing comments to appear
      await page.waitForSelector('a[href*="/comments/"]', { timeout: 8000 });
      
      // Extract thread links
      const threads = await page.evaluate(() => {
        const results: { url: string; title: string; snippet: string }[] = [];
        const seen = new Set<string>();
        
        document.querySelectorAll('a').forEach(a => {
          const href = a.href;
          if (href && href.includes('/comments/') && href.includes('/r/')) {
            const cleanUrl = href.split('?')[0].split('&')[0];
            if (!seen.has(cleanUrl)) {
              seen.add(cleanUrl);
              
              let title = '';
              const titleEl = a.querySelector('span, h3, h2, div');
              if (titleEl) {
                title = (titleEl as HTMLElement).innerText.trim();
              }
              if (!title) {
                title = a.innerText.trim();
              }
              results.push({
                url: cleanUrl,
                title: title || 'Reddit Thread',
                snippet: '',
              });
            }
          }
        });
        return results;
      });
      
      console.log(`[RedditSearch] Playwright found ${threads.length} threads. Scraping top 2 concurrently...`);
      const targetThreads = threads.slice(0, 2);
      
      // Fetch comments for the top threads concurrently
      const commentPromises = targetThreads.map(async (t) => {
        const tPage = await context.newPage();
        await blockResources(tPage);
        
        try {
          await tPage.goto(t.url, { timeout: 12000 });
          await tPage.waitForSelector('shreddit-comment, [data-testid="comment"]', { timeout: 8000 });
          
          const comments = await tPage.evaluate(() => {
            const list: { author: string; body: string; score: number }[] = [];
            const shredditComments = document.querySelectorAll('shreddit-comment');
            
            if (shredditComments.length > 0) {
              shredditComments.forEach(c => {
                const author = c.getAttribute('author') || 'Anonymous';
                const score = Number(c.getAttribute('score') ?? 0);
                const contentEl = c.querySelector('[id*="-comment-rtjson-content"]');
                const body = contentEl ? (contentEl as HTMLElement).innerText.trim() : (c as HTMLElement).innerText.trim();
                if (body && body.length > 5 && !author.toLowerCase().includes('bot') && author.toLowerCase() !== 'automoderator') {
                  list.push({ author, body, score });
                }
              });
            } else {
              const commentDivs = document.querySelectorAll('[data-testid="comment"]');
              commentDivs.forEach(div => {
                const parent = div.closest('[class*="Comment"]') || div.parentElement;
                const authorEl = parent ? parent.querySelector('[class*="Author"], [href*="/user/"]') : null;
                const author = authorEl ? (authorEl as HTMLElement).innerText.trim().replace(/^u\//i, '') : 'Anonymous';
                const body = (div as HTMLElement).innerText.trim();
                if (body && body.length > 5 && !author.toLowerCase().includes('bot') && author.toLowerCase() !== 'automoderator') {
                  list.push({ author, body, score: 0 });
                }
              });
            }
            return list;
          });
          
          return { ...t, comments };
        } catch (err: any) {
          console.warn(`[RedditSearch] Failed to scrape comments for ${t.url}:`, err.message);
          return { ...t, comments: [] };
        } finally {
          await tPage.close();
        }
      });
      
      const enrichedThreads = await Promise.all(commentPromises);
      await browser.close();
      
      const totalComments = enrichedThreads.reduce((acc, t) => acc + t.comments.length, 0);
      const combinedTextParts: string[] = [];
      for (const t of enrichedThreads) {
        combinedTextParts.push(`Thread Title: ${t.title}`);
        for (const c of t.comments) {
          combinedTextParts.push(`Comment by ${c.author} (Score: ${c.score}): ${c.body}`);
        }
      }
      
      const allCommentsText = combinedTextParts.join('\n\n');
      const lowData = totalComments < 15;
      
      console.log(`[RedditSearch] Playwright succeeded. Scraped ${totalComments} comments.`);
      return {
        query: productName,
        threads: enrichedThreads,
        allCommentsText,
        commentCount: totalComments,
        lowData,
      };
      
    } catch (pwErr) {
      console.error('[RedditSearch] Playwright execution error — falling back to feeds:', pwErr);
      await browser.close();
    }
  } catch (pwLoadErr) {
    console.warn('[RedditSearch] Playwright is not available — falling back to HTTP feeds.');
  }

  // ── Step 2: Fallback to RSS/HTTP Scraper (If Playwright fails or isn't installed) ──
  try {
    console.log(`[RedditSearch] Running HTTP RSS search fallback...`);
    const searchUrl = `https://www.reddit.com/search.rss?q=${encodeURIComponent(productName)}`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': `clearpick-search:v1.0.0 (by /u/clearpick_dev)` },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const xml = await response.text();
      const linkRegex = /<link[^>]+href="(https?:\/\/(?:www\.)?reddit\.com\/r\/[^/]+\/comments\/[^"]+)"/gi;
      const threadUrls: string[] = [];
      let match;
      
      while ((match = linkRegex.exec(xml)) !== null) {
        const url = match[1];
        if (!threadUrls.includes(url)) {
          threadUrls.push(url);
        }
      }

      console.log(`[RedditSearch] RSS search found ${threadUrls.length} threads. Fetching top 2...`);
      const enrichedThreads: RedditThreadResult[] = [];
      let totalComments = 0;
      const combinedTextParts: string[] = [];

      const targetUrls = threadUrls.slice(0, 2);
      for (const url of targetUrls) {
        let threadRssUrl = url;
        if (threadRssUrl.endsWith('/')) {
          threadRssUrl = threadRssUrl.slice(0, -1);
        }
        if (!threadRssUrl.endsWith('.rss')) {
          threadRssUrl += '.rss';
        }

        try {
          const threadResponse = await fetch(threadRssUrl, {
            headers: { 'User-Agent': `clearpick-search:v1.0.0 (by /u/clearpick_dev)` },
            signal: AbortSignal.timeout(5000),
          });

          if (threadResponse.ok) {
            const threadXml = await threadResponse.text();
            const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
            let entryMatch;
            const comments: RedditComment[] = [];

            while ((entryMatch = entryRegex.exec(threadXml)) !== null) {
              const entryContent = entryMatch[1];
              const authorMatch = /<author><name>([^<]+)<\/name>/i.exec(entryContent);
              const contentMatch = /<content[^>]*>([\s\S]*?)<\/content>/i.exec(entryContent);

              if (authorMatch && contentMatch) {
                const author = authorMatch[1];
                let bodyHtml = contentMatch[1];
                const bodyClean = bodyHtml
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&amp;/g, '&')
                  .replace(/&quot;/g, '"')
                  .replace(/&#x27;/g, "'")
                  .replace(/<[^>]+>/g, '')
                  .trim();

                if (bodyClean.length > 10 && !author.toLowerCase().includes('bot') && author.toLowerCase() !== 'automoderator') {
                  comments.push({
                    author,
                    body: bodyClean,
                    score: 0,
                  });
                }
              }
            }

            enrichedThreads.push({
              title: 'Reddit Thread',
              url,
              snippet: '',
              comments,
            });

            totalComments += comments.length;
            combinedTextParts.push(`Thread URL: ${url}`);
            for (const c of comments) {
              combinedTextParts.push(`Comment by ${c.author}: ${c.body}`);
            }
          }
        } catch (threadErr) {
          console.warn(`[RedditSearch] RSS fetch failed for thread ${url}:`, threadErr);
        }
      }

      if (enrichedThreads.length > 0) {
        const allCommentsText = combinedTextParts.join('\n\n');
        const lowData = totalComments < 15;
        return {
          query: productName,
          threads: enrichedThreads,
          allCommentsText,
          commentCount: totalComments,
          lowData,
        };
      }
    }
  } catch (rssErr) {
    console.warn('[RedditSearch] RSS search fallback failed:', rssErr);
  }

  // ── Step 3: Direct API / DDG Fallbacks (Legacy) ──
  try {
    console.log('[RedditSearch] Trying DDG search fallback...');
    const query = `${productName} site:reddit.com`;
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const html = await response.text();
      const results: { url: string; title: string; snippet: string }[] = [];
      const seen = new Set<string>();
      const directRegex = /class="result-link"\s+href="(https?:\/\/(?:www\.)?reddit\.com\/r\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      
      while ((match = directRegex.exec(html)) !== null) {
        const url = match[1];
        const title = match[2].replace(/<[^>]+>/g, '').trim();
        const cleanUrl = url.split('&')[0].replace(/\/$/, '');
        if (cleanUrl.toLowerCase().includes('/comments/') && !seen.has(cleanUrl)) {
          seen.add(cleanUrl);
          results.push({ url: cleanUrl, title: title, snippet: '' });
        }
      }

      if (results.length > 0) {
        console.log(`[RedditSearch] DDG Lite GET succeeded with ${results.length} links`);
        const targetThreads = results.slice(0, 2);
        const enrichedThreads: RedditThreadResult[] = [];
        let totalComments = 0;
        const combinedTextParts: string[] = [];

        for (const t of targetThreads) {
          enrichedThreads.push({
            title: t.title,
            url: t.url,
            snippet: '',
            comments: [],
          });
          combinedTextParts.push(`Thread Title: ${t.title}\nThread URL: ${t.url}`);
        }

        return {
          query: productName,
          threads: enrichedThreads,
          allCommentsText: combinedTextParts.join('\n\n'),
          commentCount: enrichedThreads.length,
          lowData: true,
        };
      }
    }
  } catch (ddgErr) {
    console.warn('[RedditSearch] DDG search fallback failed:', ddgErr);
  }

  // ── Step 4: Full Fallback (No threads found) ──
  console.log('[RedditSearch] All scraping methods failed. Returning empty result.');
  return {
    query: productName,
    threads: [],
    allCommentsText: '',
    commentCount: 0,
    lowData: true,
  };
}
