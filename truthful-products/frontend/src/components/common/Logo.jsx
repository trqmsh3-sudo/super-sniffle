import React from 'react';

const Logo = ({ size = 'default', variant = 'full', lightMode = false }) => {
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
      className="transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(0,255,179,0.6)]"
      style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 179, 0.35))' }}
    >
      {/* Shield outline */}
      <path 
        d="M12 2L4 5V11C4 16 7 20 12 22C17 20 20 16 20 11V5L12 2Z" 
        fill="white"
        stroke="#00FFB3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark V */}
      <path 
        d="M9 12L11 14L15 9" 
        stroke="#00FFB3"
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
          className={`${currentSize.text} font-bold tracking-tight ${lightMode ? 'text-white' : 'text-navy'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          Clear
        </span>
        <span 
          className={`${currentSize.text} font-bold tracking-tight text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(0,255,179,0.5)]`}
          style={{ 
            letterSpacing: '-0.02em',
            textShadow: '0 0 10px rgba(0, 255, 179, 0.3)'
          }}
        >
          Pick
        </span>
        <span 
          className={`text-base font-normal ${lightMode ? 'text-white/70' : 'text-navy-light'}`}
          style={{ fontSize: '0.9em' }}
        >
          .ai
        </span>
      </div>
    </div>
  );
};

export default Logo;
