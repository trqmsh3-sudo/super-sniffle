import React from 'react';
import { Info } from 'lucide-react';

/**
 * Affiliate Disclosure Component
 * Transparent monetization message
 */
const AffiliateDisclosure = ({ variant = 'default' }) => {
  const variants = {
    default: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-navy-light'
    },
    subtle: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-navy-light'
    },
    primary: {
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      text: 'text-navy-light'
    }
  };

  const style = variants[variant];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <Info size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div className={`text-sm ${style.text}`}>
          <p className="font-semibold text-navy mb-1">
            💡 How we stay free and independent
          </p>
          <p>
            We earn a small commission if you purchase through our links. 
            This helps keep ClearPick.ai free and independent. 
            <strong> Your price stays the same.</strong>
          </p>
          <p className="mt-2 text-xs opacity-75">
            We only recommend products based on real data and honest analysis, 
            never based on commission rates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDisclosure;
