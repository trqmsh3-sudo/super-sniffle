import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * BuildingAnimation Component
 * Shows a nice loading animation while building product dossier
 * Displays progress and current step
 */
const BuildingAnimation = ({ productName, estimatedTime = 30 }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { label: '🔍 מחפש ביקורות ב-Reddit...', duration: 8 },
    { label: '🖼️ אוסף תמונות מהאינטרנט...', duration: 5 },
    { label: '📊 מנתח sentiment...', duration: 7 },
    { label: '✅ מחלץ pros & cons...', duration: 6 },
    { label: '📝 בונה תיק מוצר...', duration: 4 }
  ];
  
  // Progress bar animation
  useEffect(() => {
    const totalDuration = estimatedTime * 1000;
    const updateInterval = 100; // Update every 100ms
    const incrementPerUpdate = 100 / (totalDuration / updateInterval);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95; // Don't reach 100% until real completion
        return Math.min(prev + incrementPerUpdate, 95);
      });
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [estimatedTime]);
  
  // Update current step based on progress
  useEffect(() => {
    const stepIndex = Math.min(
      Math.floor((progress / 100) * steps.length),
      steps.length - 1
    );
    setCurrentStep(stepIndex);
  }, [progress, steps.length]);
  
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Spinning loader */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-mint-200"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-mint-600"
              style={{ 
                animation: 'spin 1s linear infinite'
              }}
            />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-black text-ink mb-2">
            בונה תיק עבור {productName}
          </h2>
          
          <p className="text-slate-600 mb-6">
            זה לוקח בערך {estimatedTime} שניות...
          </p>
          
          {/* Progress bar */}
          <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-mint-600 to-cyan-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
          </div>
          
          {/* Percentage */}
          <div className="mt-2 text-sm font-semibold text-mint-700">
            {Math.round(progress)}%
          </div>
        </div>
        
        {/* Steps list */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;
            
            return (
              <div 
                key={index}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300
                  ${isCurrent ? 'border-mint-500 bg-mint-50 scale-105' : ''}
                  ${isCompleted ? 'border-green-200 bg-green-50' : ''}
                  ${isPending ? 'border-slate-200 bg-slate-50 opacity-50' : ''}
                `}
              >
                {/* Step icon */}
                {isCompleted ? (
                  <div className="w-6 h-6 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center animate-[successPop_0.3s_ease-out]">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                ) : isCurrent ? (
                  <div className="flex-shrink-0">
                    <Loader2 className="w-6 h-6 text-mint-600 animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 flex-shrink-0 rounded-full border-2 border-slate-300" />
                )}
                
                {/* Step label */}
                <span className={`
                  text-sm font-medium transition-colors
                  ${isCurrent ? 'text-ink' : 'text-slate-600'}
                `}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Fun fact or tip */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900">
            <span className="font-bold">💡 טיפ:</span> אנחנו סורקים ביקורות אמיתיות מ-Reddit, YouTube ו-Amazon כדי לתת לך את התמונה המלאה!
          </p>
        </div>
      </div>
    </div>
  );
};

// Add animations to stylesheet
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes successPop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

export default BuildingAnimation;
