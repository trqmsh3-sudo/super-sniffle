import React from 'react';
import { Shield, Lock, Zap, Award } from 'lucide-react';

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and never sold'
    },
    {
      icon: Lock,
      title: 'SSL Protected',
      description: 'Bank-level security for all transactions'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Results in seconds, not minutes'
    },
    {
      icon: Award,
      title: 'Trusted by Thousands',
      description: 'Join smart shoppers worldwide'
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
