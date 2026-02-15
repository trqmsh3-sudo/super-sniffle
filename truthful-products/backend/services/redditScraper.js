const axios = require('axios');

/**
 * Reddit Scraper Service
 * 
 * חופשי לחלוטין! Reddit מאפשר גישה ל-JSON ללא API key:
 * https://www.reddit.com/r/subreddit/search.json?q=query
 * 
 * Rate Limiting: 1 request per second (כדי לא להיחסם)
 */
class RedditScraper {
  constructor() {
    this.baseUrl = 'https://www.reddit.com';
    this.userAgent = 'ClearPick.ai/2.0 (product reviews aggregator; https://www.clearpickai.com)';
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
    
    // Subreddits רלוונטיים לביקורות מוצרים
    this.productSubreddits = [
      'BuyItForLife',           // מוצרים עמידים ואיכותיים
      'ProductReviews',         // ביקורות כלליות
      'headphones',             // אוזניות
      'audiophile',             // אודיו איכותי
      'HomeAutomation',         // בית חכם
      'hometheater',            // קולנוע ביתי
      'technology',             // טכנולוגיה כללית
      'gadgets',                // גאדג'טים
      'Android',                // אנדרואיד
      'apple',                  // Apple
      'iPhone',                 // iPhone ספציפי
      'samsung',                // Samsung
      'vacuums',                // שואבי אבק
      'homeappliances',         // מכשירי חשמל
      'speakers',               // רמקולים
      'Bluetooth_Speakers',     // רמקולים Bluetooth
      'SmartSpeakers',          // רמקולים חכמים
      'Appliances',             // מכשירי חשמל
      'Cooking',                // בישול (מחבתות, סירים)
      'reviews',                // ביקורות כלליות
    ];
  }

  /**
   * Rate limiting - חכה 1 שנייה בין בקשות
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * חיפוש בsubreddit בודד
   */
  async scrapeSubreddit(productName, subreddit, limit = 25) {
    try {
      await this.waitForRateLimit();
      
      const url = `${this.baseUrl}/r/${subreddit}/search.json`;
      const params = {
        q: productName,
        restrict_sr: 'on',  // חיפוש רק בsubreddit הזה
        sort: 'relevance',
        limit: limit,
        t: 'all'  // all time
      };
      
      console.log(`🔍 Searching r/${subreddit} for "${productName}"...`);
      
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 10000
      });
      
      const posts = response.data?.data?.children || [];
      const filtered = this.filterRelevantPosts(posts, productName);
      
      console.log(`   ✓ Found ${filtered.length} relevant posts in r/${subreddit}`);
      
      return filtered.map(post => ({
        title: post.data.title,
        content: post.data.selftext || '',
        score: post.data.score,
        upvoteRatio: post.data.upvote_ratio,
        numComments: post.data.num_comments,
        author: post.data.author,
        subreddit: post.data.subreddit,
        created: new Date(post.data.created_utc * 1000),
        url: `https://reddit.com${post.data.permalink}`,
        source: 'reddit',
        relevanceScore: this.calculateRelevance(post, productName)
      }));
      
    } catch (error) {
      console.warn(`   ⚠️ Failed to scrape r/${subreddit}: ${error.message}`);
      return [];
    }
  }

  /**
   * סינון פוסטים רלוונטיים — V2.0
   * Keep model numbers! "JBL Flip 6" must match all 3 words, not just "jbl" + "flip"
   */
  filterRelevantPosts(posts, productName) {
    const nameLower = productName.toLowerCase().trim();
    // Keep ALL words including short ones (model numbers like "6", "S24", "X5")
    const productWords = nameLower.split(/\s+/).filter(Boolean);
    // Brand is typically the first word
    const brand = productWords[0] || '';
    // The rest is the model identifier
    const modelWords = productWords.slice(1);
    
    return posts.filter(post => {
      const data = post.data;
      
      // Basic filters
      if (!data.selftext || data.selftext.length < 50) return false;
      if (data.score < 2) return false;
      if (data.author === '[deleted]') return false;
      
      const textToCheck = (data.title + ' ' + data.selftext).toLowerCase();
      
      // BEST: Exact product name appears as a phrase (e.g. "jbl flip 6")
      if (textToCheck.includes(nameLower)) return true;
      
      // GOOD: All product words appear somewhere in the text
      const allMatch = productWords.every(word => textToCheck.includes(word));
      if (allMatch) return true;
      
      // ACCEPTABLE: Brand matches + most model words match (handles minor variations)
      if (brand && textToCheck.includes(brand) && modelWords.length > 0) {
        const modelMatchCount = modelWords.filter(w => textToCheck.includes(w)).length;
        if (modelMatchCount >= Math.ceil(modelWords.length * 0.7)) return true;
      }
      
      // REJECT everything else — no partial/random matches
      return false;
    });
  }

  /**
   * חישוב ציון רלוונטיות
   */
  calculateRelevance(post, productName) {
    const data = post.data;
    const nameLower = productName.toLowerCase().trim();
    const productWords = nameLower.split(/\s+/).filter(Boolean);
    const text = (data.title + ' ' + data.selftext).toLowerCase();
    
    let score = 0;
    
    // Exact name match bonus (huge) — post is definitely about this product
    if (text.includes(nameLower)) {
      score += 40;
    }
    
    // Title match bonus — if product name is in the title, it's very relevant
    if (data.title.toLowerCase().includes(nameLower)) {
      score += 25;
    }
    
    // Word-level match (0-20 points)
    const matchCount = productWords.filter(word => text.includes(word)).length;
    score += (matchCount / productWords.length) * 20;
    
    // Upvotes (0-10 נקודות)
    score += Math.min(10, data.score / 10);
    
    // Comments (0-5 נקודות)
    score += Math.min(5, data.num_comments / 5);
    
    return Math.round(score);
  }

  /**
   * חיפוש במספר subreddits
   */
  async scrapeMultipleSubreddits(productName, subreddits = null, postsPerSubreddit = 10) {
    const subsToSearch = subreddits || this.productSubreddits;
    
    console.log(`\n🕷️ Reddit Scraper: Searching ${subsToSearch.length} subreddits for "${productName}"`);
    
    const allPosts = [];
    
    for (const subreddit of subsToSearch) {
      const posts = await this.scrapeSubreddit(productName, subreddit, postsPerSubreddit);
      allPosts.push(...posts);
    }
    
    // מיון לפי relevance score
    allPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    console.log(`\n✅ Reddit Scraper: Found ${allPosts.length} total posts`);
    console.log(`   Top relevance scores: ${allPosts.slice(0, 5).map(p => p.relevanceScore).join(', ')}`);
    
    return allPosts;
  }

  /**
   * חיפוש חכם - מנסה subreddits ספציפיים לפי קטגוריה
   */
  async smartSearch(productName, category = null) {
    let targetSubreddits = [...this.productSubreddits];
    
    // אם יש קטגוריה, נוסיף subreddits ספציפיים
    if (category) {
      const categoryMap = {
        'headphones': ['headphones', 'audiophile', 'Bluetooth_Speakers'],
        'speakers': ['speakers', 'Bluetooth_Speakers', 'SmartSpeakers', 'audiophile'],
        'smartphones': ['Android', 'apple', 'iPhone', 'samsung', 'technology'],
        'appliances': ['homeappliances', 'Appliances', 'Cooking', 'vacuums'],
        'vacuums': ['vacuums', 'homeappliances', 'BuyItForLife'],
        'audio': ['audiophile', 'headphones', 'speakers', 'hometheater']
      };
      
      const categorySubs = categoryMap[category.toLowerCase()] || [];
      targetSubreddits = [...new Set([...categorySubs, ...targetSubreddits])];  // de-dupe
    }
    
    // חיפוש ב-10 subreddits הראשונים (כדי לא לקחת יותר מדי זמן)
    return await this.scrapeMultipleSubreddits(productName, targetSubreddits.slice(0, 10), 15);
  }

  /**
   * חילוץ insights מפוסטים (לשימוש ב-Data Aggregator)
   */
  extractInsights(posts) {
    if (posts.length === 0) {
      return {
        totalPosts: 0,
        avgScore: 0,
        avgUpvoteRatio: 0,
        topKeywords: [],
        sentiment: 'unknown'
      };
    }
    
    const totalScore = posts.reduce((sum, p) => sum + p.score, 0);
    const totalRatio = posts.reduce((sum, p) => sum + p.upvoteRatio, 0);
    
    // חילוץ keywords נפוצים
    const allText = posts.map(p => p.title + ' ' + p.content).join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter(w => w.length > 4);
    const wordFreq = {};
    words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
    
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    // Sentiment גס (לפי upvote ratio ממוצע)
    const avgRatio = totalRatio / posts.length;
    const sentiment = avgRatio > 0.7 ? 'positive' : avgRatio > 0.5 ? 'mixed' : 'negative';
    
    return {
      totalPosts: posts.length,
      avgScore: Math.round(totalScore / posts.length),
      avgUpvoteRatio: Math.round(avgRatio * 100) / 100,
      topKeywords,
      sentiment,
      subreddits: [...new Set(posts.map(p => p.subreddit))]
    };
  }
}

module.exports = new RedditScraper();
