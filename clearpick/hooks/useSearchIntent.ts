// =============================================================================
// ClearPick.ai — useSearchIntent React Hook
// Debounced (300 ms) live intent detection as the user types
// =============================================================================

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { detectSearchIntent, type SearchIntent } from '@/lib/searchIntent';

interface UseSearchIntentOptions {
  /** Debounce delay in ms (default: 300) */
  debounce?: number;
}

interface UseSearchIntentReturn {
  /** Current intent result (null before first keystroke) */
  intent: SearchIntent | null;
  /** Whether the hook is waiting for debounce to settle */
  isPending: boolean;
  /** Manually trigger detection (bypasses debounce) */
  detectNow: (query: string) => SearchIntent;
}

export function useSearchIntent(
  query: string,
  options: UseSearchIntentOptions = {},
): UseSearchIntentReturn {
  const { debounce = 300 } = options;

  const [intent, setIntent] = useState<SearchIntent | null>(null);
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable reference for immediate detection
  const detectNow = useCallback((q: string): SearchIntent => {
    const result = detectSearchIntent(q);
    setIntent(result);
    setIsPending(false);
    return result;
  }, []);

  useEffect(() => {
    // Reset if query is empty
    if (!query || query.trim().length === 0) {
      setIntent(null);
      setIsPending(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    setIsPending(true);

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Debounce the detection
    timerRef.current = setTimeout(() => {
      const result = detectSearchIntent(query);
      setIntent(result);
      setIsPending(false);
    }, debounce);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, debounce]);

  return { intent, isPending, detectNow };
}
