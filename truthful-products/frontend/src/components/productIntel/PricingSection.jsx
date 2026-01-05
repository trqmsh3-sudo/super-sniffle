import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PricingSection({ pricing }) {
  if (!pricing) return null;

  const getTrendIcon = (trend) => {
    if (trend === 'Rising') return <TrendingUp className="w-5 h-5 text-danger" />;
    if (trend === 'Falling') return <TrendingDown className="w-5 h-5 text-success" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getVerdictColor = (verdict) => {
    if (verdict?.includes('Good time')) return 'text-success';
    if (verdict?.includes('Wait')) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="card bg-blue-50 border-2 border-blue-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <DollarSign className="w-6 h-6 text-primary mr-2" />
        Pricing (US)
      </h3>

      <div className="space-y-4">
        {pricing.average && (
          <div className="text-center py-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Average Price</p>
            <p className="text-4xl font-bold text-primary">
              ${pricing.average}
            </p>
          </div>
        )}

        {pricing.bestDeal && (
          <div className="bg-success/10 border-2 border-success rounded-lg p-4">
            <p className="text-sm font-semibold text-success mb-1">🏆 Best Deal</p>
            <p className="text-lg font-bold text-gray-900">
              {pricing.bestDeal.store} - ${pricing.bestDeal.price}
            </p>
            {pricing.average && pricing.bestDeal.price < pricing.average && (
              <p className="text-sm text-success mt-1">
                Save ${(pricing.average - pricing.bestDeal.price).toFixed(0)}!
              </p>
            )}
          </div>
        )}

        {pricing.trend && (
          <div className="flex items-center justify-between bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2">
              {getTrendIcon(pricing.trend)}
              <span className="font-semibold">Price Trend: {pricing.trend}</span>
            </div>
          </div>
        )}

        {pricing.verdict && (
          <div className={`text-center font-semibold ${getVerdictColor(pricing.verdict)}`}>
            💡 {pricing.verdict}
          </div>
        )}
      </div>
    </div>
  );
}
