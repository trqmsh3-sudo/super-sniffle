import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

// Hook לחיבור עם Backend API
export const useProductDossier = (productId) => {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const loadDossier = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setDossier(data.data);
        } else {
          throw new Error(data.error || 'Failed to load dossier');
        }
        
      } catch (err) {
        console.error('Error loading dossier:', err);
        setError(err.message);
        setDossier(null);
      } finally {
        setLoading(false);
      }
    };

    loadDossier();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadDossier, 30000);

    return () => clearInterval(interval);
  }, [productId]);

  return { dossier, loading, error };
};

export default useProductDossier;
