import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
