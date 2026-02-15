import axios from 'axios';

// Smart API URL detection
const getAPIUrl = () => {
  // 1. Priority: Environment variable
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // 2. Production detection
  const hostname = window.location.hostname;
  const isProduction = hostname === 'www.clearpickai.com' || 
                       hostname === 'clearpickai.com' || 
                       hostname.includes('netlify.app') || 
                       hostname.includes('vercel.app');

  if (isProduction) {
    return 'https://10w0d94b94.onrender.com/api';
  }
  
  // 3. Fallback to localhost for development
  return 'http://localhost:3000/api';
};

const rawBaseUrl = getAPIUrl();
const API_BASE_URL = rawBaseUrl.replace(/\/api\/v1\/?$/i, '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Build product dossier (Reddit + AI + Cache + Images)
 * This is the main endpoint that uses SimpleDossierBuilder
 */
export const buildProduct = async (productName, category = 'general') => {
  const response = await api.post('/products/build', { 
    productName, 
    category 
  });
  return response.data;
};

/**
 * Build product dossier — raw version that returns full error responses
 * instead of throwing, so we can handle BRAND_DETECTED, NEEDS_DISAMBIGUATION, etc.
 */
export const buildProductRaw = async (productName, category = 'general') => {
  try {
    const resp = await fetch(`${API_BASE_URL}/products/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, category }),
    });
    return await resp.json();
  } catch (err) {
    return { success: false, error: err.message || 'Network error' };
  }
};

/**
 * Get product dossier by ID
 */
export const getProductDossier = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

/**
 * Search for existing products in DB
 */
export const searchProducts = async (query) => {
  const response = await api.get('/search', { 
    params: { q: query } 
  });
  return response.data;
};

/**
 * @deprecated Old search endpoint - use buildProduct instead
 */
export const searchProduct = async (query) => {
  console.warn('searchProduct is deprecated - use buildProduct instead');
  return buildProduct(query);
};

export const getSuggestions = async (query) => {
  // TODO: Implement suggestions based on popular searches
  throw new Error('Suggestions endpoint is not implemented yet');
};

/**
 * Get brand profile (Wikipedia-style)
 */
export const getBrandProfile = async (brandName) => {
  const response = await api.get(`/brands/${encodeURIComponent(brandName)}`);
  return response.data;
};

export default api;
