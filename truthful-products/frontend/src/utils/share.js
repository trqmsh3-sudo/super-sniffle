/**
 * Share utilities
 * Handles sharing and bookmarking functionality
 */

/**
 * Share product using native share API or fallback to clipboard
 * @param {object} product - Product object
 * @param {object} scores - Product scores
 * @returns {Promise<object>} Result object with success status
 */
export const shareProduct = async (product, scores) => {
  const url = window.location.href;
  const title = `${product.name} - ניתוח ClearPick.ai`;
  const text = `בדקתי את ${product.name} ב-ClearPick.ai - ציון ${scores.overall}/100!\n\n`;
  
  // Try native share API first (works on mobile)
  if (navigator.share) {
    try {
      await navigator.share({ 
        title, 
        text, 
        url 
      });
      return { success: true, method: 'native' };
    } catch (error) {
      // User cancelled or error occurred
      if (error.name === 'AbortError') {
        return { success: false, error: 'Share cancelled by user' };
      }
      console.warn('Native share failed:', error);
      // Fall through to clipboard
    }
  }
  
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: 'clipboard', message: 'הקישור הועתק! 📋' };
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    return { success: false, error: 'Failed to copy to clipboard' };
  }
};

/**
 * Share to WhatsApp
 * @param {object} product - Product object
 * @param {object} scores - Product scores
 */
export const shareToWhatsApp = (product, scores) => {
  const url = window.location.href;
  const text = `בדקתי את ${product.name} ב-ClearPick.ai - ציון ${scores.overall}/100!\n\n${url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Share to Facebook
 * @param {string} url - URL to share
 */
export const shareToFacebook = (url = window.location.href) => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=600,height=400');
};

/**
 * Share to Twitter
 * @param {object} product - Product object
 * @param {object} scores - Product scores
 */
export const shareToTwitter = (product, scores) => {
  const url = window.location.href;
  const text = `בדקתי את ${product.name} ב-ClearPick.ai - ציון ${scores.overall}/100! 🎯`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
};

/**
 * Toggle bookmark for a product
 * @param {string|number} productId - Product ID
 * @param {string} productName - Product name
 * @param {object} scores - Product scores (optional)
 * @returns {object} Result object with bookmarked status
 */
export const toggleBookmark = (productId, productName, scores = null) => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  
  const existingIndex = bookmarks.findIndex(b => String(b.productId) === String(productId));
  
  if (existingIndex !== -1) {
    // Remove bookmark
    bookmarks.splice(existingIndex, 1);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    return { bookmarked: false };
  } else {
    // Add bookmark
    const newBookmark = {
      productId: String(productId),
      productName,
      bookmarkedAt: new Date().toISOString(),
      scores: scores || null
    };
    
    bookmarks.unshift(newBookmark);
    
    // Keep only last 50 bookmarks
    const trimmed = bookmarks.slice(0, 50);
    localStorage.setItem('bookmarks', JSON.stringify(trimmed));
    
    return { bookmarked: true };
  }
};

/**
 * Get all bookmarks
 * @returns {Array} Array of bookmark objects
 */
export const getBookmarks = () => {
  try {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]');
  } catch (error) {
    console.error('Failed to get bookmarks:', error);
    return [];
  }
};

/**
 * Check if product is bookmarked
 * @param {string|number} productId - Product ID
 * @returns {boolean} True if bookmarked
 */
export const isBookmarked = (productId) => {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => String(b.productId) === String(productId));
};

/**
 * Clear all bookmarks
 */
export const clearAllBookmarks = () => {
  localStorage.removeItem('bookmarks');
  return { success: true, message: 'All bookmarks cleared' };
};

/**
 * Export bookmarks as JSON (for backup)
 * @returns {string} JSON string of bookmarks
 */
export const exportBookmarks = () => {
  const bookmarks = getBookmarks();
  return JSON.stringify(bookmarks, null, 2);
};

/**
 * Import bookmarks from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {object} Result object
 */
export const importBookmarks = (jsonString) => {
  try {
    const imported = JSON.parse(jsonString);
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format - expected array');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(imported));
    return { success: true, count: imported.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
