import React from 'react';
import SearchBox from '../components/productIntel/SearchBox';
import TrustLoader from '../components/common/TrustLoader';
import AffiliateDisclosure from '../components/common/AffiliateDisclosure';
import PriceComparison from '../components/productIntel/PriceComparison';
import { useProductSearch } from '../hooks/useProductSearch';

const ProductIntel = () => {
  const { loading, result, error, search } = useProductSearch();

  const retailers = result?.prices?.retailers || [];

  const pricesForUI = retailers
    .filter((r) => typeof r?.price === 'number' && r?.retailer)
    .map((r) => ({
      retailer: r.retailer,
      price: r.price,
      originalPrice: r.originalPrice,
      inStock: r.inStock,
      affiliateLink: r.affiliateLink || r.url,
    }));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">
            Product Intelligence
          </h1>
          <p className="text-xl text-navy-light">
            Get unbiased analysis of any product based on real reviews
          </p>
        </div>

        <SearchBox onSearch={search} loading={loading} />

        {loading && <TrustLoader isLoading={loading} />}

        {result && !loading && (
          <>
            <AffiliateDisclosure variant="primary" />
            <PriceComparison prices={pricesForUI} />
            
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mt-6">
              <h2 className="text-2xl font-bold text-navy mb-4">Results</h2>
              <p className="text-navy-light">
                Query: <strong>{result.product?.title || ''}</strong>
              </p>
              {pricesForUI.length === 0 && (
                <p className="text-sm text-navy-light mt-4">
                  No Google Shopping results found for this query.
                </p>
              )}
            </div>
          </>
        )}

        {error && !loading && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mt-6 text-accent-red">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductIntel;
