import React from 'react';

export default function Badge({ variant = 'mint', className = '', children }) {
  const variants = {
    mint: 'bg-mint-50 text-mint-800 border-mint-100',
    cyan: 'bg-cyan-50 text-cyan-900 border-cyan-100',
    neutral: 'bg-surface-2 text-slate-700 border-border',
    danger: 'bg-red-50 text-red-700 border-red-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-100',
  };

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

