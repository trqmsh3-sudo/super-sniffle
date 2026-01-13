import React from 'react';

export default function Button({
  variant = 'primary', // primary | secondary | ghost
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-lg',
    md: 'h-11 px-5 text-sm rounded-xl',
    lg: 'h-12 px-6 text-base rounded-xl',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-mint-600 to-cyan-500 text-white shadow-mint-soft hover:shadow-mint-soft-lg hover:-translate-y-0.5',
    secondary:
      'bg-surface text-ink border border-border shadow-card hover:shadow-mint-soft hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-ink hover:bg-surface-2 border border-transparent hover:border-border',
  };

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-4 focus:ring-[color:var(--ring)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
        sizes[size],
        variants[variant],
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>Loading…</span>
        </span>
      ) : (
        <>
          {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
          <span className="truncate">{children}</span>
          {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </button>
  );
}

