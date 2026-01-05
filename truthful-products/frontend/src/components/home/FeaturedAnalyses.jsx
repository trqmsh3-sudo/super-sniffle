import React from 'react';
import { ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Featured Analyses Component
 * Shows 5 pre-cached product analyses on home page
 * This saves API tokens and demonstrates system power
 */
const FeaturedAnalyses = () => {
  // Mock featured products (in production, these would be pre-cached)
  const featuredProducts = [
    {
      id: 1,
      title: 'Sony WH-1000XM5 Wireless Headphones',
      image: 'https://via.placeholder.com/300x300?text=Sony+Headphones',
      rating: 4.7,
      reviewCount: 12453,
      lowestPrice: 349.99,
      originalPrice: 399.99,
      sentiment: 'positive',
      summary: 'Industry-leading noise cancellation with exceptional sound quality.',
      category: 'Electronics'
    },
    {
      id: 2,
      title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
      image: 'https://via.placeholder.com/300x300?text=Instant+Pot',
      rating: 4.6,
      reviewCount: 89234,
      lowestPrice: 79.99,
      originalPrice: 119.99,
      sentiment: 'positive',
      summary: 'Versatile kitchen appliance that saves time and space.',
      category: 'Home & Kitchen'
    },
    {
      id: 3,
      title: 'Apple AirPods Pro (2nd Generation)',
      image: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
      rating: 4.8,
      reviewCount: 45678,
      lowestPrice: 199.99,
      originalPrice: 249.99,
      sentiment: 'positive',
      summary: 'Premium wireless earbuds with active noise cancellation.',
      category: 'Electronics'
    },
    {
      id: 4,
      title: 'Dyson V15 Detect Cordless Vacuum',
      image: 'https://via.placeholder.com/300x300?text=Dyson+Vacuum',
      rating: 4.5,
      reviewCount: 8934,
      lowestPrice: 649.99,
      originalPrice: 749.99,
      sentiment: 'positive',
      summary: 'Powerful suction with laser detection for hidden dust.',
      category: 'Home & Kitchen'
    },
    {
      id: 5,
      title: 'Ninja Air Fryer Max XL',
      image: 'https://via.placeholder.com/300x300?text=Ninja+Air+Fryer',
      rating: 4.7,
      reviewCount: 34567,
      lowestPrice: 129.99,
      originalPrice: 169.99,
      sentiment: 'positive',
      summary: 'Large capacity air fryer with consistent results.',
      category: 'Home & Kitchen'
    }
  ];

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-accent-green';
      case 'mixed': return 'text-yellow-500';
      case 'negative': return 'text-accent-red';
      default: return 'text-gray-500';
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Featured Product Analyses
          </h2>
          <p className="text-lg text-navy-light max-w-2xl mx-auto">
            See our AI-powered analysis in action. These products have been thoroughly 
            analyzed to help you make informed decisions.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-white rounded-xl border-2 border-gray-100 hover:border-primary transition-all duration-300 overflow-hidden hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-50 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Savings Badge */}
                {product.originalPrice > product.lowestPrice && (
                  <div className="absolute top-2 right-2 bg-accent-green text-white text-xs font-bold px-2 py-1 rounded-full">
                    Save ${(product.originalPrice - product.lowestPrice).toFixed(0)}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-navy text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-navy">{product.rating}</span>
                  <span className="text-xs text-navy-light">({product.reviewCount.toLocaleString()})</span>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                      ${product.lowestPrice}
                    </span>
                    {product.originalPrice > product.lowestPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sentiment */}
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp size={14} className={getSentimentColor(product.sentiment)} />
                  <span className={`text-xs font-semibold capitalize ${getSentimentColor(product.sentiment)}`}>
                    {product.sentiment}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs text-navy-light line-clamp-2 mb-3">
                  {product.summary}
                </p>

                {/* CTA */}
                <div className="flex items-center justify-between text-primary text-xs font-semibold group-hover:translate-x-1 transition-transform">
                  <span>View Analysis</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            to="/product-intel"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200"
          >
            <span>Analyze Your Own Product</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Trust Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-navy-light">
            💡 <strong>Pre-analyzed products</strong> - No API costs, instant results
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAnalyses;
