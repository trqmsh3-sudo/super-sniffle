export default function ScoreMeter({ score }) {
  const getColor = (score) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-danger';
  };

  const getLabel = (score) => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7.5) return 'Very Good';
    if (score >= 6.5) return 'Good';
    if (score >= 5) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`text-6xl font-bold ${getColor(score)}`}>
        {score.toFixed(1)}
        <span className="text-3xl text-gray-400">/10</span>
      </div>
      <div className="text-lg text-gray-600 mt-2">
        {getLabel(score)}
      </div>
    </div>
  );
}
