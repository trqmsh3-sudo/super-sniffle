import { useState } from 'react';
import { searchProduct } from '../services/api';
import toast from 'react-hot-toast';

export const useProductSearch = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const search = async (query) => {
    if (!query || query.trim().length < 2) {
      toast.error('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchProduct(query);
      
      if (data.success) {
        setResult(data.data);
        if (data.cached) {
          toast.success('Results loaded from cache');
        } else {
          toast.success('Analysis complete!');
        }
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return {
    loading,
    result,
    error,
    search,
    reset,
  };
};
