import axios from 'axios';

// Smart API URL detection
const getAPIUrl = () => {
  // If explicitly set in env, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on hostname
  const hostname = window.location.hostname;
  if (hostname === 'www.clearpickai.com' || hostname === 'clearpickai.com') {
    return 'https://clearpick-ai.onrender.com/api';
  }
  if (hostname.includes('vercel.app')) {
    return 'https://clearpick-ai.onrender.com/api';
  }
  
  // Default to localhost for development
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

export default api;
