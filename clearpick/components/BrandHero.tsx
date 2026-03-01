// =============================================================================
// ClearPick.ai — Brand Hero Component (Dark Theme)
// Gradient from brandColor → #0a0a0a, left-aligned, min-h 280px
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// ── Types ────────────────────────────────────────────────────────────────────

interface BrandHeroProps {
  name: string;
  slug: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  bio: string;
  founded: number;
  headquarters: string;
  category: string;
  productCount?: number;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function BrandHero({
  name,
  slug,
  logo,
  primaryColor,
  bio,
  founded,
  headquarters,
  category,
  productCount,
}: BrandHeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const currentYear = new Date().getFullYear();
  const yearsActive = founded > 0 ? currentYear - founded : 0;

  return (
    <section
      className="relative min-h-[280px] overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, #0a0a0a 60%)`,
      }}
    >
      {/* Bottom fade to site background */}
      <div
        className="absolute inset-x-0 bottom-0 h-20"
        style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }}
      />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div
        className={`relative mx-auto flex max-w-6xl items-center gap-6 px-6 py-14 transition-all duration-700 ease-out md:py-20 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Logo — white bg, rounded-xl, shadow */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-xl md:h-24 md:w-24">
          <Image
            src={logo}
            alt={`${name} logo`}
            width={80}
            height={80}
            priority
            className="h-14 w-14 object-contain md:h-18 md:w-18"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const span = document.createElement('span');
                span.style.color = primaryColor;
                span.style.fontSize = '2.5rem';
                span.style.fontWeight = '800';
                span.textContent = name.charAt(0);
                parent.appendChild(span);
              }
            }}
          />
        </div>

        {/* Text Content */}
        <div className="min-w-0 flex-1">
          {/* Brand Name */}
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {name}
          </h1>

          {/* Pills row */}
          <div
            className={`mt-3 flex flex-wrap gap-2 transition-all delay-150 duration-500 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <Pill>{category}</Pill>
            {productCount != null && productCount > 0 && (
              <Pill>{productCount} product{productCount !== 1 ? 's' : ''}</Pill>
            )}
            {founded > 0 && <Pill muted>Est. {founded}</Pill>}
            {yearsActive > 0 && <Pill muted>{yearsActive}+ years</Pill>}
            {headquarters && <Pill muted>{headquarters}</Pill>}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Pill({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
        muted
          ? 'bg-white/10 text-white/60'
          : 'bg-white/20 uppercase tracking-wider text-white'
      }`}
    >
      {children}
    </span>
  );
}
