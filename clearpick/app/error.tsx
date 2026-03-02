'use client';

import { useEffect } from 'react';
import SearchBar from '@/components/SearchBar';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-surface-bg px-4 py-24">
      <div className="max-w-lg text-center">
        <div className="mb-4 text-6xl font-bold text-red-500">Oops</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-8 text-gray-500">
          An unexpected error occurred. Please try again or search for something
          else.
        </p>

        <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-xl bg-primary-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-xl border border-surface-border bg-white px-6 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Back to homepage
          </a>
        </div>

        <div className="mx-auto max-w-md">
          <SearchBar />
        </div>
      </div>
    </main>
  );
}
