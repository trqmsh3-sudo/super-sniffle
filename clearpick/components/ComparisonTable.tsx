// =============================================================================
// ClearPick.ai — Comparison Table
// Dynamic table for 2-3 selected products
// Rows: Score, Price, Description, Source
// =============================================================================

'use client';

interface CompareProduct {
  name: string;
  price?: string;
  rating: number;
  description?: string;
  source?: string;
  image?: string;
  pros?: string[];
  cons?: string[];
}

interface ComparisonTableProps {
  products: CompareProduct[];
  onRemove: (name: string) => void;
  onClear: () => void;
}

export default function ComparisonTable({
  products,
  onRemove,
  onClear,
}: ComparisonTableProps) {
  if (products.length < 2) return null;

  const rows: { label: string; render: (p: CompareProduct) => React.ReactNode }[] = [
    {
      label: 'Score',
      render: (p) => {
        const score = p.rating > 0 ? (p.rating > 5 ? p.rating : p.rating * 2).toFixed(1) : '—';
        return (
          <span className={`text-lg font-bold ${p.rating > 7 ? 'text-green-600' : p.rating > 5 ? 'text-amber-500' : 'text-gray-400'}`}>
            {score}
            {p.rating > 0 && <span className="text-xs font-normal text-gray-400">/10</span>}
          </span>
        );
      },
    },
    {
      label: 'Price',
      render: (p) => (
        <span className="text-base font-semibold text-primary-800">
          {p.price && p.price !== 'Unknown' ? p.price : '—'}
        </span>
      ),
    },
    {
      label: 'Summary',
      render: (p) => (
        <span className="text-xs leading-relaxed text-gray-600">
          {p.description || '—'}
        </span>
      ),
    },
    {
      label: 'Best for',
      render: (p) => {
        if (p.pros && p.pros.length > 0) {
          return <span className="text-xs text-green-600">{p.pros[0]}</span>;
        }
        return <span className="text-xs text-gray-400">—</span>;
      },
    },
    {
      label: 'Source',
      render: (p) => (
        <span className="text-xs text-gray-500">{p.source || '—'}</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in mb-8 overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Comparison ({products.length})
        </h3>
        <button
          onClick={onClear}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          Clear all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          {/* Product headers */}
          <thead>
            <tr className="border-b border-surface-border">
              <th className="w-28 px-5 py-3 text-left text-xs font-medium text-gray-400" />
              {products.map((p) => (
                <th key={p.name} className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {p.name}
                    </span>
                    <button
                      onClick={() => onRemove(p.name)}
                      className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-surface-border/50 last:border-0">
                <td className="px-5 py-3 text-xs font-medium text-gray-400">
                  {row.label}
                </td>
                {products.map((p) => (
                  <td key={p.name} className="px-4 py-3 text-center">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sticky Comparison Bar ────────────────────────────────────────────────────

interface CompareBarProps {
  count: number;
  onView: () => void;
  onClear: () => void;
}

export function CompareBar({ count, onView, onClear }: CompareBarProps) {
  if (count < 1) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 animate-slide-up">
      <div className="mx-auto max-w-content px-4 pb-4">
        <div className="flex items-center justify-between rounded-2xl border border-primary-200 bg-white px-5 py-3 shadow-card-hover">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              {count}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {count === 1 ? 'product selected' : 'products selected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              onClick={onView}
              disabled={count < 2}
              className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all ${
                count >= 2
                  ? 'bg-primary-800 hover:bg-primary-700 active:scale-[0.97]'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Compare {count >= 2 ? `(${count})` : '— select 2+'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
