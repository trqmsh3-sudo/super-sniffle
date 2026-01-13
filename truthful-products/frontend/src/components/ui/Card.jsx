import React from 'react';

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={[
        'rounded-2xl border border-border bg-card shadow-card',
        'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-mint-soft',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

