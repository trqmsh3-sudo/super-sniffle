import React from 'react';
import { ExternalLink, TrendingDown, Store } from 'lucide-react';

/**
 * Product Card Component
 * Displays product with image, details, and price comparison
 */
const ProductCard = ({ product }) => {
  if (!product) return null;

  const {
    title,
    imageUrl,
    rating,
    reviewCount,
    prices = [],
    analysis
  } = product;

  // Find lowest price (including small retailers)
  const lowestPrice = prices.length > 0 
    ? prices.reduce((min, p) => p.price < min.price ? p : min)
    : null;

  // Check if lowest price is from a small/independent retailer
  const isSmallRetailer = lowestPrice && 
    !['Amazon', 'Walmart', 'Best Buy', 'Target'].includes(lowestPrice.retailer);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-64 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No image available</p>
          </div>
        )}
        
        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md px-3 py-2">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-lg">⭐</span>
              <span className="font-bold text-navy">{rating}</span>
              <span className="text-sm text-navy-light">({reviewCount})</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-navy mb-4 line-clamp-2">
          {title}
        </h2>

        {/* Best Price Highlight */}
        {lowestPrice && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-navy-light">
                Best Price Found:
              </span>
              {isSmallRetailer && (
                <div className="flex items-center gap-1 text-xs text-accent-green font-semibold bg-accent-green/10 px-2 py-1 rounded-full">
                  <Store size={12} />
                  <span>Independent Retailer</span>
                </div>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                ${lowestPrice.price.toFixed(2)}
              </span>
              {lowestPrice.originalPrice && lowestPrice.originalPrice > lowestPrice.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${lowestPrice.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-accent-green">
                    Save ${(lowestPrice.originalPrice - lowestPrice.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>
            
            <p className="text-sm text-navy-light mt-1">
              at <strong>{lowestPrice.retailer}</strong>
            </p>

            {/* Trust Message for Small Retailers */}
            {isSmallRetailer && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-navy-light">
                  💡 <strong>Found a better deal at a local/smaller store!</strong>
                  <br />
                  We show you the best price even when we don't earn a commission.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Summary */}
        {analysis && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-navy mb-2">AI Analysis:</h3>
            <p className="text-sm text-navy-light">
              {analysis.summary || 'Analysis in progress...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
