import { useParams, useNavigate } from 'react-router-dom';
import { useProductDossier } from '../hooks/useProductDossier';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, ExternalLink, Share2, Bookmark } from 'lucide-react';

const DossierPagePremium = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { dossier, loading, error } = useProductDossier(productId);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          {/* Premium Loading Animation */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-secondary-500 animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          </div>
          <p className="text-xl text-slate-400">Loading intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Dossier Not Found</h2>
          <p className="text-slate-400 mb-8">{error || 'This product hasn\'t been analyzed yet.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-4 rounded-xl transition-all"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const {product, scores, analysis, meta} = dossier;
  const overallScore = scores?.overall || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-dark-900 to-dark-950 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-12 md:py-20">
          {/* Back Button */}
          <button
            onClick={() => navigate('/search')}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Search</span>
          </button>

          <div className="flex flex-col lg:flex-row items-start gap-12">
            {/* Left - Product Info */}
            <div className="flex-1">
              {/* Category */}
              {product?.category && (
                <div className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
                  <span className="text-sm text-primary-400 font-semibold uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                {product?.name || 'Product'}
              </h1>

              {/* Quick Stats Bar */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{scores?.quality || 0}%</div>
                    <div className="text-xs text-slate-500">Quality</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{scores?.reliability || 0}%</div>
                    <div className="text-xs text-slate-500">Reliability</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{scores?.value || 0}%</div>
                    <div className="text-xs text-slate-500">Value</div>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span>📊 Based on {meta?.total_reviews || 0} sources</span>
                <span>•</span>
                <span>✓ Verified data</span>
                <span>•</span>
                <span>⏱️ Updated {meta?.last_updated ? new Date(meta.last_updated).toLocaleDateString('en-US') : 'recently'}</span>
              </div>
            </div>

            {/* Right - Overall Score (GIANT) */}
            <div className="lg:w-80">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl blur-2xl opacity-30"></div>
                
                {/* Score Card */}
                <div className="relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl p-8 border border-white/20">
                  <div className="text-center">
                    <div className="text-sm text-slate-400 font-semibold uppercase tracking-wide mb-4">
                      Overall Score
                    </div>
                    
                    {/* Giant Score */}
                    <div className="relative mb-6">
                      <div className="text-9xl font-black bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent leading-none">
                        {overallScore}
                      </div>
                      <div className="text-3xl text-slate-600 font-bold">/100</div>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-6">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000"
                        style={{width: `${overallScore}%`}}
                      ></div>
                    </div>

                    {/* Verdict */}
                    <div className={`px-4 py-2 rounded-xl font-bold ${
                      overallScore >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      overallScore >= 60 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {overallScore >= 80 ? '✓ Highly Recommended' :
                       overallScore >= 60 ? '⚠ Consider Alternatives' :
                       '✗ Not Recommended'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/30 rounded-xl text-white font-semibold transition-all group">
                  <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Share Report
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-secondary-500/30 rounded-xl text-white font-semibold transition-all group">
                  <Bookmark className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Save for Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            {analysis?.summary && (
              <div className="bg-dark-800 rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                    <span className="text-xl">💡</span>
                  </div>
                  Summary
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            )}

            {/* Pros */}
            {analysis?.pros && analysis.pros.length > 0 && (
              <div className="bg-dark-800 rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  Strengths
                </h2>
                <div className="space-y-4">
                  {analysis.pros.slice(0, 10).map((pro, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-green-500/5 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-400 text-sm font-bold">✓</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium leading-relaxed">
                          {typeof pro === 'string' ? pro : pro.point || pro}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cons */}
            {analysis?.cons && analysis.cons.length > 0 && (
              <div className="bg-dark-800 rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  Weaknesses
                </h2>
                <div className="space-y-4">
                  {analysis.cons.slice(0, 10).map((con, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 hover:border-amber-500/30 transition-all">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-400 text-sm font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium leading-relaxed">
                          {typeof con === 'string' ? con : con.point || con}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Issues */}
            {analysis?.common_failures && analysis.common_failures.length > 0 && (
              <div className="bg-dark-800 rounded-3xl p-8 border border-red-500/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <XCircle className="w-6 h-6 text-red-400" />
                  </div>
                  Known Issues
                </h2>
                <div className="space-y-4">
                  {analysis.common_failures.map((failure, index) => (
                    <div key={index} className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                      <p className="text-red-300 font-medium">
                        {typeof failure === 'string' ? failure : failure.issue || failure}
                      </p>
                      {failure.severity && (
                        <div className="mt-2 inline-block px-3 py-1 bg-red-500/20 rounded-full">
                          <span className="text-xs text-red-400 font-semibold uppercase">
                            {failure.severity} severity
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Best For */}
            {analysis?.best_for && analysis.best_for.length > 0 && (
              <div className="bg-dark-800 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Best For
                </h3>
                <ul className="space-y-3">
                  {analysis.best_for.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Not For */}
            {analysis?.not_for && analysis.not_for.length > 0 && (
              <div className="bg-dark-800 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  Not Recommended For
                </h3>
                <ul className="space-y-3">
                  {analysis.not_for.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-2xl p-6 border border-primary-500/20">
              <h3 className="text-lg font-bold text-white mb-4">
                <span className="text-xl mr-2">🔒</span>
                Trust Indicators
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified reviews only</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>No advertising influence</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>AI-powered analysis</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>{meta?.confidence || 85}% confidence</span>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-dark-800 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">
                📊 Data Sources
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Web Sources:</span>
                  <span className="font-bold text-white">{meta?.total_reviews || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">AI Model:</span>
                  <span className="font-mono text-primary-400">Claude + Gemini</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="text-white">{meta?.last_updated ? new Date(meta.last_updated).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'Today'}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:shadow-primary-500/50 hover:-translate-y-1">
              Search Another Product →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DossierPagePremium;
