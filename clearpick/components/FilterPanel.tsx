// =============================================================================
// ClearPick.ai — Filter Panel
// Desktop: sticky left sidebar · Mobile: bottom sheet drawer
// Price range, brand multi-select, rating, sort, reset
// =============================================================================

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
  priceMin: number;
  priceMax: number;
  brands: string[];
  minRating: number;
  sort: 'relevance' | 'price-asc' | 'price-desc' | 'rating';
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableBrands?: string[];
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 10000,
  brands: [],
  minRating: 0,
  sort: 'relevance',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function FilterPanel({
  filters,
  onChange,
  availableBrands = [],
  isMobile = false,
  isOpen = true,
  onClose,
}: FilterPanelProps) {
  const [localPriceMin, setLocalPriceMin] = useState(String(filters.priceMin || ''));
  const [localPriceMax, setLocalPriceMax] = useState(String(filters.priceMax === 10000 ? '' : filters.priceMax));
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync local price inputs when filters change externally
  useEffect(() => {
    setLocalPriceMin(String(filters.priceMin || ''));
    setLocalPriceMax(String(filters.priceMax === 10000 ? '' : filters.priceMax));
  }, [filters.priceMin, filters.priceMax]);

  const update = useCallback(
    (partial: Partial<FilterState>) => onChange({ ...filters, ...partial }),
    [filters, onChange],
  );

  const handlePriceApply = () => {
    update({
      priceMin: Number(localPriceMin) || 0,
      priceMax: Number(localPriceMax) || 10000,
    });
  };

  const handleReset = () => onChange(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.priceMin > 0 ||
    filters.priceMax < 10000 ||
    filters.brands.length > 0 ||
    filters.minRating > 0 ||
    filters.sort !== 'relevance';

  const content = (
    <div className="space-y-6">
      {/* ── Sort ──────────────────────────────────────────────────────── */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Sort by
        </label>
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as FilterState['sort'] })}
          className="w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-accent focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* ── Price Range ───────────────────────────────────────────────── */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Price range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localPriceMin}
            onChange={(e) => setLocalPriceMin(e.target.value)}
            onBlur={handlePriceApply}
            placeholder="Min"
            className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <span className="text-gray-300">—</span>
          <input
            type="number"
            value={localPriceMax}
            onChange={(e) => setLocalPriceMax(e.target.value)}
            onBlur={handlePriceApply}
            placeholder="Max"
            className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      {/* ── Rating Filter ─────────────────────────────────────────────── */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Minimum rating
        </label>
        <div className="flex gap-1">
          {[0, 3, 5, 7, 8].map((r) => (
            <button
              key={r}
              onClick={() => update({ minRating: r })}
              className={`
                rounded-lg px-3 py-2 text-xs font-medium transition-all
                ${filters.minRating === r
                  ? 'bg-primary-800 text-white'
                  : 'bg-surface-bg text-gray-600 hover:bg-surface-hover'
                }
              `}
            >
              {r === 0 ? 'All' : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Brand Multi-select ────────────────────────────────────────── */}
      {availableBrands.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Brands
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableBrands.slice(0, 12).map((brand) => {
              const selected = filters.brands.includes(brand);
              return (
                <button
                  key={brand}
                  onClick={() => {
                    const newBrands = selected
                      ? filters.brands.filter((b) => b !== brand)
                      : [...filters.brands, brand];
                    update({ brands: newBrands });
                  }}
                  className={`
                    rounded-full px-3 py-1.5 text-xs font-medium transition-all
                    ${selected
                      ? 'bg-primary-800 text-white'
                      : 'bg-surface-bg text-gray-600 hover:bg-surface-hover'
                    }
                  `}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Reset ─────────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          Reset all filters
        </button>
      )}
    </div>
  );

  // ── Mobile: Bottom Sheet Drawer ────────────────────────────────────────

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}

        {/* Drawer */}
        <div
          ref={panelRef}
          className={`
            fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto
            rounded-t-2xl border-t border-surface-border bg-white px-5 pb-8 pt-3
            transition-transform duration-300 ease-out md:hidden
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
        >
          {/* Drag handle */}
          <div className="mb-4 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {content}
        </div>
      </>
    );
  }

  // ── Desktop: Sticky Sidebar ────────────────────────────────────────────

  return (
    <aside className="sticky top-20 hidden w-64 shrink-0 md:block">
      <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Filters</h3>
        {content}
      </div>
    </aside>
  );
}
