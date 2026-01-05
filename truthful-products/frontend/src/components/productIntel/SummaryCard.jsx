import React from 'react';
import { CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

/**
 * Summary Card Component - Mobile First
 * Quick verdict at the top of results
 */
const SummaryCard = ({ product }) => {
  if (!product) return null;

  const {
    verdict = "Great choice for budget-conscious buyers",
    trustScore = 87,
    lowestPrice = 299.99,
    retailer = "Amazon",
    sentiment = "positive"
  } = product;

  const getTrustColor = (score) => {
    if (score >= 80) return 'text-accent-green';
    if (score >= 60) return 'text-yellow-500';
    return 'text-accent-red';
  };

  const getTrustLabel = (score) => {
    if (score >= 80) return 'Highly Trusted';
    if (score >= 60) return 'Moderately Trusted';
    return 'Use Caution';
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-white rounded-2xl shadow-xl border-2 border-primary/20 p-6 mb-6 sticky top-4 z-10">
      {/* Mobile-optimized layout */}
      <div className="space-y-4">
        {/* AI Verdict */}
        <div className="flex items-start gap-3">
          <CheckCircle className="text-primary flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-sm font-semibold text-navy-light mb-1">
              AI Verdict
            </h3>
            <p className="text-lg font-bold text-navy leading-tight">
              {verdict}
            </p>
          </div>
        </div>

        {/* Trust Score & Price - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Trust Score */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className={getTrustColor(trustScore)} />
              <span className="text-xs font-semibold text-navy-light">
                Trust Score
              </span>
            </div>
            <div className={`text-3xl font-bold ${getTrustColor(trustScore)}`}>
              {trustScore}
            </div>
            <div className={`text-xs font-medium ${getTrustColor(trustScore)}`}>
              {getTrustLabel(trustScore)}
            </div>
          </div>

          {/* Best Price */}
          <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="text-primary" />
              <span className="text-xs font-semibold text-navy-light">
                Best Price
              </span>
            </div>
            <div className="text-3xl font-bold text-primary">
              ${lowestPrice}
            </div>
            <div className="text-xs font-medium text-navy-light">
              at {retailer}
            </div>
          </div>
        </div>

        {/* CTA Button - Large touch target */}
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl">
          <span className="text-lg">Check Best Price</span>
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
