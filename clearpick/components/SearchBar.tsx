// =============================================================================
// ClearPick.ai — SearchBar with Live Intent Hints
// Uses useSearchIntent hook for real-time feedback as user types
// =============================================================================

'use client';

import { useState, useCallback, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchIntent } from '@/hooks/useSearchIntent';

interface SearchBarProps {
  /** Pre-filled query (e.g., from URL params) */
  initialQuery?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Compact mode for header/nav usage */
  compact?: boolean;
}

const INTENT_HINTS = {
  brand: {
    icon: '🏢',
    label: 'Brand',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
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

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;

      // If intent says it's a brand, navigate directly to brand page
      if (intent?.type === 'brand' && intent.slug) {
        router.push(`/brand/${intent.slug}`);
        return;
      }

      // All other intents → search page
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [query, intent, router],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // ── Intent hint rendering ─────────────────────────────────────────────

  const showHint = isFocused && query.trim().length > 0 && intent && !isPending;
  const isGarbage = intent?.type === 'garbage';

  return (
    <div className={`relative w-full ${compact ? 'max-w-md' : 'max-w-2xl'} mx-auto`}>
      {/* Search form */}
      <form onSubmit={handleSubmit} className="relative">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on hint pill
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for a product, brand, or category..."
          autoFocus={autoFocus}
          className={`
            w-full rounded-2xl border border-gray-200 bg-white
            ${compact ? 'py-2.5 pl-10 pr-12 text-sm' : 'py-3.5 pl-12 pr-14 text-base'}
            shadow-sm
            transition-all duration-200
            placeholder:text-gray-400
            focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-50
            ${isFocused ? 'border-blue-300 shadow-md' : ''}
          `}
        />

        {/* Submit button */}
        <button
          type="submit"
          className={`
            absolute inset-y-0 right-0 flex items-center
            ${compact ? 'pr-3' : 'pr-4'}
            text-gray-400 transition-colors hover:text-blue-500
          `}
          aria-label="Search"
        >
          <svg
            className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </form>

      {/* ── Intent Hint Pill ─────────────────────────────────────────────── */}
      {showHint && (
        <div
          className={`
            absolute left-0 right-0 z-20
            ${compact ? 'mt-1.5' : 'mt-2'}
            flex items-center gap-2 overflow-hidden
            animate-in fade-in slide-in-from-top-1 duration-200
          `}
        >
          {/* Pending spinner */}
          {isPending && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 shadow-sm">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
              Detecting...
            </span>
          )}

          {/* Intent pill */}
          {!isPending && intent && (
            <>
              {intent.type === 'brand' && intent.slug ? (
                <button
                  type="button"
                  onClick={() => router.push(`/brand/${intent.slug}`)}
                  className={`
                    inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs
                    font-medium shadow-sm transition-all duration-150
                    hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                    cursor-pointer
                    ${INTENT_HINTS.brand.color}
                  `}
                >
                  <span className="truncate">{INTENT_HINTS.brand.icon}</span>
                  <span className="truncate">Brand — view {intent.matchedBrand?.name} page →</span>
                </button>
              ) : (
                <span
                  className={`
                    inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs
                    font-medium shadow-sm
                    ${INTENT_HINTS[intent.type].color}
                    ${isGarbage ? 'animate-pulse' : ''}
                  `}
                >
                  <span>{INTENT_HINTS[intent.type].icon}</span>
                  <span>{INTENT_HINTS[intent.type].label}</span>
                </span>
              )}

              {/* Confidence indicator */}
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
