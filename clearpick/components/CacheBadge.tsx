// =============================================================================
// ClearPick.ai — Cache Status Badge
// Pill indicator for search result freshness
// =============================================================================

'use client';

interface CacheBadgeProps {
  /** Cache state */
  status: 'cached' | 'fresh' | 'stale';
  /** Optional: when the result was cached (epoch ms) */
  cachedAt?: number | null;
  /** Compact mode — icon only on mobile */
  compact?: boolean;
}

const BADGE_CONFIG = {
  cached: {
    icon: '⚡',
    label: 'Instant',
    description: 'Served from cache',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  fresh: {
    icon: '🔄',
    label: 'Fresh',
    description: 'Just fetched',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  stale: {
    icon: '⚠️',
    label: 'Low accuracy',
    description: 'Results may be outdated',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
} as const;

function timeAgo(epochMs: number): string {
  const diff = Date.now() - epochMs;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CacheBadge({ status, cachedAt, compact }: CacheBadgeProps) {
  const cfg = BADGE_CONFIG[status];

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-3 py-1
        ${cfg.bg} ${cfg.border} ${cfg.text}
        text-xs font-medium select-none
        transition-all duration-200
      `}
      title={cfg.description}
    >
      {/* Animated dot */}
      <span className="relative flex h-2 w-2">
        {status === 'cached' && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dot} opacity-75`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
      </span>

      {/* Icon */}
      <span className={compact ? 'sm:hidden' : ''}>{cfg.icon}</span>

      {/* Label */}
      <span className={compact ? 'hidden sm:inline' : ''}>{cfg.label}</span>

      {/* Time ago — only for cached results */}
      {cachedAt && status === 'cached' && (
        <span className="hidden text-[10px] opacity-60 sm:inline">
          · {timeAgo(cachedAt)}
        </span>
      )}
    </div>
  );
}
