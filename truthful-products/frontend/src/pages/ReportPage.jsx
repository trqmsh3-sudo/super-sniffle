import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://clearpickai-backend.onrender.com';

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Fix URL structure to avoid double slashes and ensure /api prefix is handled
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        
        // Check if API_URL already includes /api (Render sometimes has it, sometimes not)
        const endpoint = baseUrl.endsWith('/api') 
           ? `${baseUrl}/products/${id}` 
           : `${baseUrl}/api/products/${id}`;

        console.log('Fetching report from:', endpoint); // For debugging
        
        const res = await fetch(endpoint);
        
        if (!res.ok) {
            if (res.status === 404) throw new Error('Product report not found (404).');
            throw new Error(`Server error: ${res.status}`);
        }
        
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error('Failed to fetch report:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id]);

  // --- Loading State ---
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #333', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px' }}>Analyzing product data...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Something went wrong</h2>
        <p style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</p>
        <button 
          onClick={() => navigate('/search')}
          style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
        >
          ← Return to Search
        </button>
      </div>
    );
  }

  if (!report) return null;

  // --- Success State (The Report) ---
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <button 
            onClick={() => navigate('/search')}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}
        >
            ← New Search
        </button>

        {/* Header */}
        <header style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0' }}>
                {report.productName}
            </h1>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#9ca3af' }}>
                {report.brand && <span>Brand: <strong style={{ color: '#fff' }}>{report.brand}</strong></span>}
                {report.category && <span>Category: <strong style={{ color: '#fff' }}>{report.category}</strong></span>}
            </div>
        </header>

        {/* Verdict Box */}
        {report.verdict && (
            <section style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', marginBottom: '30px' }}>
                <h2 style={{ color: '#60a5fa', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>
                    🤖 AI Verdict
                </h2>
                <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                    {report.verdict}
                </p>
            </section>
        )}

        {/* Pros & Cons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {/* Pros */}
            <div style={{ background: 'rgba(6, 78, 59, 0.2)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#34d399', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}>
                    ✅ The Good
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {report.pros?.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', fontSize: '0.95rem' }}>
                            <span style={{ marginRight: '10px', color: '#34d399' }}>•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Cons */}
            <div style={{ background: 'rgba(127, 29, 29, 0.2)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#f87171', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}>
                    ❌ The Bad
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {report.cons?.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', fontSize: '0.95rem' }}>
                            <span style={{ marginRight: '10px', color: '#f87171' }}>•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Warnings */}
        {report.warnings && report.warnings.length > 0 && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
             <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>⚠️ Warnings</h3>
             <ul style={{ paddingLeft: '20px', color: '#d1d5db' }}>
               {report.warnings.map((w, i) => <li key={i} style={{ marginBottom: '5px' }}>{w}</li>)}
             </ul>
          </div>
        )}

        {/* Sources Footer */}
        {report.sources && report.sources.length > 0 && (
          <div style={{ borderTop: '1px solid #333', paddingTop: '20px', marginTop: '40px' }}>
            <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '10px' }}>Sources Analyzed</h4>
            <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>
              {report.sources.map((s, i) => (
                <span key={i} style={{ display: 'inline-block', marginRight: '15px', marginBottom: '5px' }}>
                  {typeof s === 'string' ? s : (s.title || s.url)}
                </span>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
