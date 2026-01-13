import React from 'react';

const Logo = ({ size = 'default', variant = 'full' }) => {
  const sizes = {
    small: { icon: 24, text: 'text-lg' },
    default: { icon: 32, text: 'text-2xl' },
    large: { icon: 40, text: 'text-3xl' }
  };

  const currentSize = sizes[size];

  const ShieldWithCheck = ({ size }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-300 group-hover:drop-shadow-[0_0_18px_rgba(16,185,129,0.35)]"
      style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.25))' }}
    >
      {/* Shield outline */}
      <path 
        d="M12 2L4 5V11C4 16 7 20 12 22C17 20 20 16 20 11V5L12 2Z" 
        fill="white"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark V */}
      <path 
        d="M9 12L11 14L15 9" 
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className="relative inline-flex items-center justify-center group">
        <ShieldWithCheck size={currentSize.icon} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      <div className="relative inline-flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <ShieldWithCheck size={currentSize.icon} />
      </div>
      <div className="flex items-baseline gap-1">
        <span 
          className={`${currentSize.text} font-bold tracking-tight text-ink`}
          style={{ letterSpacing: '-0.02em' }}
        >
          Clear
        </span>
        <span 
          className={`${currentSize.text} font-bold tracking-tight text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(16,185,129,0.35)]`}
          style={{ 
            letterSpacing: '-0.02em',
            textShadow: '0 0 10px rgba(16, 185, 129, 0.18)'
          }}
        >
          Pick
        </span>
        <span 
          className="text-base font-normal text-slate-500"
          style={{ fontSize: '0.9em' }}
        >
          .ai
        </span>
      </div>
    </div>
  );
};

export default Logo;
