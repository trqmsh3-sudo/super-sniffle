// =============================================================================
// ClearPick.ai — AI Insight Block
// Highlighted card above results with AI summary
// Light blue background, AI badge icon
// =============================================================================

'use client';

interface AIInsightProps {
  query: string;
  resultCount: number;
  topProduct?: string;
  priceRange?: string;
}

export default function AIInsight({
  query,
  resultCount,
  topProduct,
  priceRange,
}: AIInsightProps) {
  if (resultCount === 0) return null;

  return (
    <div className="animate-fade-in mb-6 rounded-card border border-primary-100 bg-gradient-to-br from-primary-50 to-blue-50 p-5">
      <div className="flex items-start gap-3">
        {/* AI Badge */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-800 shadow-md">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-md bg-primary-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              AI Insight
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">
            Based on <span className="font-semibold text-primary-800">{resultCount.toLocaleString()} results</span> for
            {' '}&ldquo;<span className="font-medium text-gray-900">{query}</span>&rdquo;
            {topProduct && (
              <>
                , the top pick is <span className="font-semibold text-primary-800">{topProduct}</span>
              </>
            )}
            {priceRange && (
              <>
                {' '}with prices ranging {priceRange}
              </>
            )}
            . Results are sourced from verified review sites including TechRadar, CNET, Tom&apos;s Guide, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
