import ScoreMeter from './ScoreMeter';
import ProsConsList from './ProsConsList';
import PricingSection from './PricingSection';
import SourceBreakdown from './SourceBreakdown';
import VerdictSection from './VerdictSection';
import { ArrowLeft } from 'lucide-react';

export default function ResultsDisplay({ result, onBack }) {
  const { query, originalQuery, analysis, rawData } = result;

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-primary hover:text-primary-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        New Search
      </button>

      <div className="card mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{query}</h1>
          {originalQuery && originalQuery !== query && (
            <p className="text-sm text-gray-500">
              Auto-corrected from: "{originalQuery}"
            </p>
          )}
        </div>
      </div>

      <div className="card mb-8">
        <ScoreMeter score={analysis.score} />
      </div>

      <div className="mb-8">
        <ProsConsList pros={analysis.pros} cons={analysis.cons} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <PricingSection pricing={analysis.pricing} />
        <SourceBreakdown sources={analysis.sources} rawData={rawData} />
      </div>

      <VerdictSection
        recommendation={analysis.recommendation}
        verdict={analysis.verdict}
        bestFor={analysis.bestFor}
      />

      <div className="card mt-8 bg-gray-50">
        <p className="text-sm text-gray-600 text-center">
          ℹ️ Links may earn us commission, but don't affect our ranking or analysis
        </p>
      </div>
    </div>
  );
}
