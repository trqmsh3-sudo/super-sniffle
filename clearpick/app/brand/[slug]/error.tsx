'use client';

import { useEffect } from 'react';
import SearchBar from '@/components/SearchBar';

export default function BrandError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Brand page error:', error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-24">
      <div className="text-center max-w-lg">
        <div className="text-6xl font-bold text-orange-500 mb-4">!</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Could not load this brand page
        </h1>
        <p className="text-slate-400 mb-8">
          We had trouble fetching product data for this brand. This might be a
          temporary issue — please try again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            Try again
          </button>
          <a
            href="/search"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
          >
            Search for brands
          </a>
        </div>

        <div className="max-w-md mx-auto">
          <SearchBar />
        </div>
      </div>
    </main>
  );
}
