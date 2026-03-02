// =============================================================================
// ClearPick.ai — SearchBar with Live Intent Hints
// Design system: rounded-card, primary colors, 8px grid spacing
// =============================================================================

'use client';

import { useState, useCallback, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchIntent } from '@/hooks/useSearchIntent';

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

const INTENT_HINTS = {
  brand: {
    icon: '🏢',
    label: 'Brand',
    color: 'bg-primary-50 text-primary-700 border-primary-200',
  },
  product: {
    icon: '📦',
    label: 'Product search',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  category: {
    icon: '📂',
    label: 'Category',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  garbage: {
    icon: '❓',
    label: 'Try a product or brand name',
    color: 'bg-red-50 text-red-500 border-red-200',
  },
  ambiguous: {
    icon: '🔍',
    label: 'Searching...',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
  },
} as const;

export default function SearchBar({
  initialQuery = '',
  autoFocus = false,
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { intent, isPending } = useSearchIntent(query, { debounce: 250 });

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;

      if (intent?.type === 'brand' && intent.slug) {
        router.push(`/brand/${intent.slug}`);
        return;
      }

      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [query, intent, router],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit],
  );

  const showHint = isFocused && query.trim().length > 0 && intent && !isPending;

  return (
    <div className={`relative w-full ${compact ? 'max-w-md' : 'max-w-[770px]'} mx-auto`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a product, brand, or category..."
          autoFocus={autoFocus}
          className={`
            w-full border bg-white
            ${compact
              ? 'rounded-xl py-2.5 pl-10 pr-12 text-sm'
              : 'rounded-[14px] py-4 pl-12 pr-14 text-base'
            }
            border-surface-border
            shadow-card
            transition-all duration-200
            placeholder:text-gray-400
            focus:border-accent focus:outline-none focus:ring-4 focus:ring-primary-100
            ${isFocused ? 'border-accent shadow-card-hover' : ''}
          `}
        />

        {/* Submit arrow */}
        <button
          type="submit"
          className={`
            absolute inset-y-0 right-0 flex items-center
            ${compact ? 'pr-3' : 'pr-4'}
            text-gray-400 transition-colors hover:text-accent
          `}
          aria-label="Search"
        >
          <svg className={compact ? 'h-4 w-4' : 'h-5 w-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </form>

      {/* Intent hint pill */}
      {showHint && (
        <div className={`absolute left-0 right-0 z-20 ${compact ? 'mt-1.5' : 'mt-2'} flex items-center gap-2`}>
          {isPending && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-3 py-1.5 text-xs text-gray-500 shadow-card">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-accent" />
              Detecting...
            </span>
          )}

          {!isPending && intent && (
            <>
              {intent.type === 'brand' && intent.slug ? (
                <button
                  type="button"
                  onClick={() => router.push(`/brand/${intent.slug}`)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-card transition-all hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${INTENT_HINTS.brand.color}`}
                >
                  <span>{INTENT_HINTS.brand.icon}</span>
                  <span>Brand — view {intent.matchedBrand?.name} page →</span>
                </button>
              ) : (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-card ${INTENT_HINTS[intent.type].color}`}>
                  <span>{INTENT_HINTS[intent.type].icon}</span>
                  <span>{INTENT_HINTS[intent.type].label}</span>
                </span>
              )}

              {intent.type !== 'garbage' && intent.confidence > 0 && (
                <span className="text-[10px] text-gray-400">
                  {Math.round(intent.confidence * 100)}% confident
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
