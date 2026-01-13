/**
 * Universal Image Service
 * 
 * מקורות תמונות (לפי סדר עדיפות):
 * 1. Apple OG Images (for Apple products) - FREE
 * 2. Unsplash API - FREE (50,000 requests/month)
 * 3. Pexels API - FREE (200 requests/hour)
 * 4. Bing Image Search API - FREE (1,000 transactions/month)
 * 5. Wikipedia - FREE (fallback)
 */

const axios = require('axios');

class UniversalImageService {
  constructor() {
    // API Keys (from environment)
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
    this.bingApiKey = process.env.BING_SEARCH_API_KEY;
    
    // API Endpoints
    this.unsplashSearchUrl = 'https://api.unsplash.com/search/photos';
    this.pexelsSearchUrl = 'https://api.pexels.com/v1/search';
    this.bingSearchUrl = 'https://api.bing.microsoft.com/v7.0/images/search';
    
    console.log('🖼️  Universal Image Service initialized:');
    console.log(`   Unsplash: ${this.unsplashAccessKey ? '✅' : '❌ (no API key)'}`);
    console.log(`   Pexels: ${this.pexelsApiKey ? '✅' : '❌ (no API key)'}`);
    console.log(`   Bing: ${this.bingApiKey ? '✅' : '❌ (no API key)'}`);
  }

  /**
   * Try Apple OG Images (for Apple products only)
   */
  async tryAppleOgImage(productName) {
    const lower = productName.toLowerCase();
    
    // Only for Apple products
    if (!lower.includes('iphone') && 
        !lower.includes('ipad') && 
        !lower.includes('macbook') && 
        !lower.includes('airpods') && 
        !lower.includes('apple watch') &&
        !lower.includes('imac') &&
        !lower.includes('mac mini') &&
        !lower.includes('mac pro') &&
        !lower.includes('mac studio')) {
      return null;
    }
    
    try {
      // Build specific Apple URL
      let slug = productName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      
      // Try specific model pages
      const possibleUrls = [
        `https://www.apple.com/shop/buy-${slug}`,
        `https://www.apple.com/${slug}`,
        `https://www.apple.com/shop/${slug}`
      ];
      
      for (const url of possibleUrls) {
        try {
          const response = await axios.get(url, { timeout: 5000 });
          const html = response.data;
          
          // Extract og:image
          const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
          
          if (ogImageMatch && ogImageMatch[1]) {
            console.log(`   ✅ Apple OG image found: ${url}`);
            return ogImageMatch[1];
          }
        } catch (e) {
          // Try next URL
          continue;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Search Unsplash for product images
   */
  async searchUnsplash(productName, perPage = 3) {
    if (!this.unsplashAccessKey) {
      return [];
    }
    
    try {
      const response = await axios.get(this.unsplashSearchUrl, {
        params: {
          query: productName,
          per_page: perPage,
          orientation: 'squarish'  // Better for product images
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        },
        timeout: 10000
      });
      
      const results = response.data.results || [];
      
      const images = results.map(img => ({
        url: img.urls.regular,
        thumbnail: img.urls.thumb,
        source: 'unsplash',
        type: 'stock',
        attribution: {
          author: img.user.name,
          authorUrl: img.user.links.html,
          downloadUrl: img.links.download_location
        }
      }));
      
      if (images.length > 0) {
        console.log(`   ✅ Unsplash: Found ${images.length} images`);
      }
      
      return images;
    } catch (error) {
      console.warn(`   ⚠️ Unsplash search failed:`, error.message);
      return [];
    }
  }

  /**
   * Search Pexels for product images
   */
  async searchPexels(productName, perPage = 3) {
    if (!this.pexelsApiKey) {
      return [];
    }
    
    try {
      const response = await axios.get(this.pexelsSearchUrl, {
        params: {
          query: productName,
          per_page: perPage,
          orientation: 'square'
        },
        headers: {
          'Authorization': this.pexelsApiKey
        },
        timeout: 10000
      });
      
      const results = response.data.photos || [];
      
      const images = results.map(img => ({
        url: img.src.large,
        thumbnail: img.src.medium,
        source: 'pexels',
        type: 'stock',
        attribution: {
          author: img.photographer,
          authorUrl: img.photographer_url,
          photoUrl: img.url
        }
      }));
      
      if (images.length > 0) {
        console.log(`   ✅ Pexels: Found ${images.length} images`);
      }
      
      return images;
    } catch (error) {
      console.warn(`   ⚠️ Pexels search failed:`, error.message);
      return [];
    }
  }

  /**
   * Search Bing Images
   */
  async searchBing(productName, count = 3) {
    if (!this.bingApiKey) {
      return [];
    }
    
    try {
      const response = await axios.get(this.bingSearchUrl, {
        params: {
          q: productName,
          count: count,
          imageType: 'Photo',
          safeSearch: 'Moderate'
        },
        headers: {
          'Ocp-Apim-Subscription-Key': this.bingApiKey
        },
        timeout: 10000
      });
      
      const results = response.data.value || [];
      
      const images = results.map(img => ({
        url: img.contentUrl,
        thumbnail: img.thumbnailUrl,
        source: 'bing',
        type: 'search',
        attribution: {
          hostPageUrl: img.hostPageUrl,
          hostPageDisplayUrl: img.hostPageDisplayUrl
        }
      }));
      
      if (images.length > 0) {
        console.log(`   ✅ Bing: Found ${images.length} images`);
      }
      
      return images;
    } catch (error) {
      console.warn(`   ⚠️ Bing search failed:`, error.message);
      return [];
    }
  }

  /**
   * Search Wikipedia for images (fallback)
   */
  async searchWikipedia(productName) {
    try {
      // Search for Wikipedia page
      const searchResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: productName,
          format: 'json',
          srlimit: 1
        },
        timeout: 10000
      });
      
      const searchResults = searchResponse.data?.query?.search || [];
      if (searchResults.length === 0) return [];
      
      const pageTitle = searchResults[0].title;
      
      // Get images from page
      const imagesResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          titles: pageTitle,
          prop: 'images',
          format: 'json'
        },
        timeout: 10000
      });
      
      const pages = imagesResponse.data?.query?.pages || {};
      const page = Object.values(pages)[0];
      const images = page?.images || [];
      
      if (images.length === 0) return [];
      
      // Get image URLs
      const imageUrls = [];
      for (const img of images.slice(0, 3)) {
        try {
          const infoResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
              action: 'query',
              titles: img.title,
              prop: 'imageinfo',
              iiprop: 'url',
              format: 'json'
            },
            timeout: 5000
          });
          
          const infoPages = infoResponse.data?.query?.pages || {};
          const infoPage = Object.values(infoPages)[0];
          const imageUrl = infoPage?.imageinfo?.[0]?.url;
          
          if (imageUrl && !imageUrl.includes('.svg')) {
            imageUrls.push({
              url: imageUrl,
              thumbnail: imageUrl,
              source: 'wikipedia',
              type: 'encyclopedia',
              attribution: {
                pageTitle,
                pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`
              }
            });
          }
        } catch (e) {
          // Skip this image
          continue;
        }
      }
      
      if (imageUrls.length > 0) {
        console.log(`   ✅ Wikipedia: Found ${imageUrls.length} images`);
      }
      
      return imageUrls;
    } catch (error) {
      console.warn(`   ⚠️ Wikipedia search failed:`, error.message);
      return [];
    }
  }

  /**
   * Get multiple images from all sources
   */
  async getMultipleImages(productName, maxImages = 5) {
    if (!productName || !String(productName).trim()) {
      return [];
    }
    
    console.log(`\n🖼️  Universal Image Service: Searching for "${productName}"...`);
    
    const allImages = [];
    
    // 1. Try Apple OG first (for Apple products)
    try {
      const appleImage = await this.tryAppleOgImage(productName);
      if (appleImage) {
        allImages.push({
          url: appleImage,
          source: 'apple',
          type: 'official',
          isPrimary: true
        });
        console.log(`   ✅ Apple: Official product image found`);
      }
    } catch (e) {
      console.warn(`   ⚠️ Apple OG failed:`, e.message);
    }
    
    // 2. Unsplash (high-quality stock photos)
    if (allImages.length < maxImages) {
      try {
        const unsplashImages = await this.searchUnsplash(productName, maxImages - allImages.length);
        allImages.push(...unsplashImages);
      } catch (e) {
        console.warn(`   ⚠️ Unsplash failed:`, e.message);
      }
    }
    
    // 3. Pexels (more stock photos)
    if (allImages.length < maxImages) {
      try {
        const pexelsImages = await this.searchPexels(productName, maxImages - allImages.length);
        allImages.push(...pexelsImages);
      } catch (e) {
        console.warn(`   ⚠️ Pexels failed:`, e.message);
      }
    }
    
    // 4. Bing (web search)
    if (allImages.length < maxImages) {
      try {
        const bingImages = await this.searchBing(productName, maxImages - allImages.length);
        allImages.push(...bingImages);
      } catch (e) {
        console.warn(`   ⚠️ Bing failed:`, e.message);
      }
    }
    
    // 5. Wikipedia (fallback)
    if (allImages.length < maxImages) {
      try {
        const wikiImages = await this.searchWikipedia(productName);
        allImages.push(...wikiImages);
      } catch (e) {
        console.warn(`   ⚠️ Wikipedia failed:`, e.message);
      }
    }
    
    console.log(`\n✅ Total images found: ${allImages.length}`);
    
    return allImages.slice(0, maxImages);
  }

  /**
   * Get single best image (for backward compatibility)
   */
  async getImageUrl(productName) {
    const images = await this.getMultipleImages(productName, 1);
    return images.length > 0 ? images[0].url : null;
  }
}

module.exports = new UniversalImageService();
