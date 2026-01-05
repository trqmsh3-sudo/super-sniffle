import { Target } from 'lucide-react';

export default function VerdictSection({ recommendation, verdict, bestFor }) {
  const getRecommendationColor = (rec) => {
    if (rec === 'Highly Recommended') return 'bg-success text-white';
    if (rec === 'Recommended') return 'bg-blue-500 text-white';
    if (rec === 'Consider Alternatives') return 'bg-warning text-white';
    return 'bg-danger text-white';
  };

  return (
    <div className="card bg-gradient-to-br from-primary/10 to-blue-100 border-2 border-primary">
      <div className="flex items-center mb-4">
        <Target className="w-6 h-6 text-primary mr-2" />
        <h3 className="text-xl font-bold text-gray-900">Final Verdict</h3>
      </div>

      {recommendation && (
        <div className={`inline-block px-4 py-2 rounded-full font-bold mb-4 ${getRecommendationColor(recommendation)}`}>
          {recommendation}
        </div>
      )}

      {verdict && (
        <p className="text-lg text-gray-800 leading-relaxed mb-4">
          "{verdict}"
        </p>
      )}

      {bestFor && (
        <div className="bg-white rounded-lg p-4 mt-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">Best For:</p>
          <p className="text-gray-900">{bestFor}</p>
        </div>
      )}
    </div>
  );
}
