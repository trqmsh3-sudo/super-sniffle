import React from 'react';
import { ExternalLink, TrendingDown } from 'lucide-react';

/**
 * Price Comparison Component
 * Shows prices from multiple retailers with affiliate links
 */
const PriceComparison = ({ prices = [] }) => {
  if (!prices || prices.length === 0) {
    return null;
  }

  // Sort by price (lowest first)
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedPrices[0].price;
  const highestPrice = sortedPrices[sortedPrices.length - 1].price;
  const savings = highestPrice - lowestPrice;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-navy">Compare Prices</h3>
        {savings > 10 && (
          <div className="flex items-center gap-2 bg-accent-green/10 text-accent-green px-3 py-1 rounded-full">
            <TrendingDown size={16} />
            <span className="text-sm font-semibold">
              Save up to ${savings.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sortedPrices.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              index === 0
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Retailer Logo/Name */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-navy-light">
                  {item.retailer.substring(0, 2).toUpperCase()}
                </span>
              </div>

              <div>
                <p className="font-semibold text-navy">{item.retailer}</p>
                {index === 0 && (
                  <p className="text-xs text-primary font-medium">
                    ⭐ Best Price
                  </p>
                )}
                {item.inStock === false && (
                  <p className="text-xs text-accent-red">Out of Stock</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Price */}
              <div className="text-right">
                <p className="text-2xl font-bold text-navy">
                  ${item.price.toFixed(2)}
                </p>
                {item.originalPrice && item.originalPrice > item.price && (
                  <p className="text-sm text-gray-500 line-through">
                    ${item.originalPrice.toFixed(2)}
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <a
                href={item.affiliateLink || item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-secondary text-sm px-4 py-2 flex items-center gap-2 ${
                  item.inStock === false || !(item.affiliateLink || item.url)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                onClick={(e) => {
                  if (item.inStock === false || !(item.affiliateLink || item.url)) {
                    e.preventDefault();
                  }
                }}
              >
                <span>Check Price</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-navy-light text-center">
          Prices updated in real-time. Click to view on retailer's website.
        </p>
      </div>
    </div>
  );
};

export default PriceComparison;
