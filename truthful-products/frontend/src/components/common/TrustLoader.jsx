import React, { useState, useEffect } from 'react';
import { Search, Brain, Shield, DollarSign } from 'lucide-react';

/**
 * Visual Trust-Loader Component
 * Shows AI processing phases to build user confidence
 */
const TrustLoader = ({ isLoading = true }) => {
  const [currentPhase, setCurrentPhase] = useState(0);

  const phases = [
    {
      icon: Search,
      text: 'Scanning thousands of reviews across platforms...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      duration: 2000
    },
    {
      icon: Brain,
      text: 'AI Analyzing sentiment and extracting the truth...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      duration: 3000
    },
    {
      icon: Shield,
      text: 'Filtering out bot-reviews and biased data...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      duration: 2500
    },
    {
      icon: DollarSign,
      text: 'Comparing prices across major & independent retailers...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      duration: 2000
    }
  ];

  useEffect(() => {
    if (!isLoading) return;

    const timer = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev < phases.length - 1) {
          return prev + 1;
        }
        return 0; // Loop back to start
      });
    }, phases[currentPhase].duration);

    return () => clearInterval(timer);
  }, [currentPhase, isLoading]);

  if (!isLoading) return null;

  const CurrentIcon = phases[currentPhase].icon;

  return (
    <div className="w-full max-w-2xl mx-auto py-12 md:py-12 trust-loader-mobile md:trust-loader-desktop">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {phases.map((phase, index) => (
              <div
                key={index}
                className={`w-1/4 h-2 rounded-full mx-1 transition-all duration-500 ${
                  index <= currentPhase
                    ? 'bg-primary'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-navy-light mt-2">
            Phase {currentPhase + 1} of {phases.length}
          </p>
        </div>

        {/* Current Phase Display */}
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Icon */}
          <div
            className={`${phases[currentPhase].bgColor} rounded-full p-6 animate-pulse`}
          >
            <CurrentIcon
              size={48}
              className={`${phases[currentPhase].color} animate-spin-slow`}
            />
          </div>

          {/* Phase Text */}
          <div className="text-center">
            <p className="text-lg font-semibold text-navy mb-2">
              {phases[currentPhase].text}
            </p>
            <p className="text-sm text-navy-light">
              This usually takes 10-15 seconds
            </p>
          </div>

          {/* Scanning Animation */}
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-primary animate-scan" />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">1000+</p>
              <p className="text-xs text-navy-light">Reviews Analyzed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-xs text-navy-light">Retailers Compared</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-xs text-navy-light">Independent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Context */}
      <div className="text-center mt-6">
        <p className="text-sm text-navy-light">
          💡 We're doing the hard work so you don't have to
        </p>
      </div>
    </div>
  );
};

export default TrustLoader;
