import React from 'react';

export default function Skeleton({ className = '' }) {
  return (
    <div
      className={[
        'animate-pulse rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
        className,
      ].join(' ')}
    />
  );
}

