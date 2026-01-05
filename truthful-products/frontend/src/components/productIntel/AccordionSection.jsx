import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Accordion Section Component
 * Progressive disclosure for detailed information
 */
const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      {/* Header - Large touch target */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        style={{ minHeight: '60px' }} // 60px for easy tapping
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-primary" size={24} />}
          <h3 className="text-lg font-bold text-navy text-left">
            {title}
          </h3>
        </div>
        
        {isOpen ? (
          <ChevronUp className="text-navy-light flex-shrink-0" size={24} />
        ) : (
          <ChevronDown className="text-navy-light flex-shrink-0" size={24} />
        )}
      </button>

      {/* Content - Smooth animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 pt-0 border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Accordion Group Component
 * Manages multiple accordion sections
 */
export const AccordionGroup = ({ children }) => {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
};

export default AccordionSection;
