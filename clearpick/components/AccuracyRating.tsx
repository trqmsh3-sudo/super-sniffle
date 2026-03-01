// =============================================================================
// ClearPick.ai — Accuracy Rating Widget (v2)
// Floating bottom-right card · 2s delayed appearance · localStorage dedup
// Auto-dismiss after submission · Mobile slide-up sheet
// =============================================================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AccuracyRatingProps {
  /** The search query this rating applies to */
  query: string;
  /** Pre-existing average accuracy (if cached result) */
  averageAccuracy?: number;
  /** Total ratings so far */
  totalRatings?: number;
  /** Called after successful submission */
  onRated?: (newAverage: number) => void;
  /** Delay before showing (ms, default: 2000) */
  delay?: number;
}

const STORAGE_PREFIX = 'clearpick:rated:';

function hasAlreadyRated(query: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${query.trim().toLowerCase()}`) === '1';
  } catch {
    return false;
  }
}

function markAsRated(query: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${query.trim().toLowerCase()}`, '1');
  } catch {
    // localStorage may be full or blocked
  }
}

export default function AccuracyRating({
  query,
  averageAccuracy,
  totalRatings = 0,
  onRated,
  delay = 2000,
}: AccuracyRatingProps) {
  const [visible, setVisible] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Delayed appearance ──────────────────────────────────────────────────

  useEffect(() => {
    // Don't show if already rated this query
    if (hasAlreadyRated(query)) {
      setDismissed(true);
      return;
    }

    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  // ── Auto-dismiss after submission ───────────────────────────────────────

  useEffect(() => {
    if (submitted) {
      dismissTimer.current = setTimeout(() => setDismissed(true), 2500);
      return () => {
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
      };
    }
  }, [submitted]);

  // ── Submit handler ────────────────────────────────────────────────────

  const submitRating = useCallback(
    async (rating: number) => {
      setSelectedRating(rating);
      setIsSubmitting(true);
      setError(null);

      try {
        const res = await fetch('/api/rate-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, rating }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to submit');
        }

        const data = await res.json();
        markAsRated(query);
        setSubmitted(true);
        onRated?.(data.averageAccuracy);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save rating.');
        setSelectedRating(0);
      } finally {
        setIsSubmitting(false);
      }
    },
    [query, onRated],
  );

  // ── Don't render if already rated or manually dismissed ─────────────

  if (dismissed || !visible) return null;

  // ── Thank-you state ─────────────────────────────────────────────────

  if (submitted) {
    return (
      <div
        className="
          fixed bottom-4 right-4 z-50
          sm:bottom-6 sm:right-6
          animate-in fade-in slide-in-from-bottom-4 duration-300
        "
      >
        <div className="flex items-center gap-2.5 rounded-2xl border border-green-100 bg-white px-5 py-3 shadow-xl">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
            <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="text-sm font-medium text-green-700">Thanks!</span>
        </div>
      </div>
    );
  }

  // ── Main rating widget ──────────────────────────────────────────────

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
        sm:bottom-6 sm:right-6 sm:left-auto
        animate-in fade-in slide-in-from-bottom-4 duration-500
      "
    >
      <div
        className="
          rounded-t-2xl border border-gray-100 bg-white px-5 pb-5 pt-4 shadow-2xl
          sm:rounded-2xl sm:w-80
        "
      >
        {/* Header row */}
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-gray-800">
            How accurate were these results?
          </p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="ml-2 -mr-1 -mt-1 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stars */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoveredStar || selectedRating);
            return (
              <button
                key={star}
                type="button"
                disabled={isSubmitting}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => submitRating(star)}
                className={`
                  rounded-lg p-1 transition-all duration-150
                  hover:scale-125 active:scale-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                  disabled:opacity-50 disabled:hover:scale-100
                `}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <svg
                  className={`h-8 w-8 transition-colors duration-150 ${
                    active ? 'text-amber-400 drop-shadow-sm' : 'text-gray-200'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Star label */}
        <div className="mt-1 text-center text-xs text-gray-400">
          {hoveredStar > 0
            ? ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][hoveredStar]
            : '\u00A0'}
        </div>

        {/* Existing average */}
        {averageAccuracy !== undefined && averageAccuracy > 0 && (
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Community avg: {averageAccuracy.toFixed(1)}/5 ({totalRatings}{' '}
            {totalRatings === 1 ? 'rating' : 'ratings'})
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-2 text-center text-xs text-red-500">{error}</p>
        )}

        {/* Loading */}
        {isSubmitting && (
          <div className="mt-2 flex justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
