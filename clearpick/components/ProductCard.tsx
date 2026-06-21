// =============================================================================
// ClearPick.ai — ProductCard (SaaS Design System)
// Score badge, pros/cons, compare button, hover elevation, click animation
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
  brandColor?: string;
  pros?: string[];
  cons?: string[];
  // Comparison mode
  isSelected?: boolean;
  onToggleCompare?: (name: string) => void;
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
  brandColor = '#3B82F6',
  pros,
  cons,
  isSelected = false,
  onToggleCompare,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const hasImage = image && image.startsWith('http') && !imgError;
  const hasLink = source && source !== 'AI-generated';
  const showPrice = price && price !== 'Unknown';
  const scoreDisplay = rating > 0 ? (rating > 5 ? rating : rating * 2).toFixed(1) : null;

  const handleClick = () => {
    if (hasLink) window.open(source, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`
        group relative flex flex-col overflow-hidden rounded-xl border
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(242,202,80,0.08)]
        ${isSelected ? 'border-primary bg-white/10 ring-2 ring-primary/25' : 'border-white/5 bg-[#141418]/60 backdrop-blur-md'}
      `}
    >
      {/* ── Score Badge (top-right) ────────────────────────────────────── */}
      {scoreDisplay && (
        <div className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-black text-sm font-extrabold shadow-lg shadow-primary/10">
          {scoreDisplay}
        </div>
      )}

      {/* ── Image Area (4:3) ───────────────────────────────────────────── */}
      <div
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-black/25 border-b border-white/5"
        onClick={handleClick}
        role={hasLink ? 'link' : undefined}
        tabIndex={hasLink ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasLink && (e.key === 'Enter' || e.key === ' ')) handleClick();
        }}
      >
        {hasImage ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center p-4"
            style={{
              background: `linear-gradient(135deg, ${brandColor}22 0%, #141418 80%)`,
            }}
          >
            <span className="text-center text-sm font-semibold leading-snug text-gray-400">
              {name}
            </span>
          </div>
        )}
      </div>

      {/* ── Content Area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Name + Year */}
        <div className="flex items-start justify-between gap-2">
          <h4
            className="min-w-0 flex-1 text-sm font-bold leading-snug text-white line-clamp-2 cursor-pointer hover:text-primary transition-colors font-display-lg"
            onClick={handleClick}
          >
            {name}
          </h4>
          {year > 0 && (
            <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {year}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="mt-2 text-xs leading-relaxed text-gray-400 line-clamp-2">
            {description}
          </p>
        )}

        {/* Pros */}
        {pros && pros.length > 0 && (
          <div className="mt-3 space-y-1">
            {pros.slice(0, 3).map((pro, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-green-400">
                <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="line-clamp-1">{pro}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cons */}
        {cons && cons.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {cons.slice(0, 1).map((con, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-rose-400">
                <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="line-clamp-1">{con}</span>
              </div>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-[16px]" />

        {/* Price + Stars */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {showPrice && (
            <p className="text-base font-extrabold text-primary">{price}</p>
          )}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">{renderStars(rating)}</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 flex gap-2">
          {onToggleCompare && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(name); }}
              className={`
                flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.97] cursor-pointer
                ${isSelected
                  ? 'border-[#F5C842] bg-[#F5C842] text-black hover:shadow-[0_0_15px_rgba(242,202,80,0.25)]'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-[#F5C842]/40 hover:text-[#F5C842]'
                }
              `}
            >
              {isSelected ? '✓ Comparing' : 'Compare'}
            </button>
          )}
          {hasLink && (
            <button
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              className="flex-1 rounded-xl bg-[#F5C842] px-3 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#D4A820] hover:shadow-[0_0_20px_rgba(242,202,80,0.3)] active:scale-[0.97] cursor-pointer"
            >
              Full Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Star Renderer ────────────────────────────────────────────────────────────

function renderStars(rating: number) {
  const outOf5 = rating > 5 ? rating / 2 : rating;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const cls =
      outOf5 >= i
        ? 'h-3.5 w-3.5 text-amber-400'
        : outOf5 >= i - 0.5
          ? 'h-3.5 w-3.5 text-amber-300'
          : 'h-3.5 w-3.5 text-gray-700';
    stars.push(
      <svg key={i} className={cls} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>,
    );
  }
  return stars;
}
