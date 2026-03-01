// =============================================================================
// ClearPick.ai — Professional Product Card (Dark Theme)
// #111 card, brand-color accent line, star rating, hover glow
// =============================================================================

'use client';

import { useState } from 'react';
import Image from 'next/image';

// ── Props ────────────────────────────────────────────────────────────────────

export interface ProductCardProps {
  name: string;
  year: number;
  price: string;
  image: string;
  description: string;
  rating: number;
  source: string;
  brandColor: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ProductCard({
  name,
  year,
  price,
  image,
  description,
  rating,
  source,
  brandColor,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const hasImage = image && image.startsWith('http') && !imgError;
  const hasLink = source && source !== 'AI-generated';
  const showPrice = price && price !== 'Unknown';

  const handleClick = () => {
    if (hasLink) window.open(source, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role={hasLink ? 'link' : undefined}
      tabIndex={hasLink ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (hasLink && (e.key === 'Enter' || e.key === ' ')) handleClick();
      }}
      className="group flex flex-col overflow-hidden rounded-xl border transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-2xl"
      style={{
        backgroundColor: '#111',
        borderColor: '#222',
        cursor: hasLink ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = brandColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#222';
      }}
    >
      {/* ── Image Area (4:3) ───────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {hasImage ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          /* No image → gradient with brand color + product name */
          <div
            className="flex h-full w-full items-center justify-center p-4"
            style={{
              background: `linear-gradient(135deg, ${brandColor}30 0%, #111 70%)`,
            }}
          >
            <span className="text-center text-sm font-medium leading-snug text-white/50">
              {name}
            </span>
          </div>
        )}
      </div>

      {/* ── Content Area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-3">
        {/* Name + Year row */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-white line-clamp-2">
            {name}
          </h4>
          {year > 0 && (
            <span className="shrink-0 text-xs font-medium text-white/40">
              {year}
            </span>
          )}
        </div>

        {/* Brand color accent line */}
        <div
          className="my-2 h-[2px] w-full rounded-full"
          style={{ backgroundColor: brandColor }}
        />

        {/* Price */}
        {showPrice && (
          <p className="text-sm font-bold" style={{ color: brandColor }}>
            {price}
          </p>
        )}

        {/* Stars + rating */}
        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex gap-0.5">{renderStars(rating)}</div>
            <span className="text-xs font-medium text-white/50">{rating}</span>
          </div>
        )}

        {/* Description — 2 lines max */}
        {description && (
          <p className="mt-2 text-xs leading-relaxed text-white/40 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Render 5 stars — filled / half / empty based on 0-10 rating */
function renderStars(rating: number) {
  const outOf5 = rating / 2;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const cls =
      outOf5 >= i
        ? 'h-3 w-3 text-amber-400'
        : outOf5 >= i - 0.5
          ? 'h-3 w-3 text-amber-400/50'
          : 'h-3 w-3 text-white/15';
    stars.push(
      <svg key={i} className={cls} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>,
    );
  }
  return stars;
}
