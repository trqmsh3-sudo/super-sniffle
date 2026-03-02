// =============================================================================
// ClearPick.ai — Trust Elements
// Stats section, review source logos, FAQ accordion, "updated X ago" badge
// =============================================================================

'use client';

import { useState } from 'react';

// ── Stats Section ────────────────────────────────────────────────────────────

const STATS = [
  { value: '10,000+', label: 'Products analyzed', icon: '📦' },
  { value: '5M+', label: 'Reviews processed', icon: '⭐' },
  { value: '50+', label: 'Verified sources', icon: '🔍' },
  { value: '24/7', label: 'Real-time updates', icon: '🔄' },
] as const;

export function StatsSection() {
  return (
    <section className="border-y border-surface-border bg-white py-12 md:py-16">
      <div className="mx-auto grid max-w-content grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 md:gap-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
            <span className="text-3xl">{stat.icon}</span>
            <span className="text-2xl font-extrabold tracking-tight text-primary-800 md:text-3xl">
              {stat.value}
            </span>
            <span className="text-sm text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Source Logos ──────────────────────────────────────────────────────────────

const SOURCES = [
  'TechRadar', 'CNET', 'Tom\'s Guide', 'The Verge',
  'PCMag', 'rtings', 'Wirecutter', 'Digital Trends',
] as const;

export function SourceLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4">
      {SOURCES.map((name) => (
        <span
          key={name}
          className="rounded-full border border-surface-border bg-surface-bg px-3 py-1 text-[11px] font-medium text-gray-400"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

// ── Verified Badge ───────────────────────────────────────────────────────────

interface VerifiedBadgeProps {
  sourceCount?: number;
  updatedHoursAgo?: number;
}

export function VerifiedBadge({ sourceCount = 50, updatedHoursAgo }: VerifiedBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        Based on {sourceCount}+ verified sources
      </span>
      {updatedHoursAgo != null && (
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Updated {updatedHoursAgo < 1 ? 'just now' : `${updatedHoursAgo}h ago`}
        </span>
      )}
    </div>
  );
}

// ── FAQ Accordion ────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'How does ClearPick.ai find products?',
    a: 'We use AI powered by Google Gemini with real-time web search to aggregate product data from 50+ trusted review sites, including TechRadar, CNET, Tom\'s Guide, and more.',
  },
  {
    q: 'Are the scores unbiased?',
    a: 'Yes. Our AI aggregates scores from multiple independent review sources and normalizes them into a single 0-10 rating. We have no affiliate relationships that influence scores.',
  },
  {
    q: 'How often is the data updated?',
    a: 'Product data is refreshed every 24 hours using real-time web search. Search results are always live and up-to-date.',
  },
  {
    q: 'Can I compare products?',
    a: 'Absolutely! Select 2-3 products using the Compare button and view a side-by-side comparison table with scores, prices, pros, and cons.',
  },
  {
    q: 'Is ClearPick.ai free to use?',
    a: 'Yes, ClearPick.ai is completely free. Search for any product, brand, or category without limits.',
  },
] as const;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-surface-bg py-16 md:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:text-3xl">
          Frequently Asked Questions
        </h2>

        <div className="mx-auto max-w-2xl space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-card border border-surface-border bg-white overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-gray-900">{item.q}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="animate-fade-in border-t border-surface-border px-5 py-4">
                  <p className="text-sm leading-relaxed text-gray-600">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: '01',
    title: 'Search anything',
    desc: 'Type a product, brand, or category. Our AI understands what you\'re looking for.',
    icon: '🔍',
  },
  {
    step: '02',
    title: 'AI researches for you',
    desc: 'We scan 50+ review sites and aggregate real scores, prices, and expert opinions in seconds.',
    icon: '🤖',
  },
  {
    step: '03',
    title: 'Compare & decide',
    desc: 'View side-by-side comparisons, scores, pros and cons. Make confident purchase decisions.',
    icon: '✅',
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 md:text-3xl">
          How it works
        </h2>
        <p className="mb-10 text-center text-sm text-gray-500">
          From search to decision in seconds
        </p>

        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-3xl">
                {s.icon}
              </div>
              <span className="mb-1 text-xs font-bold uppercase tracking-wider text-accent">
                Step {s.step}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
