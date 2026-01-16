import React from 'react';

/**
 * SkeletonDossier Component
 * Loading placeholder for dossier page
 * Better UX than spinner - shows content structure
 */
const SkeletonDossier = () => {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-mint-50 to-white" />
      
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14 animate-pulse">
        {/* Back button skeleton */}
        <div className="h-6 w-32 bg-slate-200 rounded-lg mb-6" />
        
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Image skeleton */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="aspect-square bg-slate-200 rounded-2xl border-2 border-slate-300" />
            {/* Thumbnails */}
            <div className="mt-3 flex gap-2">
              <div className="w-16 h-16 bg-slate-200 rounded-xl" />
              <div className="w-16 h-16 bg-slate-200 rounded-xl" />
              <div className="w-16 h-16 bg-slate-200 rounded-xl" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="flex-1 w-full space-y-6">
            {/* Badge */}
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
            
            {/* Title */}
            <div className="h-12 bg-slate-200 rounded-xl w-3/4" />
            
            {/* Verdict card */}
            <div className="h-64 bg-slate-200 rounded-2xl" />
            
            {/* Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="h-20 bg-slate-200 rounded-xl" />
              <div className="h-20 bg-slate-200 rounded-xl" />
              <div className="h-20 bg-slate-200 rounded-xl" />
            </div>
            
            {/* Metadata */}
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            
            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-80 bg-slate-200 rounded-2xl" />
              <div className="h-80 bg-slate-200 rounded-2xl" />
            </div>
            
            {/* Summary */}
            <div className="h-32 bg-slate-200 rounded-2xl" />
            
            {/* Common issues */}
            <div className="h-48 bg-slate-200 rounded-2xl" />
          </div>
          
          {/* Sidebar skeleton */}
          <div className="lg:w-80 w-full">
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
        </div>
        
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{
              animation: 'shimmer 2s infinite',
              transform: 'translateX(-100%)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Add shimmer animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
if (!document.getElementById('skeleton-styles')) {
  style.id = 'skeleton-styles';
  document.head.appendChild(style);
}

export default SkeletonDossier;
