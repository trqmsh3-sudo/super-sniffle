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

export const searchProduct = async (query) => {
  const response = await api.post('/products/search', { query });
  return response.data;
};

export const getSuggestions = async (query) => {
  throw new Error('Suggestions endpoint is not implemented yet');
};

export default api;
