import React from 'react';

export default function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <label className={['block', className].join(' ')}>
      {label ? <div className="mb-2 text-sm font-semibold text-ink">{label}</div> : null}
      <div
        className={[
          'relative flex items-center rounded-2xl border-2 bg-surface px-4',
          error ? 'border-danger' : 'border-border',
          'focus-within:border-mint-500 focus-within:ring-4 focus-within:ring-[color:var(--ring)]',
          'transition-all duration-200',
        ].join(' ')}
      >
        {leftIcon ? <div className="mr-3 text-mint-600">{leftIcon}</div> : null}
        <input
          className={[
            'h-12 w-full bg-transparent text-ink placeholder:text-slate-400 focus:outline-none',
            inputClassName,
          ].join(' ')}
          {...props}
        />
        {rightSlot ? <div className="ml-3">{rightSlot}</div> : null}
      </div>
      {error ? (
        <div className="mt-2 text-sm text-danger">{error}</div>
      ) : hint ? (
        <div className="mt-2 text-sm text-slate-500">{hint}</div>
      ) : null}
    </label>
  );
}

