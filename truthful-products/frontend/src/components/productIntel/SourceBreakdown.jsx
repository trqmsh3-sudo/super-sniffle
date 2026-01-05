import { BarChart3 } from 'lucide-react';

export default function SourceBreakdown({ sources, rawData }) {
  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="w-6 h-6 text-primary mr-2" />
        Data Sources
      </h3>

      <div className="space-y-3">
        {sources?.amazon && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Amazon</p>
              <p className="text-sm text-gray-600">
                {sources.amazon.reviews} reviews analyzed
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-warning">
                ⭐ {sources.amazon.avgRating}
              </p>
            </div>
          </div>
        )}

        {sources?.reddit && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Reddit</p>
              <p className="text-sm text-gray-600">
                {sources.reddit.posts} discussions analyzed
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                sources.reddit.sentiment === 'positive' ? 'bg-success/20 text-success' :
                sources.reddit.sentiment === 'negative' ? 'bg-danger/20 text-danger' :
                'bg-gray-200 text-gray-700'
              }`}>
                {sources.reddit.sentiment}
              </span>
            </div>
          </div>
        )}

        {rawData?.amazon && (
          <div className="text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded">
            <p>✓ Scraped {rawData.amazon.reviewCount} Amazon reviews</p>
            {rawData.reddit && (
              <p className="mt-1">
                ✓ Analyzed {rawData.reddit.posts} Reddit posts with {rawData.reddit.comments} comments
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
